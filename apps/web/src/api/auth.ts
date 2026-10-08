import type { AuthUser } from "@service-hub/shared";
import { ApiError } from "./client";
import { request } from "./http";

/**
 * Sign-in, against the real API.
 *
 * The session lives in an httpOnly cookie, so this module never sees or stores
 * a token — the browser attaches it and script cannot read it. What is cached
 * here is only the answer to "who am I", to keep route guards from asking the
 * server on every navigation; every write invalidates it.
 *
 * Which identity provider is in use is the server's business. Moving to OIDC
 * changes `signIn` to follow the redirect the server hands back, and nothing
 * else in the app.
 */
export interface Session {
  user: AuthUser;
  expiresAt?: string;
}

let cached: Promise<Session | null> | null = null;

async function fetchSession(): Promise<Session | null> {
  try {
    const body = await request<{ user: AuthUser }>("/auth/me");
    return { user: body.user };
  } catch (error) {
    // 401 is the ordinary "signed out" answer. Status 0 means the request never
    // arrived — treat an unreachable API as signed out too, so a server outage
    // lands the user on the sign-in screen (where the attempt reports the real
    // reason) instead of throwing out of a route guard onto a blank page.
    if (error instanceof ApiError && (error.status === 401 || error.status === 0)) return null;
    throw error;
  }
}

/** The signed-in session, or null. Cached until something changes it. */
export function getSession(options: { refresh?: boolean } = {}): Promise<Session | null> {
  if (!cached || options.refresh) cached = fetchSession();
  return cached;
}

export function forgetSession(): void {
  cached = null;
}

export async function signIn(email: string, password: string): Promise<Session> {
  const body = await request<{ user: AuthUser; expiresAt: string; redirectUrl?: string }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
  );

  // Under an identity provider the server answers with somewhere to go rather
  // than a session, and the flow continues at the provider.
  if (body.redirectUrl) {
    window.location.assign(body.redirectUrl);
    return new Promise<Session>(() => {});
  }

  const session: Session = { user: body.user, expiresAt: body.expiresAt };
  cached = Promise.resolve(session);
  return session;
}

export async function signOut(): Promise<void> {
  try {
    await request<{ ok: boolean }>("/auth/logout", { method: "POST" });
  } finally {
    forgetSession();
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await request<{ ok: boolean }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  // Changing a password ends every session, including this one.
  forgetSession();
}

export async function updateMyProfile(patch: {
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  jobTitle?: string;
  company?: string;
  department?: string;
  language?: string;
  timezone?: string;
}): Promise<AuthUser> {
  const body = await request<{ user: AuthUser }>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  cached = Promise.resolve({ user: body.user });
  return body.user;
}
