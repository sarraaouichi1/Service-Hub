// Reference data the wizard offers as choices. Read-only: configured by S&B,
// not edited through the hub, so it is served from here rather than a table.

import type { ProductDefinition, Psp, PatchBulletin, PatchStage, PatchServiceTier } from "@service-hub/shared";

export const PRODUCTS: ProductDefinition[] = [
  {
    id: "smart-web-pay",
    name: "entervo smart web pay",
    desc: "Mobile web payment solution — allows drivers to pay for parking via QR code or web browser without downloading an app.",
    icon: "💳",
    color: "#1A6FD4",
    bg: "#E8F0FB",
    fields: ["Operator Data", "Cell Computer IP/Port", "Receipt & App Config", "PSP / Payment Gateway"],
  },
  {
    id: "entervo-connect",
    name: "entervo connect",
    desc: "Real-time data exchange platform — connects entervo parking systems with third-party mobility apps and city platforms.",
    icon: "🔗",
    color: "#7C3AED",
    bg: "#EDE9FE",
    fields: ["Business Partner", "Tech Admin & Cell", "Services (Auth/Count)", "Connection Points / Facilities"],
  },
  {
    id: "smart-validation",
    name: "entervo smart validation",
    desc: "Web validation tenant request — lets local shops, hotels, and businesses validate parking tickets for customers.",
    icon: "✅",
    color: "#1AB870",
    bg: "#E8FAF1",
    fields: ["Tenant Profile & URL", "Distribution Lists", "Cell Computer IP/Port", "Carpark & Mediatypes"],
  },
  {
    id: "mobility-connect",
    name: "mobility CONNECT",
    desc: "Full-service garage integration interface — connects car parks with mobility service providers and EV charging networks.",
    icon: "🚗",
    color: "#0284C7",
    bg: "#E0F2FE",
    fields: ["Garage Basic Info", "Opening Hours & Lanes", "Geo Coordinates", "Mobility Provider Keys"],
  },
  {
    id: "smart-select",
    name: "entervo smart select",
    desc: "Custom webshop & product selection portal — offers season parking, time cards, time slot bundles, and prepaid options.",
    icon: "🎛️",
    color: "#D97706",
    bg: "#FEF3C7",
    fields: ["Portal URL & Branding", "Payment Types & Webshop", "Special Functions", "Product Packages"],
  },
  {
    id: "smart-tenant",
    name: "entervo smart tenant",
    desc: "Multi-tenant digital management portal — enables commercial tenants to oversee parking allocations, access, and rules.",
    icon: "🏢",
    color: "#E11D48",
    bg: "#FFE4E6",
    fields: ["Tenant Subdomain", "Branding & DKIM Email", "Garage Facilities", "Automated Closing Rules"],
  },
];

export const PSP_LIST: Psp[] = [
  { id: "fiserv", name: "Fiserv / Telecash", tag: "EU / Global" },
  { id: "planet", name: "Planet", tag: "Hospitality" },
  { id: "trustcommerce", name: "TrustCommerce", tag: "US / CA" },
  { id: "nmi", name: "NMI", tag: "US / EU" },
  { id: "ccv", name: "CCV", tag: "Benelux" },
  { id: "worldline", name: "Worldline", tag: "EU" },
];

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
