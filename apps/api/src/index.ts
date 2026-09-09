import { prisma } from "./db.js";
import { env } from "./env.js";
import { purgeExpiredSessions } from "./auth/session.js";
import { buildServer } from "./server.js";

const app = await buildServer();

/** Expired rows are dead weight; sweep them hourly rather than never. */
const sweep = setInterval(() => {
  purgeExpiredSessions().catch((error) => app.log.error({ err: error }, "session sweep failed"));
}, 60 * 60 * 1000);
sweep.unref();

async function shutdown(signal: string) {
  app.log.info({ signal }, "shutting down");
  clearInterval(sweep);
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

try {
  await app.listen({ host: env.HOST, port: env.PORT });
} catch (error) {
  app.log.error({ err: error }, "failed to start");
  process.exit(1);
}
