/**
 * The transport the API layer sits on.
 *
 * There is no server yet, so this stands in for one: every call is async, takes
 * a moment, and hands back a deep copy rather than a live reference into the
 * store. The copy matters — without it a caller could mutate "server" state by
 * holding onto a returned object, which is a bug that would only appear once a
 * real backend made it impossible.
 *
 * Response validation is deliberately absent. Parsing is worth it when data
 * arrives from somewhere you don't control; parsing values this module just
 * produced would only be testing `structuredClone`. When the real endpoints
 * land, their schemas come from the package shared with the server rather than
 * being written a second time here.
 */

/** How long a call takes. Long enough for loading states to be real, short enough not to drag. */
const LATENCY_MS = 120;

/** A failed call. `fieldErrors` maps a field name to a message, mirroring a 422. */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Succeed with a detached copy of `value`. */
export async function ok<T>(value: T): Promise<T> {
  await sleep(LATENCY_MS);
  return structuredClone(value);
}

/** Succeed immediately, for reads a real client would answer locally (a session cookie, say). */
export function okNow<T>(value: T): Promise<T> {
  return Promise.resolve(structuredClone(value));
}

/** Fail the way the real endpoint would. */
export async function fail(
  status: number,
  message: string,
  fieldErrors?: Record<string, string>,
): Promise<never> {
  await sleep(LATENCY_MS);
  throw new ApiError(status, message, fieldErrors);
}
