import { needsPaymentProvider, parseProducts } from "@service-hub/shared";
import type { IconName, OnboardingForm } from "../../../types";

/**
 * An onboarding configuration laid out as sections of label/value rows.
 *
 * One function feeds both the on-screen view and the "Copy configuration"
 * text, so what someone reads and what they paste into the cell computer can't
 * disagree. Product-specific sections appear only for products selected.
 */
export interface ConfigSection {
  id: string;
  title: string;
  icon: IconName;
  rows: [string, string][];
  /** Nested blocks, one per cell computer or facility. */
  groups?: { title: string; rows: [string, string][] }[];
}

const dash = (v: unknown) => (v === undefined || v === null || v === "" ? "—" : String(v));
const yesNo = (v: unknown) => (v ? "Yes" : "No");

export function buildConfigurationSections(
  data: OnboardingForm,
  lookups: { productName: (id: string) => string; pspName: (id: string) => string },
): ConfigSection[] {
  const products = parseProducts(data.product);
  const has = (id: string) => products.includes(id as never);
  const cells = data.cellComputers ?? [];
  const cellName = (key?: string) => {
    const index = cells.findIndex(c => c.key === key);
    return index < 0 ? "—" : cells[index].name || `Cell computer ${index + 1}`;
  };

  const sections: ConfigSection[] = [
    {
      id: "products", title: "Products", icon: "grid",
      rows: products.length
        ? products.map((p, i) => [i === 0 ? "Starting product" : `Product ${i + 1}`, lookups.productName(p)])
        : [["Products", "—"]],
    },
    {
      id: "operator", title: "Operator", icon: "building",
      rows: [
        ["Operator name", dash(data.opName)],
        ["Operator ID", dash(data.opId)],
        ["Operator email", dash(data.opEmail)],
        ["Technical support email", dash(data.techEmail)],
        ["Phone", dash(data.phone)],
        ["Parking system version", dash(data.version)],
        ["Address", dash(data.address)],
        ["Country", dash(data.country)],
        ["Language tag", dash(data.lang)],
        ["Currency", dash(data.currency)],
        ["Decimal places", dash(data.decimals)],
        ["VAT %", dash(data.vat)],
      ],
    },
    {
      id: "cells", title: `Cell computers (${cells.length})`, icon: "server",
      rows: [
        ["Reachable from outside", yesNo(data.reachable)],
        ["Port forwarding set", yesNo(data.forwarding)],
        ["LPR / Barcode / LFK", [data.lpr && "LPR", data.barcode && "Barcode", data.lfk && "LFK"].filter(Boolean).join(", ") || "—"],
      ],
      groups: cells.map((c, i) => ({
        title: c.name || `Cell computer ${i + 1}`,
        rows: [
          ["Cell computer ID", dash(c.cellId)],
          ["URL", dash(c.url)],
          ["Static public IP", dash(c.ip)],
          ["Port", dash(c.port)],
          ["UI user ID", dash(c.uiUserId)],
          ["Cashier device ID", dash(c.deviceId)],
          ...(has("entervo-connect") ? [["SSH port", dash(c.sshPort)] as [string, string]] : []),
        ],
      })),
    },
    {
      id: "facilities", title: `Facilities (${data.facilities?.length ?? 0})`, icon: "mapPin",
      rows: [],
      groups: (data.facilities ?? []).map((f, i) => ({
        title: `${dash(f.id)} — ${f.name || `Facility ${i + 1}`}`,
        rows: [
          ["City", dash(f.city)],
          ["Cell computer", cellName(f.cellComputer)],
          ["Services", (f.services ?? []).map(lookups.productName).join(", ") || "—"],
          ["InPay entry / payment (min)", `${dash(f.inpayEntry)} / ${dash(f.inpayPayment)}`],
        ],
      })),
    },
  ];

  if (has("smart-web-pay")) {
    sections.push({
      id: "web-pay", title: "smart web pay", icon: "creditCard",
      rows: [
        ["Financial information", dash(data.financialInfo)],
        ["Terms & conditions URL", dash(data.tocUrl)],
        ["Tariff class", dash(data.tariff)],
        ["Vouchers / Prepayment / Top-up", [data.vouchers && "Vouchers", data.prepay && "Prepayment", data.topup && "Top-up"].filter(Boolean).join(", ") || "—"],
      ],
    });
  }
  if (needsPaymentProvider(products)) {
    const methods = Object.entries(data).filter(([k, v]) => k.startsWith("pm_") && v).map(([k]) => k.slice(3));
    sections.push({
      id: "psp", title: "Payment service provider", icon: "creditCard",
      rows: [
        ["PSP", data.psp ? lookups.pspName(data.psp) : "—"],
        ["Merchant ID", dash(data.pspMid)],
        ["Terminal ID", dash(data.pspTid)],
        ["Payment methods", methods.join(", ") || "—"],
      ],
    });
  }
  if (has("entervo-connect")) {
    sections.push({
      id: "connect", title: "entervo connect", icon: "cpu",
      rows: [
        ["Provider ID", dash(data.providerId)],
        ["Contact email", dash(data.contactEmail)],
        ["Contact phone", dash(data.contactPhone)],
        ["Technical admin", dash(data.adminUsername)],
        ["Admin email", dash(data.adminEmail)],
        ["Services", [data.onlineAuth && "Online authorization", data.customerMedia && "Customer & media", data.counting && "Counting"].filter(Boolean).join(", ") || "—"],
      ],
    });
  }
  if (has("smart-validation")) {
    sections.push({
      id: "validation", title: "smart validation", icon: "shield",
      rows: [
        ["Tenant shortname", dash(data.tenantShortname)],
        ["Tenant description", dash(data.tenantDescription)],
        ["SUBTECH email", dash(data.subtechEmail)],
        ["Incident email", dash(data.incidentEmail)],
        ["Onboarding email", dash(data.onboardingEmail)],
        ["Media types", dash(data.mediatypes)],
      ],
    });
  }
  if (has("mobility-connect") || has("smart-select")) {
    sections.push({
      id: "garage", title: "Car park parameters", icon: "mapPin",
      rows: [
        ["Carpark type", dash(data.carparkType)],
        ["Height limit (m)", dash(data.heightLimit)],
        ["Parking lots", dash(data.parkingLots)],
        ["EV charging stations", dash(data.chargingStations)],
        ["Entry / exit lanes", `${dash(data.entryLanes)} / ${dash(data.exitLanes)}`],
        ["Open 24/7", yesNo(data.open247)],
        ["Daily maximum", dash(data.dailyMax)],
        ["Mobility provider", dash(data.mobilityProvider)],
      ],
    });
  }
  if (has("smart-select")) {
    sections.push({
      id: "select", title: "smart select portal", icon: "externalLink",
      rows: [
        ["Portal URL", dash(data.portalUrl)],
        ["Project name", dash(data.projectName)],
        ["Sender email / domain", `${dash(data.senderEmail)} / ${dash(data.senderDomain)}`],
        ["Payment settlement", dash(data.paymentType)],
        ["Contract product", dash(data.contractProductName)],
        ["Time card product", dash(data.timeCardProductName)],
        ["Bundle product", dash(data.bundleProductName)],
        ["Prepaid product", dash(data.prepaidProductName)],
      ],
    });
  }
  sections.push({
    id: "delivery", title: "Delivery check & contract", icon: "check",
    rows: [
      ["Delivery confirmed by Sales", yesNo(data.salesApproved)],
      ["Contract valid until", dash(data.contractDate)],
    ],
  });
  return sections;
}

/** Plain text for the clipboard: readable in an email and in a ticket. */
export function sectionsToText(title: string, sections: ConfigSection[]): string {
  const width = Math.max(...sections.flatMap(s => [...s.rows, ...(s.groups ?? []).flatMap(g => g.rows)]).map(([k]) => k.length), 10);
  const line = ([k, v]: [string, string], indent = "") => `${indent}${(k + ":").padEnd(width + 2)}${v}`;
  const out = [title, "=".repeat(title.length)];
  for (const s of sections) {
    out.push("", `## ${s.title}`);
    out.push(...s.rows.map(r => line(r)));
    for (const g of s.groups ?? []) {
      out.push(`  - ${g.title}`);
      out.push(...g.rows.map(r => line(r, "      ")));
    }
  }
  return out.join("\n");
}
