// Presentation lookups — how the data is drawn, not the data itself.
// Everything that is server state now lives behind src/api/ and src/queries/.

import type { Project, ProjectStatus, RuleCategory, UserRole } from "../types";
import type { StatusMeta } from "../types";

export const STATUS_MAP: Record<ProjectStatus, StatusMeta> = {
  draft: { label: "Draft", cls: "badge-draft" },
  progress: { label: "In Progress", cls: "badge-progress" },
  review: { label: "Pending Review", cls: "badge-review" },
  approved: { label: "Approved", cls: "badge-approved" },
  "sales-approval": { label: "Sales Approval", cls: "badge-sales" },
  onboarded: { label: "Onboarded", cls: "badge-onboarded" },
};

/** Progress-bar colour for a project, shared by every view that draws one. */
export const STATUS_COLOR: Record<ProjectStatus, string> = {
  draft: "var(--gray-400)",
  progress: "var(--amber)",
  review: "var(--blue-bright)",
  approved: "var(--green)",
  "sales-approval": "#C0185A",
  onboarded: "#7C3AED",
};

/** Completion percentage for a project's onboarding. */
export const progressPct = (p: Project) => Math.round((p.step / p.total) * 100);

/** Counts per status, derived from whatever the caller is showing. */
export const countByStatus = (projects: Project[] | undefined, status: ProjectStatus) =>
  (projects ?? []).filter((p) => p.status === status).length;

export const RULE_CATEGORY_BG: Record<RuleCategory, string> = {
  Network: "#E8F0FB", System: "#E8FAF1", Localisation: "#FEF9EC", Security: "#FEECEC", Finance: "#F3F0FC", Contact: "#EAF7F9",
};

export const RULE_CATEGORY_FG: Record<RuleCategory, string> = {
  Network: "var(--blue)", System: "var(--green)", Localisation: "#B07800", Security: "var(--red)", Finance: "#6B4FBB", Contact: "#0E7490",
};

export const USER_ROLES: UserRole[] = [
  "Admin", "Project Manager", "Sales", "Reviewer", "DevOps", "Partner", "Customer",
];

export const ROLE_COLORS: Record<UserRole, { bg: string; color: string }> = {
  Admin: { bg: "#FEECEC", color: "var(--red)" },
  "Project Manager": { bg: "#E8F0FB", color: "var(--blue)" },
  Sales: { bg: "#FFF0F6", color: "#C0185A" },
  Reviewer: { bg: "#F3F0FC", color: "#6B4FBB" },
  DevOps: { bg: "#EAF7F9", color: "#0E7490" },
  Partner: { bg: "#E8FAF1", color: "var(--green)" },
  Customer: { bg: "#FEF9EC", color: "#B07800" },
};
