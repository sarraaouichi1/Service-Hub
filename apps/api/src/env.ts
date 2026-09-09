import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  /** Signs session tokens. Rotating it logs everyone out, which is the point. */
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  SESSION_TTL_HOURS: z.coerce.number().positive().default(12),
  /**
   * Extra browser origins allowed to send credentials, comma-separated. Only
   * needed when the app is served from a different origin than the API — when
   * they share one (nginx or the Vite proxy), the same-origin check covers it.
   */
  WEB_ORIGIN: z.string().default("http://localhost:5173"),
  /** Which identity provider backs sign-in. See src/auth/providers. */
  AUTH_PROVIDER: z.enum(["local", "oidc"]).default("local"),
  OIDC_ISSUER: z.string().optional(),
  OIDC_CLIENT_ID: z.string().optional(),
  OIDC_CLIENT_SECRET: z.string().optional(),
  OIDC_REDIRECT_URI: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const detail = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Invalid environment:\n${detail}`);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";

/** WEB_ORIGIN as a list; it accepts several, comma-separated. */
export const allowedOrigins = env.WEB_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
