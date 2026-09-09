import { ApiError } from "./client";

/**
 * Talks to the API.
 *
 * Requests go to a same-origin `/api` path — nginx proxies it in the container,
 * Vite proxies it in development — so the session cookie is a first-party
 * cookie and CORS never comes into it. `credentials: "include"` is what sends
 * that cookie; without it every call would look signed out.
 *
 * A failed response is turned into the same `ApiError` the local modules throw,
 * so callers handle one error type regardless of where the data came from.
 */
const BASE = "/api";

interface ErrorBody {
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(BASE + path, { ...init, headers, credentials: "include" });
  } catch {
    // A network failure is not a 500 — the request never arrived.
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }

  const text = await response.text();
  const body = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const problem = (body ?? {}) as ErrorBody;
    throw new ApiError(
      response.status,
      problem.message ?? `Request failed (${response.status})`,
      problem.fieldErrors,
    );
  }

  return body as T;
}
