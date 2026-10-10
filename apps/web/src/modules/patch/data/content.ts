// Patch Management service description — static marketing and scope copy.
// The overview and each detail page read from here, so a stage or a supported
// version is described once rather than in every page that mentions it.
//
// Live operational data (bulletins) is server state; see src/queries/.

import type { IconName } from "../../../types";

export interface ProcessStep {
  step: number;
  name: string;
  tagline: string;
  desc: string;
  details: string[];
  schedule: string;
  icon: IconName;
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    step: 1,
    name: "Assess & identify",
    tagline: "Microsoft roll-up security patches evaluated every second Tuesday",
    desc: "Systematic identification and vulnerability risk analysis of all newly released Microsoft updates.",
    details: [
      "Monitors Microsoft Patch Tuesday releases every second Tuesday of the month",
      "Evaluates severity (Critical, High, Medium, Low) and CVE threat intelligence",
      "Correlates updates against the active entervo infrastructure component matrix",
    ],
    schedule: "Monthly, 2nd Tuesday",
    icon: "search",
  },
  {
    step: 2,
    name: "Acquire & verify",
    tagline: "Verified patches downloaded from trusted Microsoft sources",
    desc: "Secure acquisition and digital-signature verification of official binaries from Microsoft WSUS.",
    details: [
      "Encrypted retrieval from the official Microsoft Catalog and WSUS endpoints",
      "SHA-256 checksum and Microsoft digital-signature validation",
      "Binaries staged in an isolated repository before test-bench deployment",
    ],
    schedule: "After assessment",
    icon: "download",
  },
  {
    step: 3,
    name: "Test & evaluate",
    tagline: "Patches evaluated in a controlled lab environment",
    desc: "Testing on staging environments that represent real-world entervo parking systems.",
    details: [
      "Staged deployment across test-lab servers with LCU and SSU compatibility checks",
      "Regression testing for parking management APIs, database and device communication",
      "Performance benchmarking and roll-back plan verification",
    ],
    schedule: "7-day staging window",
    icon: "cpu",
  },
  {
    step: 4,
    name: "Deploy",
    tagline: "Scheduled roll-outs during off-peak hours using automated tools",
    desc: "Automated, policy-driven installation scheduled inside maintenance windows.",
    details: [
      "Execution during off-peak maintenance hours to avoid operational disruption",
      "Automated policy push through Automox cloud orchestration",
      "Pre-patch snapshot and graceful service shutdown",
    ],
    schedule: "Off-peak maintenance",
    icon: "package",
  },
  {
    step: 5,
    name: "Monitor",
    tagline: "Successful installation and system stability verified",
    desc: "Post-deployment health verification with real-time telemetry.",
    details: [
      "Continuous health monitoring of Windows services and entervo processes",
      "Automated error-log inspection and anomaly detection",
      "Immediate alerting on any post-patch regression",
    ],
    schedule: "Continuous",
    icon: "activity",
  },
  {
    step: 6,
    name: "Report",
    tagline: "Monthly reports on patch status, issues and resolutions",
    desc: "Executive reporting and compliance documentation.",
    details: [
      "Patch compliance rate across all registered endpoints",
      "Audit-ready records for security and IT-governance compliance",
      "Issues resolved, reboot status and security posture, documented",
    ],
    schedule: "End of month",
    icon: "fileText",
  },
];

export const VALUE_DRIVERS: { title: string; desc: string; icon: IconName }[] = [
  { title: "Security", desc: "Protect systems against known vulnerabilities and cyber threats.", icon: "shield" },
  { title: "Compliance", desc: "Meet regulatory and internal security requirements.", icon: "fileText" },
  { title: "Stability", desc: "Fewer crashes and software faults at the lane and in the back office.", icon: "settings" },
  { title: "Performance", desc: "Keep systems optimised and running efficiently.", icon: "trendingUp" },
  { title: "Cost efficiency", desc: "Less downtime, fewer support calls.", icon: "zap" },
  { title: "Operator confidence", desc: "Reliable, secure IT services your customers can count on.", icon: "users" },
];

export interface SupportedSystem { name: string; desc: string }

export const SERVER_SYSTEMS: SupportedSystem[] = [
  { name: "Windows Server 2025", desc: "Latest LCU and SSU monthly support" },
  { name: "Windows Server 2022", desc: "Full cumulative-update coverage" },
  { name: "Windows Server 2019", desc: "Active patch deployment and monitoring" },
  { name: "Windows Server 2016", desc: "Servicing stack and security patches" },
];

