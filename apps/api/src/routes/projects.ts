import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { can, createOnboardingSchemas, needsPaymentProvider, normalizeDraft, parseProducts } from "@service-hub/shared";
import type { RuleOverrides } from "@service-hub/shared";
import type { AuthUser, OnboardingForm } from "@service-hub/shared";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { requireAnyPermission, requirePermission, requireSignedIn } from "../rbac/guard.js";

const STATUSES = ["draft", "progress", "review", "approved", "sales-approval", "onboarded"] as const;

/**
 * Credentials the draft carries. They are accepted on a write and never
 * returned by a read, so they stop round-tripping through the browser.
 *
 * This is a floor, not a solution: they are still stored in the draft's JSON
 * rather than encrypted in a secret store, which is what a real PSP integration
 * needs. Anything added here must be added to that store too.
 *
 * Top-level ones are named directly; each cell computer carries its own UI
 * password, reported as `cellComputers.<key>.uiPassword`.
 */
const SECRET_FIELDS = ["pspKey", "pspSecret"] as const;
const CELL_SECRET_FIELDS = ["uiPassword"] as const;

/** A copy of the draft with every credential removed, and the list of those on file. */
export function withoutSecrets(stored: OnboardingForm): { draft: OnboardingForm; secretsOnFile: string[] } {
  const draft: OnboardingForm = { ...stored };
  const secretsOnFile: string[] = [];
  for (const key of SECRET_FIELDS) {
    if (typeof stored[key] === "string" && stored[key]!.length > 0) secretsOnFile.push(key);
    delete draft[key];
  }
  if (Array.isArray(stored.cellComputers)) {
    draft.cellComputers = stored.cellComputers.map((cell) => {
      const copy = { ...cell };
      for (const key of CELL_SECRET_FIELDS) {
        if (typeof cell[key] === "string" && cell[key].length > 0) secretsOnFile.push(`cellComputers.${cell.key}.${key}`);
        copy[key] = "";
      }
      return copy;
    });
  }
  return { draft, secretsOnFile };
}

/**
 * A blank credential means "leave it alone", not "clear it" — the client is
 * never sent the current value, so it cannot echo one back. Cell computers are
 * matched by their stable key, so reordering or renaming one keeps its password.
 */
export function mergeSecrets(incoming: OnboardingForm, stored: OnboardingForm): OnboardingForm {
  const merged: OnboardingForm = { ...incoming };
  for (const key of SECRET_FIELDS) {
    const supplied = incoming[key];
    if (typeof supplied === "string" && supplied.length > 0) continue;
    if (typeof stored[key] === "string") merged[key] = stored[key];
    else delete merged[key];
  }
  if (Array.isArray(incoming.cellComputers)) {
    const storedCells = new Map((stored.cellComputers ?? []).map((c) => [c.key, c]));
    merged.cellComputers = incoming.cellComputers.map((cell) => {
      const copy = { ...cell };
      for (const key of CELL_SECRET_FIELDS) {
        if (typeof cell[key] === "string" && cell[key].length > 0) continue;
        copy[key] = storedCells.get(cell.key)?.[key] ?? "";
      }
      return copy;
    });
  }
  return merged;
}

/**
 * Whether this person may see a given project's details. S&B roles hold
 * project:read-any; partners and customers see the projects they submitted.
 */
function canSeeProject(user: AuthUser, project: { createdById: string | null }) {
  return can(user.permissions, "project:read-any") || project.createdById === user.id;
}

/**
 * Status moves and the one permission each needs. A status change not listed
 * here is refused for everyone but an administrator: `project:update` edits a
 * project's details, it does not let anyone skip the Sales or DevOps step.
 */
const TRANSITIONS: Record<string, { to: string; permission: "payment:confirm" | "project:deploy" | "project:approve"; message: string }[]> = {
  "sales-approval": [{ to: "approved", permission: "payment:confirm", message: "Only Sales may confirm sales delivery" }],
  review: [{ to: "approved", permission: "project:approve", message: "Only a reviewer may approve" }],
  approved: [{ to: "onboarded", permission: "project:deploy", message: "Only DevOps may complete deployment" }],
};

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  partner: z.string().optional(),
  pm: z.string().optional(),
  step: z.number().int().min(0).optional(),
  status: z.enum(STATUSES).optional(),
});

