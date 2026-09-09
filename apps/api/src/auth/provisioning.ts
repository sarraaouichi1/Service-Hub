import type { UserRole } from "@service-hub/shared";
import { prisma } from "../db.js";
import { AuthenticationError } from "./providers/types.js";
import type { ExternalIdentity } from "./providers/types.js";

/** Roles a brand-new provider account starts with. Deliberately the weakest. */
const DEFAULT_ROLES: UserRole[] = ["Customer"];

function initialsFor(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase();
}

/**
 * Map an external identity onto our own user row, creating one if needed.
 *
 * This is what makes "use their user directory or ours" a non-question: there
 * is always a row here, and the provider only supplies the identity attached to
 * it. Matching runs in order —
 *
 *   1. issuer + subject, the only stable key;
 *   2. a *verified* email, which links an existing local account to the
 *      provider the first time that person signs in through it;
 *   3. otherwise create the account, with the weakest roles.
 *
 * Step 2 requires the email to be verified by the provider. Without that check,
 * anyone able to set an unverified address at the provider could claim an
 * existing account.
 */
export async function linkOrCreateUser(identity: ExternalIdentity) {
  const email = identity.email.trim().toLowerCase();

  const bySubject = await prisma.user.findFirst({
    where: { issuer: identity.issuer, externalId: identity.subject },
  });
  if (bySubject) return bySubject;

  if (identity.issuer === "local") {
    const local = await prisma.user.findUnique({ where: { email } });
    if (!local) throw new AuthenticationError(401, "Email or password is incorrect");
    return local;
  }

  if (identity.emailVerified) {
    const byEmail = await prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      return prisma.user.update({
        where: { id: byEmail.id },
        data: { issuer: identity.issuer, externalId: identity.subject },
      });
    }
  }

  const name = identity.name?.trim() || email;
  return prisma.user.create({
    data: {
      email,
      name,
      initials: initialsFor(name),
      issuer: identity.issuer,
      externalId: identity.subject,
      roles: DEFAULT_ROLES,
      status: "active",
    },
  });
}
