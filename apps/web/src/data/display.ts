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
  approved: { label: "Approved", cls: "badge-approved" },
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
  Sales: TONE.rose,
  Reviewer: TONE.plum,
  DevOps: TONE.teal,
  Partner: TONE.success,
  Customer: TONE.warning,
};

export const PATCH_SEVERITY_TONE: Record<PatchSeverity, BadgeTone> = {
  Critical: "danger", High: "warning", Medium: "info", Low: "neutral",
};

export const PATCH_STATUS: Record<PatchStatus, { label: string; tone: BadgeTone }> = {
  deployed: { label: "Deployed", tone: "success" },
  testing: { label: "In testing", tone: "info" },
  scheduled: { label: "Scheduled", tone: "warning" },
  pending: { label: "Pending", tone: "neutral" },
};

/** A notification's look follows its type, not colours stored alongside it. */
export const NOTIFICATION_STYLE: Record<NotificationType, Tone & { icon: IconName }> = {
  submit: { ...TONE.info, icon: "plus" },
  approve: { ...TONE.success, icon: "check" },
  reject: { ...TONE.danger, icon: "alert" },
  info: { ...TONE.warning, icon: "settings" },
};
