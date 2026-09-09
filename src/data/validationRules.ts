// Mock data. Replace with API calls when a backend exists.

import type { RuleCategory, ValidationRule } from "../types";

export const INITIAL_RULES: ValidationRule[] = [
{ id: 1, field: "IP Address", category: "Network", type: "Regex", pattern: "^\\d{1,3}(\\.\\d{1,3}){3}$", severity: "error", active: true, description: "Must be a valid IPv4 address" },
{ id: 2, field: "Communication Port", category: "Network", type: "Range", pattern: "1–65535", severity: "error", active: true, description: "Port must be within valid range" },
{ id: 3, field: "System Version", category: "System", type: "Min Version", pattern: "V2R5M5", severity: "error", active: true, description: "Minimum compatible version" },
{ id: 4, field: "Currency Code", category: "Localisation", type: "Enum (ISO 4217)", pattern: "EUR, GBP, CHF, USD…", severity: "error", active: true, description: "Must be a valid ISO 4217 code" },
{ id: 5, field: "Language Tag", category: "Localisation", type: "Regex", pattern: "^[a-z]{2}-[A-Z]{2}$", severity: "error", active: true, description: "Format: en-GB, de-DE, fr-FR…" },
{ id: 6, field: "UI Password", category: "Security", type: "Regex", pattern: "^[^@ ]{1,9}$", severity: "error", active: true, description: "Max 9 chars, no @ or spaces" },
{ id: 7, field: "Smart Validation Port", category: "Network", type: "Range", pattern: "8400–8450", severity: "warning", active: true, description: "Preferred range for smart validation" },
{ id: 8, field: "VAT Cross-check", category: "Finance", type: "Cross-field", pattern: "currency ↔ country", severity: "warning", active: false, description: "Warn if VAT doesn't match country norm" },
];

export const RULE_CATEGORY_BG: Record<RuleCategory, string> = {
  Network: "#E8F0FB", System: "#E8FAF1", Localisation: "#FEF9EC", Security: "#FEECEC", Finance: "#F3F0FC",
};

export const RULE_CATEGORY_FG: Record<RuleCategory, string> = {
  Network: "var(--blue)", System: "var(--green)", Localisation: "#B07800", Security: "var(--red)", Finance: "#6B4FBB",
};
