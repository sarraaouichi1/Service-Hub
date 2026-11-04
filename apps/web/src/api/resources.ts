import type {
  AppNotification, AuditLogEntry, CountryTemplate, OnboardingForm, PatchBulletin,
  PatchServiceTier, PatchStage, PlatformConfig, ProductDefinition, Project, Psp,
  TemplateDraft, ValidationRule, AuthUser, UserRole,
} from "@service-hub/shared";
import { request } from "./http";

/**
 * Every resource the app reads or writes, as thin calls over the API.
 *
 * Nothing here caches, retries or tracks loading — that is TanStack Query's job,
 * one layer up in `src/queries`. Keeping these as plain functions means they
 * stay usable outside React (a route loader, a test) and that swapping the
 * fetching library later touches one folder.
 */

// ─── Projects ───────────────────────────────────────────────────────────────
export const listProjects = () =>
  request<{ projects: Project[] }>("/projects").then((r) => r.projects);

export const getProject = (id: number) =>
  request<{ project: Project }>(`/projects/${id}`).then((r) => r.project);

export const updateProject = (id: number, patch: Partial<Project>) =>
  request<{ project: Project }>(`/projects/${id}`, {
    method: "PATCH", body: JSON.stringify(patch),
  }).then((r) => r.project);

export const submitDraft = (draft: OnboardingForm) =>
  request<{ project: Project }>("/projects/submit", {
    method: "POST", body: JSON.stringify(draft),
  }).then((r) => r.project);

// ─── The signed-in person's working draft ───────────────────────────────────
/**
 * Credentials are never returned — `secretsOnFile` names the ones held so the
 * wizard can say "stored" instead of showing an empty box.
 */
export interface DraftResponse {
  draft: OnboardingForm | null;
  secretsOnFile: string[];
  updatedAt: string | null;
}

export const getDraft = () => request<DraftResponse>("/draft");

export const saveDraft = (draft: OnboardingForm) =>
  request<DraftResponse>("/draft", { method: "PUT", body: JSON.stringify(draft) });

export const discardDraft = () => request<void>("/draft", { method: "DELETE" });

// ─── Reference data ─────────────────────────────────────────────────────────
export const listProducts = () =>
  request<{ products: ProductDefinition[] }>("/catalog/products").then((r) => r.products);

export const listPsps = () =>
  request<{ psps: Psp[] }>("/catalog/psps").then((r) => r.psps);

// ─── Patch management ───────────────────────────────────────────────────────
export const listBulletins = () =>
  request<{ bulletins: PatchBulletin[] }>("/patch/bulletins").then((r) => r.bulletins);

export const listPatchStages = () =>
  request<{ stages: PatchStage[] }>("/patch/stages").then((r) => r.stages);

export const listServiceTiers = () =>
  request<{ tiers: PatchServiceTier[] }>("/patch/tiers").then((r) => r.tiers);

export const createPatchInquiry = (inquiry: {
  userName?: string;
  userEmail?: string;
  company?: string;
  message: string;
}) =>
  request<{ ok: boolean; message: string; inquiry: unknown }>("/patch/inquiries", {
    method: "POST",
    body: JSON.stringify(inquiry),
  });

export interface PatchTicketInput {
  carparkName: string;
  customerAccount?: string;
  contactName?: string;
  contactEmail: string;
  contactPhone?: string;
  cpqOrderNumber?: string;
  contractNumber?: string;
  numberOfDevices: number;
  entervoVersion: string;
  operatingSystem: string;
  ipAddress1: string;
  ipAddress2?: string;
  ipAddress3?: string;
  remoteAccess?: string;
  priority?: string;
  urgency?: string;
  category?: string;
  subCategory?: string;
  notes?: string;
}

export const createPatchTicket = (data: PatchTicketInput) =>
  request<{ ok: boolean; ticket: any; message: string }>("/patch/tickets", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const listPatchTickets = () =>
  request<{ tickets: any[] }>("/patch/tickets").then((r) => r.tickets);

// ─── Country templates ──────────────────────────────────────────────────────
export const listTemplates = () =>
  request<{ templates: CountryTemplate[] }>("/templates").then((r) => r.templates);

export const createTemplate = (draft: TemplateDraft) =>
  request<{ template: CountryTemplate }>("/templates", {
    method: "POST", body: JSON.stringify(draft),
  }).then((r) => r.template);

export const updateTemplate = (id: number, patch: Partial<TemplateDraft>) =>
  request<{ template: CountryTemplate }>(`/templates/${id}`, {
    method: "PATCH", body: JSON.stringify(patch),
  }).then((r) => r.template);

export const deleteTemplate = (id: number) =>
  request<void>(`/templates/${id}`, { method: "DELETE" });

// ─── Validation rules ───────────────────────────────────────────────────────
export const listRules = () =>
  request<{ rules: ValidationRule[] }>("/rules").then((r) => r.rules);

export const listRuleEnforcement = () =>
  request<{ rules: ValidationRule[] }>("/rules/enforcement").then((r) => r.rules);

export const updateRule = (id: number, patch: { active?: boolean; severity?: "error" | "warning" }) =>
  request<{ rule: ValidationRule }>(`/rules/${id}`, {
    method: "PATCH", body: JSON.stringify(patch),
  }).then((r) => r.rule);

// ─── Platform settings ─────────────────────────────────────────────────────
export const getPlatformConfig = () =>
  request<{ settings?: PlatformConfig; config?: PlatformConfig }>("/settings").then((r) => (r.settings ?? r.config)!);

export const updatePlatformConfig = (patch: Partial<PlatformConfig>) =>
  request<{ settings?: PlatformConfig; config?: PlatformConfig }>("/settings", {
    method: "PATCH", body: JSON.stringify(patch),
  }).then((r) => (r.settings ?? r.config)!);

export const getSettings = getPlatformConfig;
export const updateSettings = updatePlatformConfig;

export const listAuditLog = () =>
  request<{ entries: AuditLogEntry[] }>("/audit-log").then((r) => r.entries);

// ─── Notifications ─────────────────────────────────────────────────────────
export const listNotifications = () =>
  request<{ notifications: AppNotification[] }>("/notifications").then((r) => r.notifications);

export const markNotificationRead = (id: number) =>
  request<{ notification: AppNotification }>(`/notifications/${id}/read`, { method: "POST" })
    .then((r) => r.notification);

export const markAllNotificationsRead = () =>
  request<void>("/notifications/read-all", { method: "POST" });

export const markAllRead = markAllNotificationsRead;
export const markRead = markNotificationRead;

// ─── User management ───────────────────────────────────────────────────────
export const listUsers = () =>
  request<{ users: AuthUser[] }>("/users").then((r) => r.users);

export const createUser = (user: { email: string; name: string; partner?: string; roles: UserRole[]; password?: string }) =>
  request<{ user: AuthUser }>("/users", { method: "POST", body: JSON.stringify(user) }).then((r) => r.user);

export const updateUser = (id: string, patch: { name?: string; partner?: string; status?: string; roles?: UserRole[] }) =>
  request<{ user: AuthUser }>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) }).then((r) => r.user);

export const deleteUser = (id: string) =>
  request<void>(`/users/${id}`, { method: "DELETE" });
