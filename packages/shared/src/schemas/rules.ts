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
