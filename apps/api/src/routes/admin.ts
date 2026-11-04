import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";
import { AUDIT_LOG, DEFAULT_PLATFORM_CONFIG } from "../data/seed-data.js";
import { requirePermission } from "../rbac/guard.js";

const templateSchema = z.object({
  title: z.string().min(1, "A title is required"),
  country: z.string().min(1, "A country is required"),
  lang: z.string().min(1, "A language tag is required"),
  currency: z.string().min(1, "A currency is required"),
  vat: z.string().min(1, "A VAT rate is required"),
  psp: z.string().default(""),
  status: z.enum(["active", "draft"]).default("draft"),
});

const ruleUpdateSchema = z.object({
  active: z.boolean().optional(),
  severity: z.enum(["error", "warning"]).optional(),
});

const settingsSchema = z.object({
  platformName: z.string().min(1).optional(),
  supportEmail: z.string().pipe(z.email("Enter a valid email address")).optional(),
  defaultPM: z.string().optional(),
  notifyOnSubmit: z.boolean().optional(),
  notifyOnApprove: z.boolean().optional(),
  notifyOnReject: z.boolean().optional(),
  requireDualApproval: z.boolean().optional(),
  autoExportOnApprove: z.boolean().optional(),
  sessionTimeout: z.string().optional(),
  exportFormat: z.string().optional(),
});

function fieldErrorsFrom(issues: z.ZodError["issues"]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0]);
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function adminRoutes(app: FastifyInstance) {
  // ── Country templates ─────────────────────────────────────────────────
  app.get("/templates", { preHandler: requirePermission("template:read") }, async () => ({
    templates: await prisma.template.findMany({ orderBy: { id: "asc" } }),
  }));

  app.post("/templates", { preHandler: requirePermission("template:write") }, async (request, reply) => {
    const parsed = templateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(422).send({ message: "Check the form", fieldErrors: fieldErrorsFrom(parsed.error.issues) });
    }
    const template = await prisma.template.create({ data: { ...parsed.data, projects: 0 } });
    return reply.code(201).send({ template });
  });

  app.patch<{ Params: { id: string } }>(
    "/templates/:id",
    { preHandler: requirePermission("template:write") },
    async (request, reply) => {
      const parsed = templateSchema.partial().safeParse(request.body);
      if (!parsed.success) {
        return reply.code(422).send({ message: "Check the form", fieldErrors: fieldErrorsFrom(parsed.error.issues) });
      }
      const id = Number(request.params.id);
      if (!(await prisma.template.findUnique({ where: { id } }))) {
        return reply.code(404).send({ message: "No such template" });
      }
      return { template: await prisma.template.update({ where: { id }, data: parsed.data }) };
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/templates/:id",
    { preHandler: requirePermission("template:write") },
    async (request, reply) => {
      const id = Number(request.params.id);
      if (!(await prisma.template.findUnique({ where: { id } }))) {
        return reply.code(404).send({ message: "No such template" });
      }
      await prisma.template.delete({ where: { id } });
      return reply.code(204).send();
    },
  );

  // ── Validation rules ──────────────────────────────────────────────────
  // Only `active` and `severity` are editable. A rule's pattern and check live
  // in packages/shared, where both the wizard and this table read them; letting
  // an admin retype a pattern here would put the two back out of step.
  app.get("/rules", { preHandler: requirePermission("rule:read") }, async () => ({
    rules: await prisma.rule.findMany({ orderBy: { id: "asc" } }),
  }));

  /**
   * Just the enforcement flags, for anyone signed in.
   *
   * The wizard needs these to validate against what an admin configured, and
   * everyone fills in the wizard — gating them behind `rule:read` would mean a
   * Sales or Customer account silently enforcing different rules from an
   * Admin's. Which rules are switched on is configuration, not a secret; the
   * full table, with its descriptions and categories, stays privileged.
   */
  app.get("/rules/enforcement", async (request, reply) => {
    if (!request.authUser) return reply.code(401).send({ message: "Not signed in" });
    const rules = await prisma.rule.findMany({
      select: { id: true, active: true, severity: true },
      orderBy: { id: "asc" },
    });
    return { rules };
  });

  app.patch<{ Params: { id: string } }>(
    "/rules/:id",
    { preHandler: requirePermission("rule:write") },
    async (request, reply) => {
      const parsed = ruleUpdateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(422).send({ message: "Check the form", fieldErrors: fieldErrorsFrom(parsed.error.issues) });
      }
      const id = Number(request.params.id);
      if (!(await prisma.rule.findUnique({ where: { id } }))) {
        return reply.code(404).send({ message: "No such rule" });
      }
      return { rule: await prisma.rule.update({ where: { id }, data: parsed.data }) };
    },
  );

  // ── Platform settings ─────────────────────────────────────────────────
  app.get("/settings", { preHandler: requirePermission("settings:read") }, async () => {
    let settings = await prisma.platformSetting.findUnique({ where: { id: "platform" } });
    if (!settings) {
      settings = await prisma.platformSetting.upsert({
        where: { id: "platform" },
        update: {},
        create: { id: "platform", ...DEFAULT_PLATFORM_CONFIG },
      });
    }
    return { settings, config: settings };
  });

  app.patch("/settings", { preHandler: requirePermission("settings:write") }, async (request, reply) => {
    const parsed = settingsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(422).send({ message: "Check the form", fieldErrors: fieldErrorsFrom(parsed.error.issues) });
    }
    const settings = await prisma.platformSetting.update({ where: { id: "platform" }, data: parsed.data });
    return { settings, config: settings };
  });

  app.get("/audit-log", { preHandler: requirePermission("audit:read") }, async () => ({ entries: AUDIT_LOG }));

  // ── Notifications ─────────────────────────────────────────────────────
  app.get("/notifications", async (request, reply) => {
    if (!request.authUser) return reply.code(401).send({ message: "Not signed in" });
    return { notifications: await prisma.notification.findMany({ orderBy: { id: "asc" } }) };
  });

  app.post<{ Params: { id: string } }>("/notifications/:id/read", async (request, reply) => {
    if (!request.authUser) return reply.code(401).send({ message: "Not signed in" });
    const id = Number(request.params.id);
    if (!(await prisma.notification.findUnique({ where: { id } }))) {
      return reply.code(404).send({ message: "No such notification" });
    }
    return { notification: await prisma.notification.update({ where: { id }, data: { read: true } }) };
  });

  app.post("/notifications/read-all", async (request, reply) => {
    if (!request.authUser) return reply.code(401).send({ message: "Not signed in" });
    await prisma.notification.updateMany({ data: { read: true } });
    return { notifications: await prisma.notification.findMany({ orderBy: { id: "asc" } }) };
  });
}
