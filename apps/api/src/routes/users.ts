import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { passwordSchema } from "@service-hub/shared";
import { prisma } from "../db.js";
import { hashPassword } from "../auth/password.js";
import { revokeAllSessions, toAuthUser } from "../auth/session.js";
import { requirePermission } from "../rbac/guard.js";

const ROLE_VALUES = [
  "Admin", "Project Manager", "Sales", "Reviewer", "DevOps", "Partner", "Customer",
] as const;

const rolesSchema = z.array(z.enum(ROLE_VALUES)).min(1, "Give the user at least one role");

const createUserSchema = z.object({
  email: z.string().min(1).pipe(z.email("Enter a valid email address")),
  name: z.string().min(1, "A name is required"),
  partner: z.string().default(""),
  roles: rolesSchema,
  password: passwordSchema.optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  partner: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  roles: rolesSchema.optional(),
});

function initialsFor(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase();
}

function invalid(issues: z.ZodError["issues"]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0]);
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

/** Refuse a change that would leave nobody able to administer the platform. */
async function wouldOrphanAdmins(userId: string): Promise<boolean> {
  const admins = await prisma.user.findMany({
    where: { roles: { has: "Admin" }, status: "active" },
    select: { id: true },
  });
  return admins.length <= 1 && admins.some((admin) => admin.id === userId);
}

export async function userRoutes(app: FastifyInstance) {
  app.get("/users", { preHandler: requirePermission("user:read") }, async () => {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
    return { users: users.map(toAuthUser) };
  });

  app.post("/users", { preHandler: requirePermission("user:write") }, async (request, reply) => {
    const parsed = createUserSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(422).send({ message: "Check the form", fieldErrors: invalid(parsed.error.issues) });
    }

    const email = parsed.data.email.trim().toLowerCase();
    if (await prisma.user.findUnique({ where: { email } })) {
      return reply.code(409).send({
        message: "That address already has an account",
        fieldErrors: { email: "That address already has an account" },
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name.trim(),
        initials: initialsFor(parsed.data.name),
        partner: parsed.data.partner,
        roles: parsed.data.roles,
        status: parsed.data.password ? "active" : "pending",
        passwordHash: parsed.data.password ? await hashPassword(parsed.data.password) : null,
      },
    });
    return reply.code(201).send({ user: toAuthUser(user) });
  });

  app.patch<{ Params: { id: string } }>(
    "/users/:id",
    { preHandler: requirePermission("user:write") },
    async (request, reply) => {
      const parsed = updateUserSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(422).send({ message: "Check the form", fieldErrors: invalid(parsed.error.issues) });
      }

      const target = await prisma.user.findUnique({ where: { id: request.params.id } });
      if (!target) return reply.code(404).send({ message: "No such user" });

      // Losing Admin, or going inactive, must not remove the last administrator.
      const losesAdmin = parsed.data.roles && !parsed.data.roles.includes("Admin");
      const goesInactive = parsed.data.status && parsed.data.status !== "active";
      if ((losesAdmin || goesInactive) && (await wouldOrphanAdmins(target.id))) {
        return reply.code(409).send({ message: "This is the last active administrator" });
      }

      const user = await prisma.user.update({
        where: { id: target.id },
        data: {
          ...parsed.data,
          ...(parsed.data.name ? { initials: initialsFor(parsed.data.name) } : {}),
        },
      });

      // A user who has been deactivated or had roles cut should not keep browsing
      // on the session they already hold.
      if (goesInactive || parsed.data.roles) await revokeAllSessions(user.id);

      return { user: toAuthUser(user) };
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/users/:id",
    { preHandler: requirePermission("user:write") },
    async (request, reply) => {
      const target = await prisma.user.findUnique({ where: { id: request.params.id } });
      if (!target) return reply.code(404).send({ message: "No such user" });
      if (target.id === request.authUser!.id) {
        return reply.code(409).send({ message: "You cannot delete your own account" });
      }
      if (await wouldOrphanAdmins(target.id)) {
        return reply.code(409).send({ message: "This is the last active administrator" });
      }

      await prisma.user.delete({ where: { id: target.id } });
      return reply.code(204).send();
    },
  );
}
