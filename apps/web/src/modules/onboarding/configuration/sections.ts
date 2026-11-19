import {
  CONNECT_SERVICES, PAYMENT_METHOD_LABELS, SERVICE_FEE_TYPES, needsPaymentProvider, parseProducts, pspDefinition,
  validationGeneratedUrls, validationLocationId,
} from "@service-hub/shared";
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
        ...(has("smart-web-pay") ? [["Description", dash(data.opDescription)] as [string, string]] : []),
        ["Operator email", dash(data.opEmail)],
        ["Technical support email", dash(data.techEmail)],
        ["Phone", dash(data.phone)],
        ["Parking system version", dash(data.version)],
        ["Address", dash(data.address)],
        ["City", dash(data.city)],
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
          ...(has("smart-web-pay") ? [["Host name", dash(c.hostName)] as [string, string]] : []),
          ["Public IP", dash(c.ip)],
          ["Public port", dash(c.port)],
          ["Public URL", dash(c.url)],
          [has("entervo-connect") ? "Username / participant ID" : "Username", dash(c.uiUserId)],
          ["Cashier device ID", dash(c.deviceId)],
          ...(has("smart-web-pay") ? [
            ["Cell computer address", dash(c.address)],
            ["Cashier contract ID", dash(c.cashierContractId)],
            ["Cashier consumer ID", dash(c.cashierConsumerId)],
          ] as [string, string][] : []),
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
          ...((f.services ?? []).includes("smart-validation") ? [
            ["Time zone", dash(f.timezone)],
            ["Media types", (f.mediaTypes ?? []).join(", ") || "—"],
            ["Location-ID", validationLocationId(cells.find(c => c.key === f.cellComputer)?.cellId, f.id) || "—"],
          ] as [string, string][] : []),
          ...((f.services ?? []).includes("entervo-connect") ? [["Carpark type", dash(f.carparkType)] as [string, string]] : []),
          ...((f.services ?? []).includes("smart-web-pay") && (f.address || f.parentId) ? [
            ["Facility address", dash(f.address)],
            ["Parent facility ID", dash(f.parentId)],
          ] as [string, string][] : []),
        ],
      })),
    },
  ];

  if (has("smart-web-pay")) {
    sections.push({
      id: "web-pay", title: "smart web pay", icon: "creditCard",
      rows: [
        ["Contact-us e-mail", dash(data.contactUsEmails)],
        ["Incident e-mail", dash(data.incidentEmail)],
        ["E-mail receipt", dash(data.receiptEmails)],
        ["Terms of use link", dash(data.tocUrl)],
        ["PGS location description", dash(data.pgsLocationDescription)],
        ["Financial info", dash(data.financialInfo)],
        ["Tariff class", dash(data.tariff)],
        ["In-pay after entry / payment (min)", `${dash(data.inPayAfterEntry)} / ${dash(data.inPayAfterPayment)}`],
        ["Shift handling time", dash(data.shiftHandlingTime)],
        ["Service fee", data.serviceFeeType && data.serviceFeeType !== "none"
          ? `${SERVICE_FEE_TYPES.find(t => t.value === data.serviceFeeType)?.label}: ${dash(data.serviceFee)}`
          : dash(SERVICE_FEE_TYPES.find(t => t.value === data.serviceFeeType)?.label)],
        ["Prepayment / late payment", `${yesNo(data.prepay)} / ${yesNo(data.latePayment)}`],
        ['Show "in-pay time" after payment', yesNo(data.showInPayTime)],
      ],
    });
  }
  if (needsPaymentProvider(products)) {
    // Only the chosen PSP's own fields, and never a secret one — the value is
    // stripped before it gets here, and naming it "—" would only mislead.
    const definition = pspDefinition(data.psp);
    const fields = data.pspConfig?.fields ?? {};
    sections.push({
      id: "psp", title: "Payment service provider", icon: "creditCard",
      rows: [
        ["PSP", data.psp ? lookups.pspName(data.psp) : "—"],
        ...(definition?.fields.filter(f => !f.secret).map(f => [f.label, dash(fields[f.key])] as [string, string]) ?? []),
        ...(definition?.fields.some(f => f.secret) ? [["Credentials", "Stored securely, not shown"] as [string, string]] : []),
        ["Payment methods", (data.pspConfig?.methods ?? []).map(m => PAYMENT_METHOD_LABELS[m] ?? m).join(", ") || "—"],
      ],
    });
  }
  if (has("entervo-connect")) {
    sections.push({
      id: "connect", title: "entervo connect", icon: "cpu",
      rows: [
        ["Provider ID", dash(data.providerId)],
        ["Contact person", [data.salutation, data.contactTitle, data.contactFirstname, data.contactSurname].filter(Boolean).join(" ") || "—"],
        ["Contact address", [data.contactStreet, data.contactCity].filter(Boolean).join(", ") || "—"],
        ["Contact e-mail / phone", `${dash(data.contactEmail)} / ${dash(data.contactPhone)}`],
        ["Administrator", `${dash(data.adminName)} (${dash(data.adminUsername)})`],
        ["Administrator e-mail / phone", `${dash(data.adminEmail)} / ${dash(data.adminPhone)}`],
        ...CONNECT_SERVICES.map(svc => [
          svc.label,
          data[svc.toggle] ? `Yes — provider: ${dash(data[svc.provider])}` : "No",
        ] as [string, string]),
      ],
    });
  }
  if (has("smart-validation")) {
    sections.push({
      id: "validation", title: "smart validation", icon: "shield",
      rows: [
        ["Tenant shortname", dash(data.tenantShortname)],
        ["Tenant description", dash(data.tenantDescription)],
        ["SUBtech e-mail", dash(data.subtechEmail)],
        ["Incident / maintenance e-mail", dash(data.incidentEmail)],
        ["Show LPN in report", yesNo(data.showLpnInReport)],
        ...(() => {
          const urls = validationGeneratedUrls(data.tenantShortname);
          return urls ? ([
            ["Generated URL", urls.url],
            ["Sender e-mail", urls.senderEmail],
            ["SUBtech forward e-mail", urls.subtechEmail],
            ["OVAL Admin", urls.ovalAdminUrl],
            ["CPI Admin", urls.cpiAdminUrl],
            ["Kiosk app", urls.kioskUrl],
          ] as [string, string][]) : [];
        })(),
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
