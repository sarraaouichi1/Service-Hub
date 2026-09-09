/**
 * The boundary between the app and the server.
 *
 * Components don't call these directly — they go through the hooks in
 * `src/queries`, which add caching and invalidation. These stay plain async
 * functions so they remain usable outside React and so the fetching library
 * can change without touching call sites.
 */
export { ApiError } from "./client";
export type { Session } from "./auth";
export { getSession, signIn, signOut, forgetSession, changePassword } from "./auth";
export * from "./resources";
