import { z } from "zod";
import type { UserStatus, UserRole } from "./domain.js";
import type { Permission } from "./rbac.js";

/**
 * The authenticated user, as the API reports it.
 *
 * `permissions` is derived from `roles` on the server and sent along so the UI
 * can gate what it draws without re-deriving anything. It is a convenience for
 * rendering, never the basis of a security decision — the server re-derives on
 * every request.
 *
 * `id` is the app's own user id, which exists whether the account is local or
 * came from an identity provider. That is what makes the two interchangeable:
 * an external identity is linked to a row here, never used in place of one.
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  initials: string;
  partner: string;
  color: string;
  status: UserStatus;
  roles: UserRole[];
  permissions: Permission[];
  /** Which identity provider vouched for this user; "local" for a password account. */
  issuer: string;
  /** ISO timestamp of the last successful sign-in, or null for an account that never has. */
  lastLoginAt?: string | null;
  username?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  department?: string | null;
  country?: string | null;
  language?: string | null;
  timezone?: string | null;
  notificationSettings?: Record<string, unknown> | null;
  privacySettings?: Record<string, unknown> | null;
}

export interface SessionInfo {
  user: AuthUser;
  expiresAt: string;
}

export const loginSchema = z.object({
  email: z.string().min(1, "Enter your email address").pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Enter your password"),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** Password rules, applied wherever a password is set or changed. */
export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters")
  .max(200, "That is too long")
  .refine((value) => /[a-z]/.test(value), "Include a lower-case letter")
  .refine((value) => /[A-Z]/.test(value), "Include an upper-case letter")
  .refine((value) => /\d/.test(value), "Include a digit");

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: passwordSchema,
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
