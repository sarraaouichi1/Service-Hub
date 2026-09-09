import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { onboardingDraftSchema } from "@service-hub/shared";
import type { OnboardingForm } from "@service-hub/shared";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { requirePermission, requireSignedIn } from "../rbac/guard.js";

const STATUSES = ["draft", "progress", "review", "approved", "sales-approval", "onboarded"] as const;

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

  /** The signed-in person's working draft — what makes "Save Draft" real. */
  app.get("/draft", { preHandler: requireSignedIn }, async (request) => {
    const row = await prisma.onboardingDraft.findUnique({ where: { userId: request.authUser!.id } });
    return { draft: (row?.data as OnboardingForm | undefined) ?? null, updatedAt: row?.updatedAt ?? null };
  });

  app.put("/draft", { preHandler: requirePermission("project:update") }, async (request) => {
    // The draft is stored whole as JSON. Prisma's Json input type can't express
    // OnboardingForm's template-literal keys, so the shape is asserted here —
    // it is validated on submit, which is where correctness actually matters.
    const data = (request.body ?? {}) as unknown as Prisma.InputJsonObject;
    const row = await prisma.onboardingDraft.upsert({
      where: { userId: request.authUser!.id },
      update: { data },
      create: { userId: request.authUser!.id, data },
    });
    return { draft: row.data as OnboardingForm, updatedAt: row.updatedAt };
  });

  app.delete("/draft", { preHandler: requireSignedIn }, async (request, reply) => {
    await prisma.onboardingDraft.deleteMany({ where: { userId: request.authUser!.id } });
    return reply.code(204).send();
  });
}
