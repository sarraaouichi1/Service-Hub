import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { changePasswordSchema, loginSchema } from "@service-hub/shared";
import { prisma } from "../db.js";
import { env } from "../env.js";
import { requireSignedIn } from "../rbac/guard.js";
import { hashPassword, verifyPassword } from "./password.js";
import { authenticateLocal } from "./providers/local.js";
import { beginLogin, isOidcConfigured } from "./providers/oidc.js";
import { AuthenticationError } from "./providers/types.js";
import { checkLoginRate, clearLoginAttempts, recordFailedLogin } from "./rateLimit.js";
import { linkOrCreateUser } from "./provisioning.js";
import {
  SESSION_COOKIE, cookieOptions, createSession,
  revokeAllSessions, revokeSession, toAuthUser,
} from "./session.js";

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  name: z.string().optional(),
  username: z.string().optional(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  department: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
});

export async function authRoutes(app: FastifyInstance) {
  /** What the login screen needs to know before drawing itself. */
  app.get("/auth/config", async () => ({
    provider: env.AUTH_PROVIDER,
    oidcConfigured: isOidcConfigured(),
  }));

  app.get("/auth/me", async (request, reply) => {
    if (!request.authUser) return reply.code(401).send({ message: "Not signed in" });
    return { user: request.authUser };
  });

  app.patch(
    "/auth/me",
    { preHandler: requireSignedIn },
    async (request, reply) => {
      const parsed = updateProfileSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(422).send({ message: "Invalid profile data" });
      }

      const { firstName, lastName, name: rawName, username, phone, jobTitle, company, department, language, timezone } = parsed.data;

      let name = request.authUser!.name;
      let initials = request.authUser!.initials;

      if (rawName) {
        name = rawName.trim();
        initials = name.split(/\s+/).slice(0, 2).map((p) => p[0] ?? "").join("").toUpperCase() || "U";
      } else if (firstName !== undefined || lastName !== undefined) {
        const currentParts = request.authUser!.name.split(" ");
        const newFirst = firstName !== undefined ? firstName.trim() : (currentParts[0] ?? "");
        const newLast = lastName !== undefined ? lastName.trim() : currentParts.slice(1).join(" ");
        name = `${newFirst} ${newLast}`.trim();
        initials = name.split(/\s+/).slice(0, 2).map((p) => p[0] ?? "").join("").toUpperCase() || "U";
      }

      const updated = await prisma.user.update({
        where: { id: request.authUser!.id },
        data: {
          name,
          initials,
          ...(username !== undefined ? { username: username.trim() } : {}),
          ...(phone !== undefined ? { phone: phone.trim() } : {}),
          ...(jobTitle !== undefined ? { jobTitle: jobTitle.trim() } : {}),
          ...(company !== undefined ? { company: company.trim() } : {}),
          ...(department !== undefined ? { department: department.trim() } : {}),
          ...(language !== undefined ? { language } : {}),
          ...(timezone !== undefined ? { timezone } : {}),
        },
      });

      return { user: toAuthUser(updated) };
    },
  );

  app.post("/auth/login", async (request, reply) => {
    if (env.AUTH_PROVIDER === "oidc") {
      // The browser is redirected to the provider instead of posting credentials.
      const { redirectUrl } = await beginLogin();
      return reply.code(200).send({ redirectUrl });
    }

    // Throttled before the password is checked, so a blocked caller learns
    // nothing and costs nothing to turn away.
    const attempted = (request.body as { email?: string } | undefined)?.email;
    const throttled = checkLoginRate(request, reply, attempted);
    if (throttled) return throttled;

    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      recordFailedLogin(request, attempted);
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return reply.code(422).send({ message: "Check the form", fieldErrors });
    }

    try {
      const identity = await authenticateLocal(parsed.data.email, parsed.data.password);
      const user = await linkOrCreateUser(identity);
      const { token, expiresAt } = await createSession(user.id, request.headers["user-agent"]);

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      clearLoginAttempts(parsed.data.email);
      reply.setCookie(SESSION_COOKIE, token, { ...cookieOptions, expires: expiresAt });
      return { user: toAuthUser(user), expiresAt };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        recordFailedLogin(request, parsed.data.email);
        return reply.code(error.status).send({
          message: error.message,
          fieldErrors: error.fieldErrors,
        });
      }
      throw error;
    }
  });

  app.post("/auth/logout", async (request, reply) => {
    await revokeSession(request.cookies[SESSION_COOKIE]);
    reply.clearCookie(SESSION_COOKIE, cookieOptions);
    return { ok: true };
  });

  app.post(
    "/auth/change-password",
    { preHandler: requireSignedIn },
    async (request, reply) => {
      const parsed = changePasswordSchema.safeParse(request.body);
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const key = String(issue.path[0]);
          if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
        }
        return reply.code(422).send({ message: "Check the form", fieldErrors });
      }

      const user = await prisma.user.findUnique({ where: { id: request.authUser!.id } });
      if (!user?.passwordHash) {
        return reply.code(400).send({ message: "This account does not use a password" });
      }
      if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
        return reply.code(403).send({
          message: "Current password is incorrect",
          fieldErrors: { currentPassword: "Current password is incorrect" },
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hashPassword(parsed.data.newPassword) },
      });

      // Everything signed in with the old password is done, this tab included.
      await revokeAllSessions(user.id);
      reply.clearCookie(SESSION_COOKIE, cookieOptions);
      return { ok: true, reauthenticate: true };
    },
  );
}
