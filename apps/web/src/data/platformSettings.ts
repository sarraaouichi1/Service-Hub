// Seed data for the in-memory API store. Components read this through
// src/api/, never directly; when real endpoints land, only src/api/ changes.

import type { AuditLogEntry, PlatformConfig } from "../types";

export const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  platformName: "entervo smart Onboarding",
  supportEmail: "onboarding-support@scheidt-bachmann.de",
  defaultPM: "k.harperscheidt@scheidt-bachmann.de",
  notifyOnSubmit: true,
  notifyOnApprove: true,
  notifyOnReject: true,
  requireDualApproval: false,
  autoExportOnApprove: false,
  sessionTimeout: "60",
  exportFormat: "json",
};

export const AUDIT_LOG: AuditLogEntry[] = [
  {
    time: "Today 09:14",
    user: "Kai Harperscheidt",
    action: "Approved",
    target: "Frankfurt Airport P3",
    color: "var(--green)",
  },
  {
    time: "Today 08:50",
    user: "Marc Delvaux",
    action: "Submitted",
    target: "Medway Hospital — Step 4",
    color: "var(--blue-bright)",
  },
  {
    time: "Yesterday 16:32",
    user: "Laura Meissner",
    action: "Requested correction",
    target: "Geneva Centre Mall",
    color: "var(--amber)",
  },
  {
    time: "Yesterday 11:05",
    user: "Stefan Brandt",
    action: "Created project",
    target: "Frankfurt Airport P3",
    color: "var(--blue)",
  },
  {
    time: "2 days ago",
    user: "Kai Harperscheidt",
    action: "Updated rule",
    target: "Smart Validation Port range",
    color: "var(--gray-400)",
  },
];
