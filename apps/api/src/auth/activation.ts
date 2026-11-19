import { createHmac, randomBytes } from "node:crypto";
import { env } from "../env.js";
import { prisma } from "../db.js";

/**
 * Invitation links.
 *
 * An administrator creates an account without a password; the new person
 * follows a one-time link and chooses their own. The token is handled like a
 * session token: only its HMAC is stored, so a dumped database holds no usable
 * links, and the plain token exists only in the link the administrator copies
 * (or, once mail is wired up, in the invitation email).
 */

const LINK_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

export function fingerprintActivationToken(token: string): string {
  return createHmac("sha256", env.SESSION_SECRET).update(`activation:${token}`).digest("hex");
}

/**
 * Issue a fresh link for a user, replacing any earlier one. Returns the path
 * the web app serves; the client prefixes its own origin, since the API never
 * needs to know which address people reach the web app on.
 */
export async function issueActivationLink(userId: string): Promise<{ activationPath: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + LINK_LIFETIME_MS);
  await prisma.user.update({
    where: { id: userId },
    data: { activationTokenHash: fingerprintActivationToken(token), activationExpiresAt: expiresAt },
  });
  return { activationPath: `/activate?token=${token}`, expiresAt };
}

/** The pending user a token belongs to, or null if it is unknown, used or expired. */
export async function findByActivationToken(token: string) {
  if (!token) return null;
  const user = await prisma.user.findUnique({ where: { activationTokenHash: fingerprintActivationToken(token) } });
  if (!user || user.status !== "pending" || !user.activationExpiresAt || user.activationExpiresAt < new Date()) {
    return null;
  }
  return user;
}
