import { createHmac, randomBytes } from "node:crypto";
import type { AuthUser } from "@service-hub/shared";
import { permissionsFor } from "@service-hub/shared";
import type { UserRole, UserStatus } from "@service-hub/shared";
import { prisma } from "../db.js";
import { env, isProduction } from "../env.js";

export const SESSION_COOKIE = "sh_session";

/**
 * The cookie carries a random token; the database stores only its HMAC. A
 * dumped database therefore contains no usable sessions, and rotating
 * SESSION_SECRET invalidates every one of them at once.
 */
function fingerprint(token: string): string {
  return createHmac("sha256", env.SESSION_SECRET).update(token).digest("hex");
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProduction,
  path: "/",
};

export async function createSession(userId: string, userAgent?: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 60 * 60 * 1000);
  await prisma.session.create({
    data: { userId, tokenHash: fingerprint(token), expiresAt, userAgent: userAgent?.slice(0, 255) },
  });
  return { token, expiresAt };
}

type UserRow = {
  id: string; email: string; name: string; initials: string; partner: string;
  color: string; status: string; roles: string[]; issuer: string;
  lastLoginAt?: Date | null;
  username?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  department?: string | null;
  country?: string | null;
  language?: string | null;
  timezone?: string | null;
  notificationSettings?: unknown;
  privacySettings?: unknown;
};

/** Shape a database row the way the client expects, deriving permissions from roles. */
export function toAuthUser(user: UserRow): AuthUser {
  const roles = user.roles as UserRole[];
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    initials: user.initials,
    partner: user.partner,
    color: user.color,
    status: user.status as UserStatus,
    roles,
    permissions: permissionsFor(roles),
    issuer: user.issuer,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    username: user.username ?? user.email.split("@")[0] ?? "user",
    phone: user.phone ?? undefined,
    jobTitle: user.jobTitle ?? undefined,
    company: user.company ?? user.partner ?? undefined,
    department: user.department ?? undefined,
    country: user.country ?? "DE",
    language: user.language ?? "en-GB",
    timezone: user.timezone ?? "Europe/Berlin",
    notificationSettings: (user.notificationSettings as Record<string, unknown>) ?? null,
    privacySettings: (user.privacySettings as Record<string, unknown>) ?? null,
  };
}

/**
 * Resolve a cookie token to its user. Permissions are re-derived here on every
 * request rather than read from the session, so a role change takes effect
 * without waiting for the user to sign in again.
 */
export async function readSession(token: string | undefined): Promise<AuthUser | null> {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: fingerprint(token) },
    include: { user: true },
  });
  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  if (session.user.status !== "active") return null;

  return toAuthUser(session.user);
}

export async function revokeSession(token: string | undefined): Promise<void> {
  if (!token) return;
  await prisma.session.deleteMany({ where: { tokenHash: fingerprint(token) } });
}

/** Used when a password changes: every other session for that user dies. */
export async function revokeAllSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}

export async function purgeExpiredSessions(): Promise<number> {
  const { count } = await prisma.session.deleteMany({ where: { expiresAt: { lte: new Date() } } });
  return count;
}