function fieldErrorsFrom(issues: z.ZodError["issues"]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0]);
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function projectRoutes(app: FastifyInstance) {
  // ── Project portfolio ──────────────────────────────────────────────────
  app.get("/projects", { preHandler: requirePermission("project:read") }, async (request) => {
    let projects = await prisma.project.findMany({ orderBy: { id: "asc" } });

    // Filter projects by country for Partner and Customer roles
    const isPartnerOrCustomer = request.authUser?.roles?.some(r => r === "Partner" || r === "Customer");
    const userPartner = (request.authUser?.partner || "").toUpperCase();

    // Map partner to country code
    let userCountry = "";
    if (userPartner.includes("UK")) userCountry = "UK";
    else if (userPartner.includes("DE") || userPartner.includes("GERMANY")) userCountry = "DE";
    else if (userPartner.includes("FR") || userPartner.includes("FRANCE")) userCountry = "FR";
    else if (userPartner.includes("AT") || userPartner.includes("AUSTRIA")) userCountry = "AT";
    else if (userPartner.includes("CH") || userPartner.includes("SWITZERLAND")) userCountry = "CH";
    else if (userPartner.includes("NL") || userPartner.includes("NETHERLANDS") || userPartner.includes("HOLLAND")) userCountry = "NL";
    else if (userPartner.includes("BE") || userPartner.includes("BELGIUM")) userCountry = "BE";
    else if (userPartner.includes("ES") || userPartner.includes("SPAIN")) userCountry = "ES";
    else if (userPartner.includes("IT") || userPartner.includes("ITALY")) userCountry = "IT";
    else if (userPartner.includes("MEDWAY") || userPartner.includes("HOSPITAL")) userCountry = "UK";

    if (isPartnerOrCustomer && userCountry) {
      const matchCountry = (projectCountry: string) => {
        const pC = (projectCountry || "").toUpperCase();
        if (userCountry === "UK" && (pC === "UK" || pC === "GB" || pC.includes("UNITED KINGDOM"))) return true;
        if (userCountry === "DE" && (pC === "DE" || pC === "GERMANY" || pC === "DEUTSCHLAND")) return true;
        if (userCountry === "FR" && (pC === "FR" || pC === "FRANCE")) return true;
        if (userCountry === "AT" && pC === "AUSTRIA") return true;
        if (userCountry === "CH" && pC === "SWITZERLAND") return true;
        if (userCountry === "NL" && (pC === "NETHERLANDS" || pC === "HOLLAND")) return true;
        return pC.includes(userCountry) || userCountry.includes(pC);
      };
      projects = projects.filter(p => matchCountry(p.country));
    }

    // Sort projects by country, then by name
    projects.sort((a, b) => {
      const cA = (a.country || "").toUpperCase();
      const cB = (b.country || "").toUpperCase();
      if (cA !== cB) return cA.localeCompare(cB);
      return a.name.localeCompare(b.name);
    });

    return { projects };
  });

  app.get<{ Params: { id: string } }>(
    "/projects/:id",
    { preHandler: requirePermission("project:read") },
    async (request, reply) => {
      const project = await prisma.project.findUnique({ where: { id: Number(request.params.id) } });
      if (!project) return reply.code(404).send({ message: "No such project" });
      return { project };
    },
  );

  /**
   * The full configuration a project was submitted with, for the one-page
   * configuration view and its copy button. Credentials are stripped exactly
   * as they are from a draft.
   */
  app.get<{ Params: { id: string } }>(
    "/projects/:id/configuration",
    { preHandler: requirePermission("project:read") },
    async (request, reply) => {
      const project = await prisma.project.findUnique({ where: { id: Number(request.params.id) } });
      // 404 rather than 403 for someone else's project, so ids can't be probed.
      if (!project || !canSeeProject(request.authUser!, project)) {
        return reply.code(404).send({ message: "No such project" });
      }
      if (!project.data) {
        return { configuration: null, secretsOnFile: [], submittedAt: project.createdAt };
      }
      const { draft, secretsOnFile } = withoutSecrets(normalizeDraft(project.data as OnboardingForm));
      return { configuration: draft, secretsOnFile, submittedAt: project.createdAt };
    },
  );

  app.patch<{ Params: { id: string } }>(
    "/projects/:id",
    { preHandler: requireAnyPermission("project:update", "payment:confirm", "project:deploy") },
    async (request, reply) => {
      const parsed = updateProjectSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(422).send({ message: "Check the form", fieldErrors: fieldErrorsFrom(parsed.error.issues) });
      }
      const id = Number(request.params.id);
      const existing = await prisma.project.findUnique({ where: { id } });
      if (!existing) {
        return reply.code(404).send({ message: "No such project" });
      }

      const user = request.authUser!;
      const isAdmin = user.roles?.includes("Admin");
      const { status, ...details } = parsed.data;

      if (!isAdmin) {
        if (!canSeeProject(user, existing)) {
          return reply.code(404).send({ message: "No such project" });
        }
        if (status !== undefined && status !== existing.status) {
          const move = TRANSITIONS[existing.status]?.find((t) => t.to === status);
          if (!move) {
            return reply.code(403).send({ message: `A project cannot move from ${existing.status} to ${status}` });
          }
          if (!can(user.permissions, move.permission)) {
            return reply.code(403).send({ message: move.message });
          }
        }
        if (Object.keys(details).length > 0 && !can(user.permissions, "project:update")) {
          return reply.code(403).send({ message: "You do not have permission to do that" });
        }
      }

      return { project: await prisma.project.update({ where: { id }, data: parsed.data }) };
    },
  );

  /**
   * Submitting a draft.
   *
   * The schema runs here as well as in the wizard, and that repetition is the
   * point: a client can always be bypassed, so the boundary checks for itself.
   * A rejection comes back as a 422 with per-field messages, the shape `Field`
   * renders — so a server rejection and a client-side error share one slot.
   */
  app.post("/projects/submit", { preHandler: requirePermission("project:submit") }, async (request, reply) => {
    // Validated against the rules as an administrator has them configured, so
    // switching a rule off on the admin screen actually stops the server
    // enforcing it.
    const overrides: RuleOverrides = {};
    for (const row of await prisma.rule.findMany()) {
      overrides[row.id] = {
        active: row.active,
        severity: row.severity as "error" | "warning",
      };
    }
    const schemas = createOnboardingSchemas(overrides);
    // Credentials typed in an earlier session live only in the saved draft, so
    // fold them back in before checking — the form never had them to resend.
    const savedDraft = await prisma.onboardingDraft.findUnique({ where: { userId: request.authUser!.id } });
    const draft = mergeSecrets(
      normalizeDraft(request.body as OnboardingForm),
      normalizeDraft((savedDraft?.data as OnboardingForm | undefined) ?? {}),
    );
    const result = schemas.onboardingDraftSchema.safeParse(draft);
    if (!result.success) {
      return reply.code(422).send({
        message: "Check the form — some entries need attention",
        fieldErrors: schemas.toFormErrors(result.error),
      });
    }

    // A product without payments has no business carrying a PSP — values left
    // over from an earlier product choice would otherwise ride along unseen.
    if (!needsPaymentProvider(parseProducts(draft.product))) {
      for (const key of Object.keys(draft) as (keyof OnboardingForm)[]) {
        if (["psp", "pspMid", "pspTid", "pspKey", "pspSecret"].includes(key) || String(key).startsWith("pm_")) delete draft[key];
      }
    }

    const project = await prisma.project.create({
      data: {
        name: draft.opName ?? "Untitled onboarding",
        partner: request.authUser!.partner || (draft.opName ?? "—"),
        pm: request.authUser!.name,
        step: 6,
        total: 6,
        status: "sales-approval",
        psp: draft.psp ?? "",
        country: draft.country ?? "",
        product: draft.product ?? "smart-web-pay",
        data: draft as unknown as Prisma.InputJsonObject,
        createdById: request.authUser!.id,
      },
    });

    // Clear working draft after submission
    await prisma.onboardingDraft.deleteMany({ where: { userId: request.authUser!.id } });
    return reply.code(201).send({ project });
  });

  /**
   * The signed-in person's working draft — what makes "Save Draft" real.
   *
   * Credentials on file are reported as a list of field names rather than values,
   * so the browser knows to render "stored" rather than an empty box. Loading
   * returns the draft as JSON so the client can seed the form; the form then
   * owns the edits and sends the whole thing back on Save.
   *
   * A project being edited is loaded over this same route: the caller passes
   * `?project=123`, the API copies that project's draft into the user's slot and
   * that opens the draft.
   */
  app.get("/draft", { preHandler: requireSignedIn }, async (request) => {
    const row = await prisma.onboardingDraft.findUnique({ where: { userId: request.authUser!.id } });
    if (!row) return { draft: null, secretsOnFile: [], updatedAt: null };

    const { draft, secretsOnFile } = withoutSecrets(normalizeDraft(row.data as OnboardingForm));
    return { draft, secretsOnFile, updatedAt: row.updatedAt };
  });

  app.put("/draft", { preHandler: requirePermission("project:update") }, async (request) => {
    const incoming = normalizeDraft((request.body ?? {}) as OnboardingForm);
    const existing = await prisma.onboardingDraft.findUnique({ where: { userId: request.authUser!.id } });
    const stored = normalizeDraft((existing?.data as OnboardingForm | undefined) ?? {});
    const merged = mergeSecrets(incoming, stored);

    // Prisma's Json input type can't express OnboardingForm's template-literal
    // keys, so the shape is asserted here; it is validated on submit, which is
    // where correctness actually matters.
    const data = merged as unknown as Prisma.InputJsonObject;
    const row = await prisma.onboardingDraft.upsert({
      where: { userId: request.authUser!.id },
      update: { data },
      create: { userId: request.authUser!.id, data },
    });

    const { draft: saved, secretsOnFile } = withoutSecrets(row.data as OnboardingForm);
    return { draft: saved, secretsOnFile, updatedAt: row.updatedAt };
  });

  app.delete("/draft", { preHandler: requireSignedIn }, async (request, reply) => {
    await prisma.onboardingDraft.deleteMany({ where: { userId: request.authUser!.id } });
    return reply.code(204).send();
  });
}