export const CLIENT_SYSTEMS: SupportedSystem[] = [
  { name: "Windows 10 21H2", desc: "Client OS patch management" },
  { name: "Windows 10 1809", desc: "LTSC / Enterprise servicing" },
  { name: "Windows 10 1607", desc: "LTSC / Embedded support" },
  { name: "Windows 10 1507", desc: "Legacy LTSC support" },
];

export const UPDATE_TYPES: { code: string; name: string; desc: string; keyFeature: string; icon: IconName }[] = [
  {
    code: "LCU",
    name: "Latest Cumulative Update",
    desc: "Released monthly on Patch Tuesday. Bundles every security patch, bug fix and improvement for Windows components into one package.",
    keyFeature: "One package containing every vulnerability fix released to date.",
    icon: "layers",
  },
  {
    code: "SSU",
    name: "Servicing Stack Update",
    desc: "Updates the Windows servicing stack — the component that installs updates — so the update process itself stays reliable and secure.",
    keyFeature: "Prevents installation failures and protects the integrity of the update engine.",
    icon: "settings",
  },
];

export const AUTOMOX_PILLARS: { title: string; desc: string; icon: IconName }[] = [
  { title: "Automated", desc: "Patches deploy on schedule according to policy — set once, then hands-off.", icon: "zap" },
  { title: "Cloud-native", desc: "No on-premise server infrastructure needed for deployment.", icon: "cloud" },
  { title: "Cross-platform", desc: "One console for Windows, macOS and Linux endpoints.", icon: "monitor" },
  { title: "Real-time reporting", desc: "Instant visibility into security posture and compliance.", icon: "trendingUp" },
];

export const AUTOMOX_STAGES: { title: string; desc: string }[] = [
  { title: "Agent installation", desc: "A lightweight agent on each endpoint" },
  { title: "Cloud communication", desc: "Encrypted connection to the Automox cloud" },
  { title: "Policy deployment", desc: "Policies and schedules set in the central console" },
  { title: "Automated actions", desc: "Execution driven by those policies" },
  { title: "Reporting & audit", desc: "Real-time compliance status and logging" },
];

export const AUTOMOX_FLOW: { label: string; icon: IconName; highlight?: boolean }[] = [
  { label: "Endpoint devices", icon: "monitor" },
  { label: "Automox agent", icon: "cpu" },
  { label: "Cloud management platform", icon: "cloud", highlight: true },
  { label: "Automated policies", icon: "zap" },
  { label: "Reporting & compliance", icon: "fileText" },
];

export const AUTOMOX_TASKS: { title: string; desc: string; icon: IconName }[] = [
  { title: "Log retrieval & analysis", desc: "Automated retrieval of Windows event logs and entervo diagnostics.", icon: "terminal" },
  { title: "System monitoring", desc: "Continuous uptime verification and disk-space health checks.", icon: "activity" },
  { title: "Policy enforcement", desc: "Remediation scripts for endpoints that drift out of compliance.", icon: "shield" },
];

export interface ServiceTier {
  id: "basic" | "premium";
  name: string;
  summary: string;
  features: string[];
  note: string;
  recommended?: boolean;
}

export const SERVICE_TIERS: ServiceTier[] = [
  {
    id: "basic",
    name: "Information & Awareness",
    summary: "Vulnerability advisories and monthly bulletin intelligence for self-managed IT teams.",
    features: [
      "Monthly patch bulletins",
      "Critical security update notifications",
      "Email support (business hours)",
      "Basic compliance documentation",
    ],
    note: "Included with standard maintenance",
  },
  {
    id: "premium",
    name: "Managed Patch Service",
    summary: "End-to-end automated deployment, round-the-clock monitoring and full compliance reporting through Automox.",
    features: [
      "Everything in Information & Awareness",
      "Full patch deployment through Automox",
      "Priority 24/7 technical support",
      "Detailed monthly compliance reports",
      "Proactive system-health and reboot monitoring",
    ],
    note: "Fully managed — nothing left to your team",
    recommended: true,
  },
];

export const ROADMAP: { title: string; desc: string; status: string; icon: IconName }[] = [
  {
    title: ".NET Framework support",
    desc: "Automated policy orchestration for standalone .NET Framework cumulative security roll-ups across application servers.",
    status: "In development",
    icon: "layers",
  },
  {
    title: "Windows 11 support",
    desc: "Compatibility verification and feature-update servicing for Windows 11 Enterprise (22H2, 23H2, 24H2) fleets.",
    status: "Planned · Q1 2027",
    icon: "monitor",
  },
];

export const CONTACT = {
  phone: "+49 2166 266-0",
  email: "customer@scheidt-bachmann.de",
};

export const SCOPE_NOTE =
  "Patch bulletins and patch deployment cover only the supported systems and update types — LCU and SSU for the Windows Server and Windows 10 versions listed.";
