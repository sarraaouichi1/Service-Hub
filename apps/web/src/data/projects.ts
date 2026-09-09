// Seed data for the in-memory API store. Components read this through
// src/api/, never directly; when real endpoints land, only src/api/ changes.

import type { Project, ProjectStatus, StatusMeta } from "../types";
import { PRODUCT_BY_ID } from "./products";

export const PROJECTS: Project[] = [
  { id: 1, name: "Medway Hospital", partner: "S&B UK", pm: "Marc Delvaux", step: 4, total: 6, status: "progress", psp: "Fiserv", country: "UK", product: "smart-web-pay" },
  { id: 2, name: "Frankfurt Airport P3", partner: "S&B DE", pm: "Stefan Brandt", step: 6, total: 6, status: "review", psp: "Worldline", country: "DE", product: "econnect" },
  { id: 3, name: "Geneva Centre Mall", partner: "S&B CH", pm: "Laura Meissner", step: 2, total: 6, status: "progress", psp: "CCV", country: "CH", product: "smart-validation" },
  { id: 4, name: "Manchester Arena", partner: "S&B UK", pm: "James Hill", step: 5, total: 6, status: "sales-approval", psp: "Planet", country: "UK", product: "smart-web-pay" },
  { id: 5, name: "Rotterdam Harbour", partner: "S&B NL", pm: "Joost van Dijk", step: 5, total: 6, status: "sales-approval", psp: "NMI", country: "NL", product: "econnect" },
  { id: 6, name: "Brussels Central Station", partner: "S&B BE", pm: "Kai Harperscheidt", step: 6, total: 6, status: "onboarded", psp: "Worldline", country: "BE", product: "smart-validation" },
];

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

/** Counts per status, so headline figures cannot drift from the data. */
export const projectCountByStatus = (status: ProjectStatus) =>
  PROJECTS.filter((p) => p.status === status).length;

/** Completion percentage for a project's onboarding. */
export const progressPct = (p: Project) => Math.round((p.step / p.total) * 100);

/** Display name for a project's product, resolved from its id. */
export const productName = (p: Project) => PRODUCT_BY_ID[p.product]?.name ?? p.product;
