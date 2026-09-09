import type {
  AdminUser, AppNotification, CountryTemplate, OnboardingForm,
  PlatformConfig, Project, ValidationRule,
} from "../types";
import { PROJECTS } from "../data/projects";
import { INITIAL_ADMIN_USERS } from "../data/users";
import { INITIAL_TEMPLATES } from "../data/templates";
import { INITIAL_RULES } from "../data/validationRules";
import { DEFAULT_PLATFORM_CONFIG } from "../data/platformSettings";
import { INITIAL_NOTIFS } from "../data/notifications";
import { DEMO_ONBOARDING_DRAFT } from "../data/onboardingDraft";

/**
 * Stands in for the database.
 *
 * The modules under `src/api/` are the only things allowed to touch this, and
 * they hand callers copies — so from a component's point of view this is
 * already remote state. Writes land here rather than in a component's
 * `useState`, which is what lets an admin edit survive navigating away and
 * back: it is server state, and now it lives somewhere server-shaped.
 *
 * It resets on page reload, because it is still only memory.
 */
export const store = {
  projects: structuredClone(PROJECTS) as Project[],
  adminUsers: structuredClone(INITIAL_ADMIN_USERS) as AdminUser[],
  templates: structuredClone(INITIAL_TEMPLATES) as CountryTemplate[],
  rules: structuredClone(INITIAL_RULES) as ValidationRule[],
  settings: structuredClone(DEFAULT_PLATFORM_CONFIG) as PlatformConfig,
  notifications: structuredClone(INITIAL_NOTIFS) as AppNotification[],
  draft: structuredClone(DEMO_ONBOARDING_DRAFT) as OnboardingForm,
};

/** Next id for a collection, so created rows don't collide. */
export function nextId(rows: { id: number }[]): number {
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}
