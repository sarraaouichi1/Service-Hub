import type { ValidationRule } from "../types";
import { fail, ok } from "./client";
import { store } from "./store";

/**
 * Validation rules as server state.
 *
 * What the wizard actually enforces still comes from the registry in
 * `src/schemas/rules.ts`, which is a module constant — so toggling a rule here
 * changes the table without changing enforcement. Closing that gap means the
 * schemas reading their active/severity flags from this endpoint, which needs
 * the real backend behind it.
 */

export function listRules(): Promise<ValidationRule[]> {
  return ok(store.rules);
}

export async function updateRule(id: number, patch: Partial<ValidationRule>): Promise<ValidationRule> {
  const index = store.rules.findIndex((rule) => rule.id === id);
  if (index === -1) return fail(404, `No rule with id ${id}`);
  store.rules[index] = { ...store.rules[index], ...patch, id };
  return ok(store.rules[index]);
}
