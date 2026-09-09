import { useRouteContext } from "@tanstack/react-router";
import type { AuthUser, Permission } from "@service-hub/shared";
import { can, canAny } from "@service-hub/shared";

/**
 * The signed-in user and what they may do.
 *
 * Read from route context, which the session guard filled in before the route
 * rendered — so any component under a guarded route has it without fetching.
 *
 * These checks decide what to *draw*. The API re-derives permissions from the
 * database and decides what to *allow*; hiding a button here is a courtesy, not
 * a control, and a screen that slips through still gets a 403.
 */
export function useAuth() {
  const context = useRouteContext({ strict: false }) as { session?: { user: AuthUser } };
  const user = context.session?.user;

  return {
    user,
    permissions: user?.permissions ?? [],
    can: (permission: Permission) => can(user?.permissions, permission),
    canAny: (...permissions: Permission[]) => canAny(user?.permissions, permissions),
  };
}
