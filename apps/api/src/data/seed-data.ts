// What a fresh database starts with. Seeded once by prisma/seed.ts; after
// that these rows are ordinary server state and this file is not consulted.

import type { AppNotification, AuditLogEntry, CountryTemplate, PlatformConfig, Project } from "@service-hub/shared";

export const PROJECTS: Project[] = [
  { id: 1, name: "Medway Hospital", partner: "S&B UK", pm: "Marc Delvaux", step: 4, total: 6, status: "progress", psp: "Fiserv", country: "UK", product: "smart-web-pay" },
  { id: 2, name: "Frankfurt Airport P3", partner: "S&B DE", pm: "Stefan Brandt", step: 6, total: 6, status: "review", psp: "Worldline", country: "DE", product: "econnect" },
  { id: 3, name: "Geneva Centre Mall", partner: "S&B CH", pm: "Laura Meissner", step: 2, total: 6, status: "progress", psp: "CCV", country: "CH", product: "smart-validation" },
  { id: 4, name: "Manchester Arena", partner: "S&B UK", pm: "James Hill", step: 5, total: 6, status: "sales-approval", psp: "Planet", country: "UK", product: "smart-web-pay" },
  { id: 5, name: "Rotterdam Harbour", partner: "S&B NL", pm: "Joost van Dijk", step: 5, total: 6, status: "sales-approval", psp: "NMI", country: "NL", product: "econnect" },
  { id: 6, name: "Brussels Central Station", partner: "S&B BE", pm: "Kai Harperscheidt", step: 6, total: 6, status: "onboarded", psp: "Worldline", country: "BE", product: "smart-validation" },
];

export const INITIAL_TEMPLATES: CountryTemplate[] = [
{ id: 1, title: "UK — Default", country: "GB", lang: "en-GB", currency: "GBP", vat: "20", psp: "Fiserv", status: "active", projects: 3 },
{ id: 2, title: "Germany — Default", country: "DE", lang: "de-DE", currency: "EUR", vat: "19", psp: "Worldline", status: "active", projects: 2 },
{ id: 3, title: "Netherlands — Default", country: "NL", lang: "nl-NL", currency: "EUR", vat: "21", psp: "CCV", status: "active", projects: 1 },
{ id: 4, title: "Switzerland — Default", country: "CH", lang: "de-CH", currency: "CHF", vat: "0", psp: "CCV", status: "draft", projects: 0 },
{ id: 5, title: "France — Default", country: "FR", lang: "fr-FR", currency: "EUR", vat: "20", psp: "Worldline", status: "draft", projects: 0 },
];

export const INITIAL_NOTIFS: AppNotification[] = [
  { id: 1, type: "submit", title: "New Onboarding Request", desc: "Medway Hospital submitted Step 4 — App & Payment for review.", time: "5 min ago", read: false, color: "#E8F0FB", iconColor: "#1A6FD4" },
  { id: 7, type: "approve", title: "Payment Confirmed by Sales", desc: "Anna Krüger confirmed payment received for Rotterdam Harbour.", time: "30 min ago", read: false, color: "#FFF0F6", iconColor: "#C0185A" },
  { id: 2, type: "approve", title: "Onboarding Approved", desc: "Manchester Arena has been fully approved by Stefan Brandt.", time: "1 hour ago", read: false, color: "#E8FAF1", iconColor: "#1AB870" },
  { id: 3, type: "reject", title: "Correction Requested", desc: "Geneva Centre Mall — Step 2 was sent back with comments.", time: "2 hours ago", read: false, color: "#FEECEC", iconColor: "#E84040" },
  { id: 4, type: "submit", title: "New Onboarding Request", desc: "Rotterdam Harbour started a new onboarding (Step 1).", time: "Yesterday", read: true, color: "#E8F0FB", iconColor: "#1A6FD4" },
  { id: 5, type: "approve", title: "Onboarding Approved", desc: "Frankfurt Airport P3 approved and ready for DevOps setup.", time: "2 days ago", read: true, color: "#E8FAF1", iconColor: "#1AB870" },
  { id: 6, type: "info", title: "Template Updated", desc: "UK — Default template was updated by Kai Harperscheidt.", time: "3 days ago", read: true, color: "#FEF9EC", iconColor: "#F4A136" },
];

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

/**
 * A pre-filled Medway Hospital draft, seeded as each user's saved draft so the
 * wizard has something to demo with. It is deliberately incomplete — no product
 * chosen and sales approval outstanding — so walking it still exercises the
 * steps that matter.
 */
export const DEMO_ONBOARDING_DRAFT = {
  ip: "195.171.142.1",
  port: "8443",
  opName: "Medway Hospital",
  version: "V3R0M4",
  opEmail: "medwayft.carparking@nhs.net",
  domain: "204.96.89.10",
  opId: "49666",
  lang: "en-GB",
  country: "GB",
  currency: "GBP",
  cellId: "4438",
  vat: "20",
  lpr: true,
  barcode: true,
  reachable: true,
  forwarding: true,
  psp: "fiserv",
  pspMid: "FIS-MED-001",
  tariff: "0",
  facilities: [
    { id: "4439", name: "Car Park D – Public", city: "Gillingham", inpayEntry: 30, inpayPayment: 30 },
    { id: "4440", name: "Car Park D – Public (2)", city: "Gillingham", inpayEntry: 30, inpayPayment: 30 },
    { id: "4441", name: "Car Park B – Staff", city: "Gillingham", inpayEntry: 30, inpayPayment: 30 },
  ],
};
