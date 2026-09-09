import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import Fastify from "fastify";
import type { FastifyError } from "fastify";
import { authRoutes } from "./auth/routes.js";
import { SESSION_COOKIE, readSession } from "./auth/session.js";
import { allowedOrigins, env, isProduction } from "./env.js";
import { adminRoutes } from "./routes/admin.js";
import { catalogRoutes } from "./routes/catalog.js";
import { projectRoutes } from "./routes/projects.js";
import { userRoutes } from "./routes/users.js";

/** Requests that change something must come from the app's own origin. */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export async function buildServer() {
  const app = Fastify({
    logger: isProduction
      ? { level: "info" }
      : { level: "info", transport: { target: "pino-pretty" } },
    trustProxy: isProduction,
  });

  await app.register(cors, {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  });
  await app.register(cookie, { secret: env.SESSION_SECRET });

  /**
   * The session cookie is SameSite=lax, which already blocks cross-site form
   * posts. This is the belt to that pair of braces: a state-changing request
   * whose Origin isn't ours is refused outright, so a cookie riding along from
   * somewhere else buys nothing.
   *
   * "Ours" is decided by comparing the Origin against the host the request was
   * actually sent to, rather than against a configured string. Behind nginx or
   * the Vite proxy the app and the API share an origin, so this is true without
   * anyone configuring anything — and it stays true whether you reach the app
   * on localhost, 127.0.0.1, a LAN address or a real hostname. WEB_ORIGIN then
   * only has to list origins that genuinely differ from the API's own.
   *
   * A missing Origin is allowed through: browsers always send it on a
   * state-changing request, so its absence means a non-browser client, which
   * carries no ambient cookie to abuse.
   */
  function isTrustedOrigin(origin: string | undefined, host: string | undefined): boolean {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    try {
      return Boolean(host) && new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  app.addHook("onRequest", async (request, reply) => {
    if (!SAFE_METHODS.has(request.method)) {
      if (!isTrustedOrigin(request.headers.origin, request.headers.host)) {
        request.log.warn(
          { origin: request.headers.origin, host: request.headers.host },
          "refused a cross-origin write",
        );
        return reply.code(403).send({ message: "Cross-origin request refused" });
      }
    }
    request.authUser = await readSession(request.cookies[SESSION_COOKIE]);
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    request.log.error({ err: error }, "request failed");
    const status = error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
    // Never let an internal message reach the browser.
    reply.code(status).send({
      message: status >= 500 ? "Something went wrong" : error.message,
    });
  });

  app.get("/api/health", async () => ({ ok: true, provider: env.AUTH_PROVIDER }));

  await app.register(async (api) => {
    await authRoutes(api);
    await userRoutes(api);
    await projectRoutes(api);
    await adminRoutes(api);
    await catalogRoutes(api);
  }, { prefix: "/api" });

  return app;
}
