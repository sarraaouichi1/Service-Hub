import type { FastifyReply, FastifyRequest } from "fastify";
import type { AuthUser, Permission } from "@service-hub/shared";
import { can, canAny } from "@service-hub/shared";

declare module "fastify" {
  interface FastifyRequest {
    /** Populated from the session cookie on every request; null when signed out. */
    authUser: AuthUser | null;
  }
}

/**
 * Route guards.
 *
 * Guards ask about permissions, never roles — so moving a capability between
 * roles is a change to the shared table and nothing here. The client gates its
 * UI with the same table, but that only decides what is *drawn*; this is what
 * decides what is *allowed*, and it re-derives permissions from the database on
 * every request rather than trusting anything the caller sends.
 *
 * 401 means "no session", 403 means "session, but not allowed" — a client can
 * tell "sign in again" from "ask someone else" without guessing.
 */
export async function requireSignedIn(request: FastifyRequest, reply: FastifyReply) {
  if (!request.authUser) {
    return reply.code(401).send({ message: "Not signed in" });
  }
}

export function requirePermission(permission: Permission) {
  return async function guard(request: FastifyRequest, reply: FastifyReply) {
    if (!request.authUser) {
      return reply.code(401).send({ message: "Not signed in" });
    }
    if (!can(request.authUser.permissions, permission)) {
      return reply.code(403).send({
        message: "You do not have permission to do that",
        required: permission,
      });
    }
  };
}

/** For endpoints reachable by more than one capability. */
export function requireAnyPermission(...permissions: Permission[]) {
  return async function guard(request: FastifyRequest, reply: FastifyReply) {
    if (!request.authUser) {
      return reply.code(401).send({ message: "Not signed in" });
    }
    if (!canAny(request.authUser.permissions, permissions)) {
      return reply.code(403).send({
        message: "You do not have permission to do that",
        required: permissions,
      });
    }
  };
}
