import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../env.js";

/**
 * Throttles sign-in attempts.
 *
 * Only *failures* count. Someone signing in correctly, however often, is never
 * throttled — the thing worth limiting is guessing, and counting successes
 * would punish a busy shared office for being busy.
 *
 * Counted per email address and per client IP, because either alone leaves a
 * hole: limiting by address only lets one host walk the whole directory a few
 * guesses at a time, and limiting by IP only lets a botnet spread one account's
 * guesses across many hosts. The IP allowance is deliberately much larger,
 * since a single address behind NAT can legitimately be dozens of people.
 *
 * This lives in memory, which is honest about what it is: it protects a single
 * instance and resets when the process does. Running more than one API instance
 * means moving these counters to Redis — the shape here doesn't change.
 */
const WINDOW_MS = env.LOGIN_RATE_WINDOW_MINUTES * 60 * 1000;
const EMAIL_LIMIT = env.LOGIN_RATE_LIMIT;
const IP_LIMIT = env.LOGIN_RATE_LIMIT * 5;

interface Bucket {
  failures: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const sweep = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, WINDOW_MS);
sweep.unref();

function current(key: string): Bucket | undefined {
  const bucket = buckets.get(key);
  if (!bucket) return undefined;
  if (bucket.resetAt <= Date.now()) {
    buckets.delete(key);
    return undefined;
  }
  return bucket;
}

function keysFor(request: FastifyRequest, email: string | undefined) {
  const keys: { key: string; limit: number }[] = [{ key: `ip:${request.ip}`, limit: IP_LIMIT }];
  if (email?.trim()) keys.push({ key: `email:${email.trim().toLowerCase()}`, limit: EMAIL_LIMIT });
  return keys;
}

/**
 * Turns the caller away when they have already failed too often. Returns a
 * reply to send, or undefined to let the attempt proceed.
 */
export function checkLoginRate(
  request: FastifyRequest,
  reply: FastifyReply,
  email: string | undefined,
): FastifyReply | undefined {
  let retryAfter = 0;
  for (const { key, limit } of keysFor(request, email)) {
    const bucket = current(key);
    if (bucket && bucket.failures >= limit) {
      retryAfter = Math.max(retryAfter, Math.ceil((bucket.resetAt - Date.now()) / 1000));
    }
  }
  if (retryAfter === 0) return undefined;

  request.log.warn({ ip: request.ip }, "sign-in rate limit reached");
  const minutes = Math.max(1, Math.ceil(retryAfter / 60));
  return reply
    .code(429)
    .header("retry-after", String(retryAfter))
    .send({
      message: `Too many failed sign-in attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    });
}

/** Call after a rejected attempt — this is the only thing that counts. */
export function recordFailedLogin(request: FastifyRequest, email: string | undefined): void {
  const now = Date.now();
  for (const { key } of keysFor(request, email)) {
    const bucket = current(key);
    if (bucket) bucket.failures += 1;
    else buckets.set(key, { failures: 1, resetAt: now + WINDOW_MS });
  }
}

/** A correct sign-in wipes that address's history, so near-misses don't linger. */
export function clearLoginAttempts(email: string): void {
  buckets.delete(`email:${email.trim().toLowerCase()}`);
}

/** Test seam: lets a suite start from a known state. */
export function resetLoginRateLimits(): void {
  buckets.clear();
}
