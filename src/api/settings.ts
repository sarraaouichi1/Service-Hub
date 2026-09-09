import type { AuditLogEntry, PlatformConfig } from "../types";
import { AUDIT_LOG } from "../data/platformSettings";
import { ok } from "./client";
import { store } from "./store";

export function getSettings(): Promise<PlatformConfig> {
  return ok(store.settings);
}

export async function updateSettings(patch: Partial<PlatformConfig>): Promise<PlatformConfig> {
  store.settings = { ...store.settings, ...patch };
  return ok(store.settings);
}

export function listAuditLog(): Promise<AuditLogEntry[]> {
  return ok(AUDIT_LOG);
}
