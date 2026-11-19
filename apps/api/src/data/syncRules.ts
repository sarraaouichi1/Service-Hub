import { VALIDATION_RULES } from "@service-hub/shared";
import { prisma } from "../db.js";

/**
 * Bring the rule table in line with the shared registry.
 *
 * The registry is the definition; the table only adds what an administrator
 * may change — `active` and `severity`. Running this at start-up rather than
 * only in the seed matters because a database is seeded once: a rule added in
 * a later release (the sheet-driven rules of v1.1, say) would otherwise be
 * enforced by the wizard yet never appear on the admin screen to be switched.
 * Existing rows keep their administrator's flags; only the descriptive columns
 * are refreshed.
 */
export async function syncRules(): Promise<void> {
  for (const rule of VALIDATION_RULES) {
    const { id, field, category, type, pattern, severity, active, description } = rule;
    await prisma.rule.upsert({
      where: { id },
      update: { field, category, type, pattern, description },
      create: { id, field, category, type, pattern, severity, active, description },
    });
  }
}
