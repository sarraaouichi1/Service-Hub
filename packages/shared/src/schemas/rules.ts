import { z } from "zod";
import type { FormTextKey, RuleCategory, RuleSeverity, ValidationRule } from "../domain.js";

/**
 * The single definition of every field-level validation rule.
 *
 * This is the one place a rule is written down. The wizard's step schemas
 * compile their checks from here (see `./onboarding`), and the admin Validation
 * Rules table renders its rows from here (see `../data/validationRules`), so
 * the enforced behaviour and the documented behaviour cannot drift apart.
 *
 * A rule describes the *shape* of a value, never whether it has to be present:
 * required-ness depends on which step you are on, so it lives in the step
 * schemas instead.
 */
export interface RuleDefinition extends ValidationRule {
  /** The wizard field this rule governs. Absent for cross-field rules. */
  key?: FormTextKey;
  /** Shown to the user when the check fails. `description` documents the rule; this corrects it. */
  message: string;
  /**
   * The check itself, run only against a non-empty value. Absent when the rule
   * is documented but not yet enforceable — cross-field rules have no single
   * field to attach to.
   */
  check?: (value: string) => boolean;
}

// Lean on Zod's own format validators rather than hand-rolling the hard ones.
const ipv4 = z.ipv4();
const email = z.email();
const url = z.url();

const matches = (schema: z.ZodType<string>) => (value: string) => schema.safeParse(value).success;

const inRange = (min: number, max: number) => (value: string) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max;
};

