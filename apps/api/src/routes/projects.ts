import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { can, createOnboardingSchemas } from "@service-hub/shared";
import type { RuleOverrides } from "@service-hub/shared";
import type { OnboardingForm } from "@service-hub/shared";
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
 */
const SECRET_FIELDS = ["pspKey", "pspSecret", "uiPassword"] as const;

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

      const permissions = request.authUser!.permissions;
      const isAdmin = request.authUser?.roles?.includes("Admin");
      const canUpdate = can(permissions, "project:update");
      const canConfirmPayment = can(permissions, "payment:confirm");
      const canDeploy = can(permissions, "project:deploy");

      if (!isAdmin) {
        if (existing.status === "sales-approval" && parsed.data.status === "approved") {
          if (!canConfirmPayment) {
            return reply.code(403).send({ message: "Only Sales may confirm sales delivery" });
          }
        } else if (existing.status === "approved" && parsed.data.status === "onboarded") {
          if (!canDeploy) {
            return reply.code(403).send({ message: "Only DevOps may complete deployment" });
          }
        } else if (!canUpdate) {
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
    const result = schemas.onboardingDraftSchema.safeParse(request.body);
    if (!result.success) {
      return reply.code(422).send({
        message: "Check the form — some entries need attention",
        fieldErrors: schemas.toFormErrors(result.error),
      });
    }

    const draft = request.body as OnboardingForm;
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

    const stored = row.data as OnboardingForm;
    const draft = { ...stored };
    const secretsOnFile: string[] = [];
    for (const key of SECRET_FIELDS) {
      if (typeof stored[key] === "string" && stored[key]!.length > 0) secretsOnFile.push(key);
      delete draft[key];
    }
    return { draft, secretsOnFile, updatedAt: row.updatedAt };
  });

  app.put("/draft", { preHandler: requirePermission("project:update") }, async (request) => {
    const incoming = (request.body ?? {}) as OnboardingForm;
    const existing = await prisma.onboardingDraft.findUnique({ where: { userId: request.authUser!.id } });
    const stored = (existing?.data as OnboardingForm | undefined) ?? {};

    // A blank credential means "leave it alone", not "clear it" — the client is
    // never sent the current value, so it cannot echo one back.
    const merged: OnboardingForm = { ...incoming };
    for (const key of SECRET_FIELDS) {
      const supplied = incoming[key];
      if (typeof supplied === "string" && supplied.length > 0) continue;
      if (typeof stored[key] === "string") merged[key] = stored[key];
      else delete merged[key];
    }

    // Prisma's Json input type can't express OnboardingForm's template-literal
    // keys, so the shape is asserted here; it is validated on submit, which is
    // where correctness actually matters.
    const data = merged as unknown as Prisma.InputJsonObject;
    const row = await prisma.onboardingDraft.upsert({
      where: { userId: request.authUser!.id },
      update: { data },
      create: { userId: request.authUser!.id, data },
    });

    const saved = { ...(row.data as OnboardingForm) };
    const secretsOnFile: string[] = [];
    for (const key of SECRET_FIELDS) {
      if (typeof saved[key] === "string" && saved[key]!.length > 0) secretsOnFile.push(key);
      delete saved[key];
    }
    return { draft: saved, secretsOnFile, updatedAt: row.updatedAt };
  });

  app.delete("/draft", { preHandler: requireSignedIn }, async (request, reply) => {
    await prisma.onboardingDraft.deleteMany({ where: { userId: request.authUser!.id } });
    return reply.code(204).send();
  });
}
