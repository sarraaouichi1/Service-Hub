import type { PlatformUser } from "../types";
import { PLATFORM_USERS } from "../data/users";
import { fail, ok, okNow } from "./client";

/**
 * Sign-in for the Service Hub.
 *
 * This establishes *identity*, not authentication. There is no server to verify
 * anything against, so it asks for an email and looks it up in the known user
 * directory — nothing is proven, and it must not be relied on to keep anyone
 * out. A password box here would be checked in the browser, which would look
 * like security while providing none, so there isn't one.
 *
 * It exists as its own module so that swapping it for OIDC is a change to this
 * file and nothing else: the rest of the app only knows `signIn`, `signOut`,
 * `getSession` and the `Session` shape. Under OIDC, `signIn` becomes a redirect
 * to the identity provider and `getSession` reads the resulting token.
 */

const SESSION_KEY = "servicehub.session";

export interface Session {
  user: PlatformUser;
  signedInAt: string;
}

/** Session storage can throw outright where site data is blocked, so every access is guarded. */
function readStored(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return parsed?.user?.email ? parsed : null;
  } catch {
    return null;
  }
}

function writeStored(session: Session | null) {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // A session that can't be persisted still works for this tab's lifetime.
  }
}

/**
 * The signed-in session, or null. Answered locally and without delay, the way a
 * real client reads a cookie rather than asking the server on every navigation.
 */
export function getSession(): Promise<Session | null> {
  return okNow(readStored());
}

export async function signIn(email: string): Promise<Session> {
  const address = email.trim().toLowerCase();
  if (!address) {
    return fail(422, "Enter your email address", { email: "Enter your email address" });
  }

  const user = PLATFORM_USERS.find((candidate) => candidate.email.toLowerCase() === address);
  if (!user) {
    return fail(401, "No account found for that address", {
      email: "No account found for that address",
    });
  }

  const session: Session = { user, signedInAt: new Date().toISOString() };
  writeStored(session);
  return ok(session);
}

export async function signOut(): Promise<void> {
  writeStored(null);
  await ok(null);
}

/** The addresses that can sign in. Shown on the login screen while there is no real directory. */
export function knownAddresses(): Promise<PlatformUser[]> {
  return okNow(PLATFORM_USERS);
}