/** Parse a `VnRnMn` release string into comparable parts. */
const parseVersion = (value: string): [number, number, number] | undefined => {
  const m = /^V(\d+)R(\d+)M(\d+)$/i.exec(value.trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : undefined;
};

const MIN_VERSION: [number, number, number] = [2, 5, 5];

const atLeastMinVersion = (value: string) => {
  const parsed = parseVersion(value);
  if (!parsed) return false;
  for (let i = 0; i < 3; i++) {
    if (parsed[i] > MIN_VERSION[i]) return true;
    if (parsed[i] < MIN_VERSION[i]) return false;
  }
  return true;
};

/** Currencies the Cell Computer step offers. Kept in step with that select. */
const CURRENCIES = ["GBP", "EUR", "CHF", "USD", "CAD"] as const;

const digitsOnly = /^\d+$/;
const isNumber = (val: string) => !isNaN(Number(val.trim())) && val.trim() !== "";

export const VALIDATION_RULES: RuleDefinition[] = [
  {
    id: 1, key: "ip", field: "IP Address", category: "Network", type: "Regex",
    pattern: "0–255 . 0–255 . 0–255 . 0–255", severity: "error", active: true,
    description: "Must be a valid IPv4 address",
    message: "Must be a valid IPv4 address",
    check: matches(ipv4),
  },
  {
    id: 2, key: "port", field: "Communication Port", category: "Network", type: "Range",
    pattern: "1–65535", severity: "error", active: true,
    description: "Port must be within valid range",
    message: "Port must be between 1 and 65535",
    check: inRange(1, 65535),
  },
  {
    id: 3, key: "version", field: "System Version", category: "System", type: "Min Version",
    pattern: "V2R5M5", severity: "error", active: true,
    description: "Minimum compatible version",
    message: "Must be V2R5M5 or later, in the form VnRnMn",
    check: atLeastMinVersion,
  },
  {
    id: 4, key: "currency", field: "Currency Code", category: "Localisation", type: "Enum (ISO 4217)",
    pattern: CURRENCIES.join(", "), severity: "error", active: true,
    description: "Must be a valid ISO 4217 code",
    message: `Must be one of ${CURRENCIES.join(", ")}`,
    check: (value) => (CURRENCIES as readonly string[]).includes(value),
  },
  {
    id: 5, key: "lang", field: "Language Tag", category: "Localisation", type: "Regex",
    pattern: "^[a-z]{2}-[A-Z]{2}$", severity: "error", active: true,
    description: "Format: en-GB, de-DE, fr-FR…",
    message: "Must look like en-GB or de-DE",
    check: (value) => /^[a-z]{2}-[A-Z]{2}$/.test(value),
  },
  {
    id: 6, key: "uiPassword", field: "UI Password", category: "Security", type: "Regex",
    pattern: "^[^@ ]{1,9}$", severity: "error", active: true,
    description: "Max 9 chars, no @ or spaces",
    message: "Max 9 characters, with no @ or spaces",
    check: (value) => /^[^@ ]{1,9}$/.test(value),
  },
  {
    id: 7, key: "port", field: "Smart Validation Port", category: "Network", type: "Range",
    pattern: "8400–8450", severity: "warning", active: true,
    description: "Preferred range for smart validation",
    message: "Outside the preferred 8400–8450 range for smart validation",
    check: inRange(8400, 8450),
  },
  {
    id: 8, field: "VAT Cross-check", category: "Finance", type: "Cross-field",
    pattern: "currency ↔ country", severity: "warning", active: false,
    description: "Warn if VAT doesn't match country norm",
    message: "VAT rate is unusual for the selected country",
  },
  {
    id: 9, key: "opEmail", field: "Operator Email", category: "Contact", type: "Email",
    pattern: "name@domain.tld", severity: "error", active: true,
    description: "Operator's primary contact address",
    message: "Must be a valid email address",
    check: matches(email),
  },
  {
    id: 10, key: "techEmail", field: "Technical Support Email", category: "Contact", type: "Email",
    pattern: "name@domain.tld", severity: "error", active: true,
    description: "Checked only when an address is given",
    message: "Must be a valid email address",
    check: matches(email),
  },
  {
    id: 11, key: "cellId", field: "Cell Computer ID", category: "System", type: "Digits",
    pattern: "^\\d+$", severity: "error", active: true,
    description: "Numeric ID issued by the entervo system",
    message: "Must be digits only",
    check: (value) => digitsOnly.test(value),
  },
  {
    id: 12, key: "uiUserId", field: "UI User ID", category: "Security", type: "Digits",
    pattern: "^\\d+$", severity: "error", active: true,
    description: "Digits only",
    message: "Must be digits only",
    check: (value) => digitsOnly.test(value),
  },
  {
    id: 13, key: "vat", field: "VAT Percentage", category: "Finance", type: "Range",
    pattern: "0–100", severity: "error", active: true,
    description: "Whole percentage points",
    message: "Must be a whole number between 0 and 100",
    check: inRange(0, 100),
  },
  {
    id: 14, key: "decimals", field: "Decimal Places in Currency", category: "Finance", type: "Range",
    pattern: "0–4", severity: "error", active: true,
    description: "Digits shown after the decimal separator",
    message: "Must be a whole number between 0 and 4",
    check: inRange(0, 4),
  },
  {
    id: 15, key: "tocUrl", field: "Terms & Conditions URL", category: "System", type: "URL",
    pattern: "https://…", severity: "error", active: true,
    description: "Public link shown in the app",
    message: "Must be a valid URL, including https://",
    check: matches(url),
  },
  {
    id: 16, key: "tariff", field: "Tariff Class ID", category: "Finance", type: "Digits",
    pattern: "^\\d+$", severity: "error", active: true,
    description: "0 = standard tariff",
    message: "Must be digits only",
    check: (value) => digitsOnly.test(value),
  },
  {
    id: 17, key: "opId", field: "Operator ID", category: "System", type: "Digits",
    pattern: "^\\d+$", severity: "error", active: true,
    description: "Operator unique number, e.g. 46722",
    message: "Operator ID must be digits only",
    check: (value) => digitsOnly.test(value),
  },
  {
    id: 18, key: "providerId", field: "Provider ID", category: "System", type: "Digits",
    pattern: "^\\d+$", severity: "error", active: true,
    description: "Provider unique identifier number",
    message: "Provider ID must be digits only",
    check: (value) => digitsOnly.test(value),
  },
  {
    id: 19, key: "sshPort", field: "SSH Port", category: "Network", type: "Range",
    pattern: "1–65535", severity: "error", active: true,
    description: "SSH Port delivered by DevOps",
    message: "SSH Port must be between 1 and 65535",
    check: inRange(1, 65535),
  },
  {
    id: 20, key: "heightLimit", field: "Height Limit", category: "System", type: "Number",
    pattern: "Decimal or digits", severity: "error", active: true,
    description: "Clearance height in meters, e.g. 2.10",
    message: "Height limit must be a valid number",
    check: isNumber,
  },
  {
    id: 21, key: "parkingLots", field: "Number of Parking Lots", category: "System", type: "Digits",
    pattern: "^\\d+$", severity: "error", active: true,
    description: "Total car park capacity",
    message: "Number of parking lots must be digits only",
    check: (value) => digitsOnly.test(value),
  },
  {
    id: 22, key: "chargingStations", field: "Electric Charging Stations", category: "System", type: "Digits",
    pattern: "^\\d+$", severity: "error", active: true,
    description: "Number of EV charging points",
    message: "Charging stations must be digits only",
    check: (value) => digitsOnly.test(value),
  },
  {
    id: 23, key: "entryLanes", field: "Number of Entry Lanes", category: "System", type: "Digits",
    pattern: "^\\d+$", severity: "error", active: true,
    description: "Entry barriers / lanes",
    message: "Entry lanes must be digits only",
    check: (value) => digitsOnly.test(value),
  },
  {
    id: 24, key: "exitLanes", field: "Number of Exit Lanes", category: "System", type: "Digits",
    pattern: "^\\d+$", severity: "error", active: true,
    description: "Exit barriers / lanes",
    message: "Exit lanes must be digits only",
    check: (value) => digitsOnly.test(value),
  },
  {
    id: 25, key: "totalSpaces", field: "Total Parking Spaces", category: "System", type: "Digits",
    pattern: "^\\d+$", severity: "error", active: true,
    description: "Total spaces for smart select portal",
    message: "Total spaces must be digits only",
    check: (value) => digitsOnly.test(value),
  },
  {
    id: 26, key: "contractOneTimeFee", field: "One-Time Fee", category: "Finance", type: "Number",
    pattern: "Numeric value", severity: "error", active: true,
    description: "Initial fee for contract product",
    message: "One-time fee must be a valid number",
    check: isNumber,
  },
  {
    id: 27, key: "contractRecurringFee", field: "Recurring Fee", category: "Finance", type: "Number",
    pattern: "Numeric value", severity: "error", active: true,
    description: "Monthly or recurring charge",
    message: "Recurring fee must be a valid number",
    check: isNumber,
  },
  {
    id: 28, key: "contractMinLeaseMonths", field: "Minimum Lease Term (Months)", category: "Finance", type: "Digits",
    pattern: "^\\d+$", severity: "error", active: true,
    description: "Minimum commitment in months",
    message: "Minimum lease term must be digits only",
    check: (value) => digitsOnly.test(value),
  },
  {
    id: 29, key: "contractNoticePeriod", field: "Notice Period (Months)", category: "Finance", type: "Digits",
    pattern: "^\\d+$", severity: "error", active: true,
    description: "Cancellation notice period in months",
    message: "Notice period must be digits only",
    check: (value) => digitsOnly.test(value),
  },
  {
    id: 30, key: "contractMaxBookings", field: "Maximum Bookings", category: "System", type: "Digits",
    pattern: "^\\d+$", severity: "error", active: true,
    description: "Maximum product sale limit",
    message: "Max bookings must be digits only",
    check: (value) => digitsOnly.test(value),
  },
  {
    id: 31, key: "timeCardFee", field: "Time Card Price", category: "Finance", type: "Number",
    pattern: "Numeric value", severity: "error", active: true,
    description: "Pass purchase price",
    message: "Time card price must be a valid number",
    check: isNumber,
  },
  {
    id: 32, key: "bundleFee", field: "Bundle Price", category: "Finance", type: "Number",
    pattern: "Numeric value", severity: "error", active: true,
    description: "Price for slot package",
    message: "Bundle price must be a valid number",
    check: isNumber,
  },
  {
    id: 33, key: "bundleSlotsCount", field: "Number of Slots", category: "System", type: "Digits",
    pattern: "^\\d+$", severity: "error", active: true,
    description: "Number of visits or slots included",
    message: "Number of slots must be digits only",
    check: (value) => digitsOnly.test(value),
  },
  {
    id: 34, key: "bundleOverstayFee", field: "Overstay Fee Per Hour", category: "Finance", type: "Number",
    pattern: "Numeric value", severity: "error", active: true,
    description: "Charge per hour if vehicle remains past slots",
    message: "Overstay fee must be a valid number",
    check: isNumber,
  },
  {
    id: 35, key: "prepaidPrice", field: "Prepaid Purchase Price", category: "Finance", type: "Number",
    pattern: "Numeric value", severity: "error", active: true,
    description: "Actual price charged to customer",
    message: "Prepaid price must be a valid number",
    check: isNumber,
  },
  {
    id: 36, key: "prepaidCredit", field: "Prepaid Credit Value", category: "Finance", type: "Number",
    pattern: "Numeric value", severity: "error", active: true,
    description: "Balance loaded onto customer card",
    message: "Prepaid credit value must be a valid number",
    check: isNumber,
  },
  {
    id: 37, key: "prepaidMinBalance", field: "Minimum Balance Notification Threshold", category: "Finance", type: "Number",
    pattern: "Numeric value", severity: "error", active: true,
    description: "Threshold triggering balance notification",
    message: "Minimum balance threshold must be a valid number",
    check: isNumber,
  },
  {
    id: 38, key: "contactEmail", field: "Contact Email", category: "Contact", type: "Email",
    pattern: "name@domain.tld", severity: "error", active: true,
    description: "Responsible contact person email",
    message: "Must be a valid email address",
    check: matches(email),
  },
  {
    id: 39, key: "adminEmail", field: "Admin Technical Email", category: "Contact", type: "Email",
    pattern: "name@domain.tld", severity: "error", active: true,
    description: "Technical administrator email",
    message: "Must be a valid email address",
    check: matches(email),
  },
  {
    id: 40, key: "subtechEmail", field: "SUBTECH Admin Email", category: "Contact", type: "Email",
    pattern: "name@domain.tld", severity: "error", active: true,
    description: "Email for OVAL ADMIN portal administration",
    message: "Must be a valid email address",
    check: matches(email),
  },
  {
    id: 41, key: "incidentEmail", field: "Maintenance / Incident Email", category: "Contact", type: "Email",
    pattern: "name@domain.tld", severity: "error", active: true,
    description: "Distribution list for maintenance and incident alerts",
    message: "Must be a valid email address",
    check: matches(email),
  },
  {
    id: 42, key: "onboardingEmail", field: "Onboarding Progress Notification Email", category: "Contact", type: "Email",
    pattern: "name@domain.tld", severity: "error", active: true,
    description: "Notifications regarding onboarding progress",
    message: "Must be a valid email address",
    check: matches(email),
  },
  {
    id: 43, key: "tenantShortname", field: "Tenant Shortname", category: "System", type: "Regex",
    pattern: "^[a-z0-9_-]{1,20}$", severity: "error", active: true,
    description: "Max 20 chars, small letters/digits only (part of URL)",
    message: "Max 20 characters, lowercase letters, numbers, or dashes only",
    check: (value) => /^[a-z0-9_-]{1,20}$/.test(value),
  },
  {
    id: 44, key: "privacyUrl", field: "Privacy Policy URL", category: "System", type: "URL",
    pattern: "https://…", severity: "error", active: true,
    description: "Public link to privacy policy",
    message: "Must be a valid URL, including https://",
    check: matches(url),
  },
  {
    id: 45, key: "dailyMax", field: "Daily Maximum Pricing", category: "Finance", type: "Number",
    pattern: "Numeric value", severity: "error", active: true,
    description: "Maximum daily parking fee",
    message: "Daily maximum must be a valid number",
    check: isNumber,
  },
];

/**
 * An administrator's changes to the rule table.
 *
 * A rule's pattern and check are fixed here in code — those are the definition,
 * and the admin screen shows exactly what the wizard runs. What an admin *can*
 * change is whether a rule applies and how hard it bites, and those flags are
 * stored server-side. Passing them in is what makes the toggles on the admin
 * screen actually change enforcement rather than just the table.
 */
export type RuleOverrides = Record<number, { active?: boolean; severity?: RuleSeverity }>;

/**
 * Rules that block progress for a given field: active, hard, and enforceable.
 * Warnings are carried in the registry and shown in the admin table, but they
 * do not stop the user advancing.
 */
export function blockingRulesFor(
  key: FormTextKey,
  overrides?: RuleOverrides,
): RuleDefinition[] {
  return VALIDATION_RULES.filter((rule) => {
    if (rule.key !== key || !rule.check) return false;
    const override = overrides?.[rule.id];
    const active = override?.active ?? rule.active;
    const severity = override?.severity ?? rule.severity;
    return active && severity === "error";
  });
}

export type { RuleCategory, RuleSeverity };
