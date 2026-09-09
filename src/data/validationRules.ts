// Derived from the rule registry in src/schemas/rules.ts — not mock data.
// The admin table and the wizard's schemas read the same definitions, so what
// this screen documents is exactly what the wizard enforces.

import type { RuleCategory, ValidationRule } from "../types";
import { VALIDATION_RULES } from "../schemas/rules";

/**
 * The admin table's view of the registry: display columns only, with the
 * message and check functions dropped.
 */
export const INITIAL_RULES: ValidationRule[] = VALIDATION_RULES.map(
  ({ id, field, category, type, pattern, severity, active, description }) => ({
    id, field, category, type, pattern, severity, active, description,
  }),
);

export const RULE_CATEGORY_BG: Record<RuleCategory, string> = {
  Network: "#E8F0FB", System: "#E8FAF1", Localisation: "#FEF9EC", Security: "#FEECEC", Finance: "#F3F0FC", Contact: "#EAF7F9",
};

export const RULE_CATEGORY_FG: Record<RuleCategory, string> = {
  Network: "var(--blue)", System: "var(--green)", Localisation: "#B07800", Security: "var(--red)", Finance: "#6B4FBB", Contact: "#0E7490",
};
