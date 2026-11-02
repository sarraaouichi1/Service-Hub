// Presentation lookups — how the data is drawn, not the data itself.
// Everything that is server state now lives behind src/api/ and src/queries/.
// Colours are design tokens (design-system/tokens.css), never hex, so a palette
// change reaches every view.

import type { NotificationType, PatchSeverity, PatchStatus } from "@service-hub/shared";
import type { BadgeTone } from "../design-system/components/Badge";
import type { IconName, Project, ProjectStatus, RuleCategory, UserRole } from "../types";
import type { StatusMeta } from "../types";

export const STATUS_MAP: Record<ProjectStatus, StatusMeta> = {
  draft: { label: "Draft", cls: "badge-draft" },
  progress: { label: "In Progress", cls: "badge-progress" },
  review: { label: "Pending Review", cls: "badge-review" },
  approved: { label: "Ready for deployment", cls: "badge-approved" },
  "sales-approval": { label: "Sales Approval", cls: "badge-sales" },
  onboarded: { label: "Onboarded", cls: "badge-onboarded" },
};

/** Progress-bar and stat colour for a project status, shared by every view that draws one. */
export const STATUS_COLOR: Record<ProjectStatus, string> = {
  draft: "var(--status-draft)",
  progress: "var(--status-progress)",
  review: "var(--status-review)",
  approved: "var(--status-approved)",
  "sales-approval": "var(--status-sales)",
  onboarded: "var(--status-onboarded)",
};

/** Completion percentage for a project's onboarding. */
export const progressPct = (p: Project) => Math.round((p.step / p.total) * 100);

/** Counts per status, derived from whatever the caller is showing. */
export const countByStatus = (projects: Project[] | undefined, status: ProjectStatus) =>
  (projects ?? []).filter((p) => p.status === status).length;

interface Tone { bg: string; color: string }

const TONE = {
  info: { bg: "var(--color-info-soft)", color: "var(--color-info-text)" },
  success: { bg: "var(--color-success-soft)", color: "var(--color-success-text)" },
  warning: { bg: "var(--color-warning-soft)", color: "var(--color-warning-text)" },
  danger: { bg: "var(--color-danger-soft)", color: "var(--color-danger-text)" },
  plum: { bg: "var(--sb-plum-50)", color: "var(--sb-plum-500)" },
  rose: { bg: "var(--sb-rose-50)", color: "var(--sb-rose-500)" },
  teal: { bg: "var(--sb-teal-50)", color: "var(--sb-teal-500)" },
  ink: { bg: "var(--sb-grey-900)", color: "var(--sb-sky-300)" },
} satisfies Record<string, Tone>;

export const RULE_CATEGORY_TONE: Record<RuleCategory, Tone> = {
  Network: TONE.info, System: TONE.success, Localisation: TONE.warning,
  Security: TONE.danger, Finance: TONE.plum, Contact: TONE.teal,
};

export const USER_ROLES: UserRole[] = [
  "Admin", "Project Manager", "Sales", "Reviewer", "DevOps", "Partner", "Customer",
];

export const ROLE_COLORS: Record<UserRole, Tone> = {
  Admin: TONE.ink,
  "Project Manager": TONE.info,
  Sales: TONE.plum,
  Reviewer: TONE.warning,
  DevOps: TONE.teal,
  Partner: TONE.rose,
  Customer: TONE.success,
};

export const NOTIFICATION_STYLE: Record<NotificationType, { icon: IconName; tone: BadgeTone; bg: string; color: string }> = {
  submit: { icon: "package", tone: "info", bg: TONE.info.bg, color: TONE.info.color },
  approve: { icon: "check", tone: "success", bg: TONE.success.bg, color: TONE.success.color },
  reject: { icon: "alert", tone: "danger", bg: TONE.danger.bg, color: TONE.danger.color },
  info: { icon: "info", tone: "neutral", bg: TONE.ink.bg, color: TONE.ink.color },
};

export const PATCH_STATUS_META: Record<PatchStatus, { label: string; tone: BadgeTone }> = {
  deployed: { label: "Deployed", tone: "success" },
  scheduled: { label: "Scheduled", tone: "info" },
  testing: { label: "Testing", tone: "warning" },
  pending: { label: "Pending", tone: "neutral" },
};

export const PATCH_STATUS = PATCH_STATUS_META;

export const PATCH_SEVERITY_META: Record<PatchSeverity, { label: string; tone: BadgeTone }> = {
  Critical: { label: "Critical", tone: "danger" },
  High: { label: "High", tone: "warning" },
  Medium: { label: "Medium", tone: "neutral" },
  Low: { label: "Low", tone: "neutral" },
};

export const PATCH_SEVERITY_TONE: Record<PatchSeverity, BadgeTone> = {
  Critical: "danger",
  High: "warning",
  Medium: "neutral",
  Low: "neutral",
};
