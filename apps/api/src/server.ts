import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import Fastify from "fastify";
import type { FastifyError } from "fastify";
import { authRoutes } from "./auth/routes.js";
import { SESSION_COOKIE, readSession } from "./auth/session.js";
import { env, isProduction } from "./env.js";
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
    origin: env.WEB_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  });
  await app.register(cookie, { secret: env.SESSION_SECRET });

  /**
   * The session cookie is SameSite=lax, which already blocks cross-site form
   * posts. This is the belt to that pair of braces: a state-changing request
   * whose Origin isn't the app is refused outright, so a cookie riding along
   * from somewhere else buys nothing.
   */
  app.addHook("onRequest", async (request, reply) => {
    if (!SAFE_METHODS.has(request.method)) {
      const origin = request.headers.origin;
      if (origin && origin !== env.WEB_ORIGIN) {
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
  }, { prefix: "/api" });

  return app;
}
