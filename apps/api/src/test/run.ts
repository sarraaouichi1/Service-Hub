/**
 * Integration tests for authentication and RBAC.
 *
 * Runs the real server against the real database — the interesting behaviour
 * here is in Fastify hooks, cookies and Prisma queries, none of which a unit
 * test with those parts replaced would actually exercise.
 */
import { buildServer } from "../server.js";
import { prisma } from "../db.js";

let failed = 0;
const check = (label: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n        got:  ${JSON.stringify(got)}\n        want: ${JSON.stringify(want)}`}`);
};

const ADMIN = "k.harperscheidt@scheidt-bachmann.de";
const CUSTOMER = "medwayft.carparking@nhs.net";
const PASSWORD = process.env.SEED_PASSWORD ?? "ChangeMe123!dev";

async function main() {
  const app = await buildServer();
  await app.listen({ port: 0, host: "127.0.0.1" });
  const base = `http://127.0.0.1:${(app.server.address() as { port: number }).port}`;

  const call = async (path: string, init: RequestInit & { cookie?: string } = {}) => {
    const headers = new Headers(init.headers);
    headers.set("origin", process.env.WEB_ORIGIN ?? "http://localhost:5173");
    if (init.body) headers.set("content-type", "application/json");
    if (init.cookie) headers.set("cookie", init.cookie);
    const res = await fetch(base + path, { ...init, headers });
    const text = await res.text();
    return {
      status: res.status,
      setCookie: res.headers.get("set-cookie") ?? "",
      body: text ? (JSON.parse(text) as Record<string, unknown>) : null,
    };
  };

  const login = async (email: string, password = PASSWORD) => {
    const res = await call("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    const cookie = res.setCookie.split(";")[0];
    return { ...res, cookie };
  };

  // ── Unauthenticated ─────────────────────────────────────────────────────
  check("health is open", (await call("/api/health")).status, 200);
  check("me without a session is 401", (await call("/api/auth/me")).status, 401);
  check("users without a session is 401", (await call("/api/users")).status, 401);

  // ── Sign-in failures give nothing away ──────────────────────────────────
  const wrongPassword = await call("/api/auth/login", { method: "POST", body: JSON.stringify({ email: ADMIN, password: "wrong-password" }) });
  const unknownEmail = await call("/api/auth/login", { method: "POST", body: JSON.stringify({ email: "nobody@example.com", password: "wrong-password" }) });
  check("wrong password is 401", wrongPassword.status, 401);
  check("unknown address is 401", unknownEmail.status, 401);
  check("both failures read identically", wrongPassword.body?.message, unknownEmail.body?.message);
  check("failure does not confirm the address exists", wrongPassword.body?.message, "Email or password is incorrect");
  check("malformed body is 422", (await call("/api/auth/login", { method: "POST", body: JSON.stringify({ email: "nope", password: "" }) })).status, 422);

  // ── Sign-in ─────────────────────────────────────────────────────────────
  const admin = await login(ADMIN);
  check("valid credentials sign in", admin.status, 200);
  check("session cookie is httpOnly", /httponly/i.test(admin.setCookie), true);
  check("session cookie is sameSite=lax", /samesite=lax/i.test(admin.setCookie), true);
  check("cookie value is not the raw user id", admin.setCookie.includes(ADMIN), false);

  const me = await call("/api/auth/me", { cookie: admin.cookie });
  const meUser = me.body?.user as { roles: string[]; permissions: string[]; email: string };
  check("me returns the signed-in user", meUser.email, ADMIN);
  check("me carries roles", meUser.roles, ["Admin"]);
  check("admin holds user:write", meUser.permissions.includes("user:write"), true);

  // ── RBAC ────────────────────────────────────────────────────────────────
  const customer = await login(CUSTOMER);
  const customerMe = await call("/api/auth/me", { cookie: customer.cookie });
  const customerUser = customerMe.body?.user as { roles: string[]; permissions: string[] };
  check("customer has only the customer role", customerUser.roles, ["Customer"]);
  check("customer holds project:read", customerUser.permissions.includes("project:read"), true);
  check("customer does not hold user:read", customerUser.permissions.includes("user:read"), false);

  check("admin may list users", (await call("/api/users", { cookie: admin.cookie })).status, 200);
  const denied = await call("/api/users", { cookie: customer.cookie });
  check("customer may not list users", denied.status, 403);
  check("403 names the missing permission", denied.body?.required, "user:read");
  check("customer may not create users", (await call("/api/users", { method: "POST", cookie: customer.cookie, body: JSON.stringify({ email: "x@y.com", name: "X", roles: ["Admin"] }) })).status, 403);

  // ── User administration ─────────────────────────────────────────────────
  const created = await call("/api/users", { method: "POST", cookie: admin.cookie, body: JSON.stringify({ email: "Ada.Lovelace@example.com", name: "Ada Lovelace", partner: "S&B UK", roles: ["Reviewer"] }) });
  check("admin creates a user", created.status, 201);
  const newUser = created.body?.user as { id: string; email: string; initials: string; status: string; permissions: string[] };
  check("address is normalised", newUser.email, "ada.lovelace@example.com");
  check("initials derived", newUser.initials, "AL");
  check("account without a password starts pending", newUser.status, "pending");
  check("reviewer permissions derived from the role", newUser.permissions.includes("project:approve"), true);
  check("duplicate address is 409", (await call("/api/users", { method: "POST", cookie: admin.cookie, body: JSON.stringify({ email: "ada.lovelace@example.com", name: "Dup", roles: ["Customer"] }) })).status, 409);
  check("a role outside the set is 422", (await call("/api/users", { method: "POST", cookie: admin.cookie, body: JSON.stringify({ email: "z@y.com", name: "Z", roles: ["Superuser"] }) })).status, 422);

  // A pending account cannot sign in even with the right password.
  await prisma.user.update({ where: { id: newUser.id }, data: { passwordHash: (await prisma.user.findUniqueOrThrow({ where: { email: ADMIN } })).passwordHash } });
  check("a pending account is refused", (await login("ada.lovelace@example.com")).status, 403);

  // ── Lockout protection ──────────────────────────────────────────────────
  const adminId = (me.body?.user as { id: string }).id;
  check("last admin cannot drop the Admin role", (await call(`/api/users/${adminId}`, { method: "PATCH", cookie: admin.cookie, body: JSON.stringify({ roles: ["Customer"] }) })).status, 409);
  check("last admin cannot be deactivated", (await call(`/api/users/${adminId}`, { method: "PATCH", cookie: admin.cookie, body: JSON.stringify({ status: "inactive" }) })).status, 409);
  check("cannot delete your own account", (await call(`/api/users/${adminId}`, { method: "DELETE", cookie: admin.cookie })).status, 409);

  // ── A role change ends the sessions it was granted under ────────────────
  const patched = await call(`/api/users/${newUser.id}`, { method: "PATCH", cookie: admin.cookie, body: JSON.stringify({ roles: ["DevOps"] }) });
  check("roles can be changed", (patched.body?.user as { roles: string[] }).roles, ["DevOps"]);
  check("permissions follow the new role", (patched.body?.user as { permissions: string[] }).permissions.includes("patch:schedule"), true);

  await prisma.user.update({ where: { id: newUser.id }, data: { status: "active" } });
  const reviewer = await login("ada.lovelace@example.com");
  check("reactivated account signs in", reviewer.status, 200);
  await call(`/api/users/${newUser.id}`, { method: "PATCH", cookie: admin.cookie, body: JSON.stringify({ roles: ["Customer"] }) });
  check("a role change invalidates the existing session", (await call("/api/auth/me", { cookie: reviewer.cookie })).status, 401);

  // ── CSRF ────────────────────────────────────────────────────────────────
  const foreign = await fetch(base + "/api/users", {
    method: "POST",
    headers: { origin: "https://evil.example", "content-type": "application/json", cookie: admin.cookie },
    body: JSON.stringify({ email: "e@v.il", name: "Evil", roles: ["Admin"] }),
  });
  check("a cross-origin write is refused", foreign.status, 403);

  // Same-origin is decided by the request's own host, so reaching the API on
  // any address it actually answers on works without configuration.
  const sameHost = await fetch(base + "/api/auth/login", {
    method: "POST",
    headers: { origin: base, "content-type": "application/json" },
    body: JSON.stringify({ email: ADMIN, password: PASSWORD }),
  });
  check("an origin matching the request host is allowed", sameHost.status, 200);

  const noOrigin = await fetch(base + "/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: ADMIN, password: PASSWORD }),
  });
  check("a request with no Origin is allowed (non-browser client)", noOrigin.status, 200);

  const wrongPort = await fetch(base + "/api/users", {
    method: "POST",
    headers: { origin: "http://127.0.0.1:9", "content-type": "application/json", cookie: admin.cookie },
    body: JSON.stringify({ email: "e@v.il", name: "Evil", roles: ["Admin"] }),
  });
  check("a different port on the same machine is still cross-origin", wrongPort.status, 403);

  // ── Sign out ────────────────────────────────────────────────────────────
  check("logout succeeds", (await call("/api/auth/logout", { method: "POST", cookie: admin.cookie })).status, 200);
  check("the session is dead afterwards", (await call("/api/auth/me", { cookie: admin.cookie })).status, 401);

  // ── Cleanup ─────────────────────────────────────────────────────────────
  await prisma.user.deleteMany({ where: { email: "ada.lovelace@example.com" } });
  await app.close();
  await prisma.$disconnect();

  console.log(failed === 0 ? "\nALL PASS" : `\n${failed} FAILED`);
  process.exit(failed === 0 ? 0 : 1);
}

void main();
