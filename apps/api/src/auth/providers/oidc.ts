import { env } from "../../env.js";
import { AuthenticationError, type ExternalIdentity } from "./types.js";

/**
 * OpenID Connect — the seam, not the implementation.
 *
 * Everything around it is already provider-agnostic: sessions, the user table,
 * roles, the guards. Turning this on means installing `openid-client`, filling
 * in the two functions below with an Authorization Code + PKCE flow, and
 * setting AUTH_PROVIDER=oidc. Nothing else in the codebase changes.
 *
 *   1. `beginLogin` builds the authorize URL (scope "openid email profile"),
 *      storing the PKCE verifier and state in a short-lived cookie.
 *   2. `completeLogin` exchanges the code, validates the ID token against the
 *      issuer's JWKS, and returns the claims below.
 *
 * `subject` must be the token's `sub`, never the email: addresses get
 * reassigned, and matching on them would hand one person another's account.
 * `linkOrCreateUser` then maps that subject to a row in our own user table.
 */

export function isOidcConfigured(): boolean {
  return Boolean(env.OIDC_ISSUER && env.OIDC_CLIENT_ID && env.OIDC_REDIRECT_URI);
}

export function beginLogin(): Promise<{ redirectUrl: string }> {
  throw new AuthenticationError(501, "OIDC sign-in is not configured on this deployment");
}

export function completeLogin(): Promise<ExternalIdentity> {
  throw new AuthenticationError(501, "OIDC sign-in is not configured on this deployment");
}
