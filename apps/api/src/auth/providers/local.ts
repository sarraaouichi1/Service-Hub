import { prisma } from "../../db.js";
import { verifyPassword, wastePasswordTime } from "../password.js";
import { AuthenticationError, type ExternalIdentity } from "./types.js";

/**
 * Email and password, checked against our own user table.
 *
 * Every failure returns the same message. Telling the caller whether the
 * address exists turns the login form into a directory of who has an account.
 */
const GENERIC_FAILURE = "Email or password is incorrect";

export async function authenticateLocal(
  email: string,
  password: string,
): Promise<ExternalIdentity> {
  const address = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: address } });

  if (!user?.passwordHash) {
    // No account, or an account that can only sign in through a provider.
    // Hash anyway so the reply takes as long as a real check.
    await wastePasswordTime(password);
    throw new AuthenticationError(401, GENERIC_FAILURE, { password: GENERIC_FAILURE });
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    throw new AuthenticationError(401, GENERIC_FAILURE, { password: GENERIC_FAILURE });
  }

  if (user.status !== "active") {
    throw new AuthenticationError(403, "This account is not active", {
      email: "This account is not active",
    });
  }

  return {
    issuer: "local",
    subject: user.id,
    email: user.email,
    emailVerified: true,
    name: user.name,
  };
}
