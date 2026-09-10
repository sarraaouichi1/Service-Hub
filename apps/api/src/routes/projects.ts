import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createOnboardingSchemas } from "@service-hub/shared";
import type { RuleOverrides } from "@service-hub/shared";
import type { OnboardingForm } from "@service-hub/shared";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { requirePermission, requireSignedIn } from "../rbac/guard.js";

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
  app.get("/projects", { preHandler: requirePermission("project:read") }, async () => {
    const projects = await prisma.project.findMany({ orderBy: { id: "asc" } });
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
    { preHandler: requirePermission("project:update") },
    async (request, reply) => {
      const parsed = updateProjectSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(422).send({ message: "Check the form", fieldErrors: fieldErrorsFrom(parsed.error.issues) });
      }
      const id = Number(request.params.id);
      if (!(await prisma.project.findUnique({ where: { id } }))) {
        return reply.code(404).send({ message: "No such project" });
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
    // the server enforces what the admin screen promises rather than whatever
    // was compiled in.
    const rows = await prisma.rule.findMany({ select: { id: true, active: true, severity: true } });
    const overrides: RuleOverrides = Object.fromEntries(
      rows.map((r) => [r.id, { active: r.active, severity: r.severity as "error" | "warning" }]),
    );
    const { onboardingDraftSchema } = createOnboardingSchemas(overrides);
    const result = onboardingDraftSchema.safeParse(request.body);
    if (!result.success) {
      return reply.code(422).send({
        message: "This submission is incomplete",
        fieldErrors: fieldErrorsFrom(result.error.issues),
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
        status: "review",
        psp: draft.psp ?? "",
        country: draft.country ?? "",
        product: draft.product ?? "smart-web-pay",
      },
    });
    return reply.code(201).send({ project });
  });

  /**
   * The signed-in person's working draft — what makes "Save Draft" real.
   *
   * Credentials are write-only: they can be set, never read back. The response
   * says *which* are on file so the wizard can show "stored" rather than an
   * empty box, but the values never leave the server. Until there is somewhere
   * proper to keep them, this at least stops them travelling to every browser
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
