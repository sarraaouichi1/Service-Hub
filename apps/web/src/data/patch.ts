// Seed data for the in-memory API store. Components read this through
// src/api/, never directly; when real endpoints land, only src/api/ changes.

import type { PatchBulletin, PatchServiceTier, PatchStage } from "../types";

export const PATCH_BULLETINS: PatchBulletin[] = [
  { id: "KB5034441", name: "Windows Server 2022 – Security Update", severity: "Critical", released: "Mar 12, 2025", systems: 14, status: "deployed", risk: "RCE" },
  { id: "KB5035845", name: "MS Edge Chromium – Zero-Day Fix", severity: "Critical", released: "Mar 10, 2025", systems: 8, status: "testing", risk: "XSS" },
  { id: "KB5033372", name: "SQL Server 2019 CU25 – Rollup", severity: "High", released: "Mar 05, 2025", systems: 3, status: "scheduled", risk: "DoS" },
  { id: "KB5028997", name: ".NET Framework 4.8 Update", severity: "Medium", released: "Feb 28, 2025", systems: 21, status: "deployed", risk: "EoP" },
  { id: "KB5032190", name: "Windows Defender Definitions", severity: "Low", released: "Mar 15, 2025", systems: 34, status: "deployed", risk: "Def" },
  { id: "KB5031364", name: "IIS Lockdown – CVE-2025-1441", severity: "High", released: "Mar 08, 2025", systems: 6, status: "pending", risk: "SSRF" },
];

export const PATCH_STAGES: PatchStage[] = [
  { num: 1, icon: "&#128269;", color: "#E8F0FB", name: "Assessment", desc: "Identifying Microsoft security updates." },
  { num: 2, icon: "&#11015;", color: "#E8FAF1", name: "Acquisition", desc: "Secure sourcing via WSUS over the Internet." },
  { num: 3, icon: "&#129514;", color: "#FEF3E8", name: "Testing", desc: "Rigorous sandbox environment verification." },
  { num: 4, icon: "&#9881;", color: "#EDE9FE", name: "Deployment", desc: "Automated, scheduled rollouts to endpoints." },
  { num: 5, icon: "&#128202;", color: "#E8FAF1", name: "Monitoring", desc: "Continuous health checks and incident response." },
];

export const PATCH_SERVICE_TIERS: PatchServiceTier[] = [
  {
    id: "basic",
    name: "Basic Service",
    popular: false,
    features: ["Monthly Patch Bulletins", "Vulnerability Notifications", "Risk Assessment"],
  },
  {
    id: "premium",
    name: "Premium Service",
    popular: true,
    features: [
      "Active Patch Deployment",
      "Automated Workflows",
      "Compatibility Testing",
      "Comprehensive Monthly Reports",
    ],
  },
];
