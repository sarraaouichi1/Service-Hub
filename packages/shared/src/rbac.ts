import type { UserRole } from "./domain.js";

/**
 * Role-based access control.
 *
 * Roles say who someone is; permissions say what they may do. Every check in
 * the system — the API's route guards and the web app's UI gating — asks about
 * a *permission*, never a role. That way adding a role, or moving a capability
 * between roles, is a change to the table below and nothing else.
 *
 * This lives in the shared package precisely so the two sides cannot disagree
 * about what a role means. The server's answer is the one that counts: the
 * client uses these to decide what to *show*, the server to decide what to
 * *allow*, and a client that gets it wrong is a cosmetic bug, not a hole.
 */

export const PERMISSIONS = [
  "project:read",
  "project:create",
  "project:update",
  "project:submit",
  "project:review",
  "project:approve",
  "payment:confirm",
  "patch:read",
  "patch:schedule",
  "template:read",
  "template:write",
  "rule:read",
  "rule:write",
  "user:read",
  "user:write",
  "settings:read",
  "settings:write",
  "audit:read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** What each role may do. The single source for both sides of the wire. */
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  Admin: PERMISSIONS,
  "Project Manager": [
    "project:read", "project:create", "project:update", "project:submit",
    "patch:read", "template:read", "rule:read", "user:read",
  ],
  Sales: ["project:read", "payment:confirm"],
  Reviewer: ["project:read", "project:review", "project:approve", "rule:read", "audit:read"],
  DevOps: ["project:read", "patch:read", "patch:schedule"],
  Partner: ["project:read", "project:create", "project:update", "project:submit", "patch:read"],
  Customer: ["project:read", "project:create", "project:update", "project:submit"],
};

/** Everything the given roles allow, flattened and de-duplicated. */
export function permissionsFor(roles: readonly UserRole[]): Permission[] {
  const granted = new Set<Permission>();
  for (const role of roles) {
    for (const permission of ROLE_PERMISSIONS[role] ?? []) granted.add(permission);
  }
  return [...granted];
}

/** True when the permissions cover the one asked for. */
export function can(
  held: readonly Permission[] | undefined,
  permission: Permission,
): boolean {
  return !!held?.includes(permission);
}

/** True when the permissions cover every one asked for. */
export function canAll(
  held: readonly Permission[] | undefined,
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) => can(held, permission));
}

/** True when the permissions cover at least one of those asked for. */
export function canAny(
  held: readonly Permission[] | undefined,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) => can(held, permission));
}
