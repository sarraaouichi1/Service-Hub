import type { FormTextKey, ProductId } from "./domain.js";

/**
 * What each product's official onboarding sheet marks as required (*).
 *
 * Sources, one per product:
 *   smart validation — "smart validation ONBOARDING SHEET (Version 4.4)"
 *   smart web pay    — "smart web pay ONBOARDING SHEET (Version 3.1)"
 *   entervo connect  — "entervo connect ONBOARDING SHEET (Version 3.0)"
 *
 * A field is required when *any* selected product's sheet requires it, which
 * is why these are per-product lists rather than flags on the step schemas.
 * The sheet row is noted beside each entry so a later sheet version can be
 * diffed against this file. Formats (digits, e-mail lists…) are not here:
 * they are rules in `schemas/rules.ts`, which an administrator can switch.
 *
 * Fields the sheets mark "provided by PS ITOPS" or "will be set by ITOPS"
 * (web pay Location ID, validation App ID, connect facility API key/username/
 * password) are deliberately absent: S&B fills them in, not the customer.
 */
export interface RequiredField {
  key: FormTextKey;
  message: string;
}

export const PRODUCT_REQUIRED_FIELDS: Partial<Record<ProductId, readonly RequiredField[]>> = {
  "smart-validation": [
    { key: "tenantShortname", message: "Tenant shortname is required" },             // A4
    { key: "tenantDescription", message: "Tenant description is required" },         // A5
    { key: "currency", message: "Currency is required for smart validation" },        // A7
    { key: "opId", message: "Operator ID is required for smart validation" },         // A9
    { key: "subtechEmail", message: "SUBtech e-mail is required" },                   // A10
  ],
  "smart-web-pay": [
    { key: "city", message: "City is required for smart web pay" },                   // A5 (Location)
    { key: "opId", message: "Operator ID is required for smart web pay" },            // A8
    { key: "opDescription", message: "Operator description is required" },           // A10
    { key: "contactUsEmails", message: "Contact-us e-mail is required" },             // A12
    { key: "incidentEmail", message: "Incident e-mail is required for smart web pay" }, // A13
    { key: "receiptEmails", message: "Receipt e-mail is required" },                 // A14
    { key: "tocUrl", message: "Terms of use link is required" },                      // A19
    { key: "pgsLocationDescription", message: "PGS location description is required" }, // A22
    { key: "decimals", message: "Currency decimal places are required" },             // A49 (default 2)
    { key: "inPayAfterEntry", message: "In-pay time after entry is required (0 if none)" },     // A57
    { key: "inPayAfterPayment", message: "In-pay time after payment is required (0 if none)" }, // A58
    { key: "serviceFeeType", message: "Choose the service fee (none, fixed or percentage)" },   // A60
  ],
  "entervo-connect": [
    { key: "city", message: "City is required for entervo connect" },                 // A6
    { key: "currency", message: "Currency is required for entervo connect" },         // A7
    { key: "providerId", message: "Provider ID is required" },                        // A8
    { key: "opId", message: "Operator ID is required for entervo connect" },          // A9
    { key: "salutation", message: "Contact person's salutation is required" },        // A12
    { key: "contactFirstname", message: "Contact person's first name is required" },  // A14
    { key: "contactSurname", message: "Contact person's surname is required" },       // A15
    { key: "contactEmail", message: "Contact person's e-mail is required" },          // A18
    { key: "contactPhone", message: "Contact person's phone is required" },           // A19
    { key: "adminUsername", message: "Administrator username is required" },         // A22
    { key: "adminEmail", message: "Administrator e-mail is required" },               // A23
    { key: "adminName", message: "Administrator name is required" },                  // A24
  ],
};

/**
 * Per cell computer: web pay and validation need the cell computer reachable
 * (IP + port, or a URL — the sheets offer either, URL taking priority) and a
 * user on it; web pay also names the host shown to customers; connect needs
 * the participant (user) and password but no address.
 */
export const CELL_REQUIREMENTS = {
  needsAddress: ["smart-web-pay", "smart-validation"] as readonly ProductId[],
  needsUser: ["smart-web-pay", "smart-validation", "entervo-connect"] as readonly ProductId[],
  needsHostName: ["smart-web-pay"] as readonly ProductId[],
};

/** The connect sheet's services, each a YES/NO with the provider's name. */
export const CONNECT_SERVICES = [
  { toggle: "onlineAuth", provider: "onlineAuthProvider", label: "Online Authorization" },
  { toggle: "customerMedia", provider: "customerMediaProvider", label: "Customer & Media" },
  { toggle: "counting", provider: "countingProvider", label: "Counting" },
  { toggle: "deviceControl", provider: "deviceControlProvider", label: "Device Control" },
] as const;

export const SERVICE_FEE_TYPES = [
  { value: "none", label: "None" },
  { value: "fixed", label: "Fixed amount" },
  { value: "percentage", label: "Percentage" },
] as const;

/**
 * The addresses the smart validation sheet generates from the tenant
 * shortname ("automatically generated data", rows 49–55). Shown so the
 * customer sees what their shortname turns into, never typed.
 */
export function validationGeneratedUrls(shortname: string | undefined) {
  const s = (shortname ?? "").trim();
  if (!s) return null;
  const portal = `https://validation-portal-smartvalidation-${s}.prod.parking-core.scheidt-bachmann.net`;
  return {
    url: `smartvalidation-${s}.scheidt-bachmann.net`,
    senderEmail: `smartvalidation-${s}@scheidt-bachmann.net`,
    subtechEmail: `smartvalidation-subtech-${s}@scheidt-bachmann.net`,
    ovalAdminUrl: `${portal}/oval-admin`,
    cpiAdminUrl: `${portal}/cpi-admin`,
    kioskUrl: `https://smartvalidation-kiosk.prod.parking-core.scheidt-bachmann.net/${s}/login`,
  };
}

/**
 * The validation sheet's facility Location-ID: "SB" + cell ID + "." + facility
 * ID + ".0". (Version 4.4 of the sheet also appends cell C12, which is the
 * "show LPN in report" yes/no — almost certainly a row shift in the sheet, so
 * it is left out here.)
 */
export function validationLocationId(cellId: string | undefined, facilityId: string | undefined): string {
  const cell = (cellId ?? "").trim();
  const facility = (facilityId ?? "").trim();
  return cell && facility ? `SB${cell}.${facility}.0` : "";
}

/** Common IANA time zones for the facility time zone picker. */
export const FACILITY_TIMEZONES = [
  "Europe/London", "Europe/Dublin", "Europe/Lisbon", "Europe/Berlin", "Europe/Vienna", "Europe/Zurich",
  "Europe/Paris", "Europe/Brussels", "Europe/Amsterdam", "Europe/Luxembourg", "Europe/Madrid", "Europe/Rome",
  "Europe/Copenhagen", "Europe/Stockholm", "Europe/Oslo", "Europe/Helsinki", "Europe/Warsaw", "Europe/Prague",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Toronto",
  "America/Vancouver", "Australia/Sydney", "Australia/Melbourne", "Asia/Dubai", "Asia/Singapore",
] as const;
