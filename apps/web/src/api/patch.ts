import type { PatchBulletin, PatchServiceTier, PatchStage } from "../types";
import { PATCH_BULLETINS, PATCH_SERVICE_TIERS, PATCH_STAGES } from "../data/patch";
import { ok } from "./client";

export function listBulletins(): Promise<PatchBulletin[]> {
  return ok(PATCH_BULLETINS);
}

export function listPatchStages(): Promise<PatchStage[]> {
  return ok(PATCH_STAGES);
}

export function listServiceTiers(): Promise<PatchServiceTier[]> {
  return ok(PATCH_SERVICE_TIERS);
}
