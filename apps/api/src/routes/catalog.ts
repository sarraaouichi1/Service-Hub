import type { FastifyInstance } from "fastify";
import { PATCH_BULLETINS, PATCH_SERVICE_TIERS, PATCH_STAGES, PRODUCTS, PSP_LIST } from "../data/reference.js";
import { requireSignedIn, requirePermission } from "../rbac/guard.js";

/**
 * Reference data and patch management.
 *
 * These are read-only and identical for everyone, so they are served from
 * constants rather than a table — but still behind a session, because the
 * product line-up isn't public.
 */
export async function catalogRoutes(app: FastifyInstance) {
  app.get("/catalog/products", { preHandler: requireSignedIn }, async () => ({ products: PRODUCTS }));
  app.get("/catalog/psps", { preHandler: requireSignedIn }, async () => ({ psps: PSP_LIST }));

  app.get("/patch/bulletins", { preHandler: requirePermission("patch:read") }, async () => ({ bulletins: PATCH_BULLETINS }));
  app.get("/patch/stages", { preHandler: requirePermission("patch:read") }, async () => ({ stages: PATCH_STAGES }));
  app.get("/patch/tiers", { preHandler: requirePermission("patch:read") }, async () => ({ tiers: PATCH_SERVICE_TIERS }));
}
