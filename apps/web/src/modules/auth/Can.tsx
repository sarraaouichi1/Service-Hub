import type { ReactNode } from "react";
import type { Permission } from "@service-hub/shared";
import { useAuth } from "./useAuth";

/**
 * Renders its children only when the signed-in user holds the permission.
 *
 * For hiding things the user cannot use. Never the only thing standing between
 * them and the action — the API enforces the same rule server-side.
 */
export function Can({
  permission,
  fallback = null,
  children,
}: {
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const { can } = useAuth();
  return <>{can(permission) ? children : fallback}</>;
}
