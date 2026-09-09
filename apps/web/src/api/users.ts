import type { AdminUser, InviteDraft } from "../types";
import { fail, ok } from "./client";
import { nextId, store } from "./store";

export function listUsers(): Promise<AdminUser[]> {
  return ok(store.adminUsers);
}

/** Initials shown on the avatar, derived the way the seed data does it. */
function initialsFor(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase();
}

export async function inviteUser(draft: InviteDraft): Promise<AdminUser> {
  const email = draft.email.trim().toLowerCase();
  if (!draft.name.trim()) return fail(422, "A name is required", { name: "A name is required" });
  if (!email) return fail(422, "An email is required", { email: "An email is required" });
  if (store.adminUsers.some((user) => user.email.toLowerCase() === email)) {
    return fail(409, "That address is already invited", { email: "That address is already invited" });
  }

  const user: AdminUser = {
    id: nextId(store.adminUsers),
    name: draft.name.trim(),
    email,
    role: draft.role,
    partner: draft.partner.trim(),
    status: "pending",
    lastLogin: "Never",
    initials: initialsFor(draft.name),
  };
  store.adminUsers.push(user);
  return ok(user);
}

export async function updateUser(id: number, patch: Partial<AdminUser>): Promise<AdminUser> {
  const index = store.adminUsers.findIndex((user) => user.id === id);
  if (index === -1) return fail(404, `No user with id ${id}`);
  store.adminUsers[index] = { ...store.adminUsers[index], ...patch, id };
  return ok(store.adminUsers[index]);
}

export async function deleteUser(id: number): Promise<void> {
  const index = store.adminUsers.findIndex((user) => user.id === id);
  if (index === -1) return fail(404, `No user with id ${id}`);
  store.adminUsers.splice(index, 1);
  await ok(null);
}
