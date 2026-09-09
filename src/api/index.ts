/**
 * The boundary between the app and its data.
 *
 * Components import from here rather than from `src/data/`, so that swapping
 * the in-memory store for real HTTP is a change inside this folder. Everything
 * is async and hands back copies, which is what a network call will do anyway —
 * the call sites don't have to change shape later.
 *
 * `src/data/` keeps what is genuinely not server state: presentation lookups
 * (`STATUS_MAP`, `ROLE_COLORS`), derived helpers (`projectCountByStatus`) and
 * static UI configuration (`WIZARD_STEPS`).
 */

export { ApiError } from "./client";
export type { Session } from "./auth";
export { getSession, signIn, signOut, knownAddresses } from "./auth";
export { listProjects, getProject } from "./projects";
export { listProducts, listPsps } from "./catalog";
export { listUsers, inviteUser, updateUser, deleteUser } from "./users";
export { listTemplates, createTemplate, updateTemplate, deleteTemplate } from "./templates";
export { listRules, updateRule } from "./rules";
export { getSettings, updateSettings, listAuditLog } from "./settings";
export { listNotifications, markAllRead } from "./notifications";
export { listBulletins, listPatchStages, listServiceTiers } from "./patch";
export { getDraft, saveDraft, submitDraft } from "./onboarding";
