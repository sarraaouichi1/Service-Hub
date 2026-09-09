import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Password hashing.
 *
 * scrypt from Node's standard library rather than argon2 or bcrypt: it is a
 * proper memory-hard KDF, and being built in means no native module to compile
 * in the container. The stored string carries its own parameters, so they can
 * be raised later without invalidating existing hashes — verification reads
 * whatever the hash was made with.
 */

const scrypt = promisify(scryptCallback) as (
  password: string, salt: Buffer, keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const PARAMS = { N: 2 ** 15, r: 8, p: 1, maxmem: 96 * 1024 * 1024 };

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, PARAMS);
  return [
    "scrypt", PARAMS.N, PARAMS.r, PARAMS.p,
    salt.toString("base64"), derived.toString("base64"),
  ].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, n, r, p, saltB64, hashB64] = parts;
  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");
  const options = { N: Number(n), r: Number(r), p: Number(p), maxmem: PARAMS.maxmem };
  if (!Number.isFinite(options.N) || !Number.isFinite(options.r) || !Number.isFinite(options.p)) {
    return false;
  }

  const derived = await scrypt(password.normalize("NFKC"), salt, expected.length, options);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

/**
 * Burned through when no account matches, so a wrong address and a wrong
 * password take about the same time. Without it, response timing tells an
 * attacker which addresses are real.
 */
export async function wastePasswordTime(password: string): Promise<void> {
  const salt = randomBytes(16);
  await scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, PARAMS);
}
