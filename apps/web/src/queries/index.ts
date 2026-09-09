import { useMemo } from "react";
import {
  useMutation, useQuery, useQueryClient, type UseMutationOptions,
} from "@tanstack/react-query";
import type {
  CountryTemplate, OnboardingForm, PlatformConfig, ProductDefinition, Project,
  TemplateDraft, UserRole,
} from "@service-hub/shared";
import * as api from "../api";

/**
 * Server state, cached.
 *
 * These replace the `useState` copies the screens used to keep. That is the
 * whole point: an admin edit is server state, and holding it in a component
 * meant it died the moment the route unmounted. Here a write invalidates the
 * cache and every screen showing that data refreshes.
 *
 * Keys are declared once in `keys` so an invalidation can't miss a query by
 * spelling its key differently.
 */
export const keys = {
  projects: ["projects"] as const,
  project: (id: number) => ["projects", id] as const,
  draft: ["draft"] as const,
  products: ["catalog", "products"] as const,
  psps: ["catalog", "psps"] as const,
  bulletins: ["patch", "bulletins"] as const,
  patchStages: ["patch", "stages"] as const,
  serviceTiers: ["patch", "tiers"] as const,
  templates: ["templates"] as const,
  rules: ["rules"] as const,
  settings: ["settings"] as const,
  auditLog: ["audit-log"] as const,
  notifications: ["notifications"] as const,
  users: ["users"] as const,
};

/** Reference data doesn't change while someone is looking at it. */
const REFERENCE = { staleTime: Infinity, gcTime: Infinity };

// ─── Reads ──────────────────────────────────────────────────────────────────
export const useProjects = () => useQuery({ queryKey: keys.projects, queryFn: api.listProjects });
export const useProducts = () => useQuery({ queryKey: keys.products, queryFn: api.listProducts, ...REFERENCE });
export const usePsps = () => useQuery({ queryKey: keys.psps, queryFn: api.listPsps, ...REFERENCE });
export const useBulletins = () => useQuery({ queryKey: keys.bulletins, queryFn: api.listBulletins });
export const usePatchStages = () => useQuery({ queryKey: keys.patchStages, queryFn: api.listPatchStages, ...REFERENCE });
export const useServiceTiers = () => useQuery({ queryKey: keys.serviceTiers, queryFn: api.listServiceTiers, ...REFERENCE });
export const useTemplates = () => useQuery({ queryKey: keys.templates, queryFn: api.listTemplates });
export const useRules = () => useQuery({ queryKey: keys.rules, queryFn: api.listRules });
export const useSettings = () => useQuery({ queryKey: keys.settings, queryFn: api.getSettings });
export const useAuditLog = () => useQuery({ queryKey: keys.auditLog, queryFn: api.listAuditLog });
export const useNotifications = () => useQuery({ queryKey: keys.notifications, queryFn: api.listNotifications });
export const useUsers = () => useQuery({ queryKey: keys.users, queryFn: api.listUsers });
export const useSavedDraft = () => useQuery({ queryKey: keys.draft, queryFn: api.getDraft });

/**
 * Products keyed by id — the lookup every project view needs to render a
 * product's name and accent colour. Empty while the catalogue loads, so call
 * sites fall back to the stored id rather than showing a blank.
 */
export function useProductLookup(): Record<string, ProductDefinition> {
  const products = useProducts();
  return useMemo(
    () => Object.fromEntries((products.data ?? []).map((p) => [p.id, p])),
    [products.data],
  );
}

// ─── Writes ─────────────────────────────────────────────────────────────────

/**
 * Every mutation refreshes what it changed. `onSuccess` is passed through so a
 * caller can close a dialog or clear a form, without having to remember the
 * invalidation itself.
 */
function useInvalidating<TData, TVars>(
  mutationFn: (vars: TVars) => Promise<TData>,
  invalidate: readonly (readonly unknown[])[],
  options?: UseMutationOptions<TData, Error, TVars>,
) {
  const client = useQueryClient();
  return useMutation<TData, Error, TVars>({
    mutationFn,
    ...options,
    // Forwarded with a rest parameter so the caller's handler keeps whatever
    // arguments the library passes, without this wrapper pinning the arity.
    onSuccess: (...args) => {
      for (const key of invalidate) void client.invalidateQueries({ queryKey: [...key] });
      options?.onSuccess?.(...args);
    },
  });
}

export const useCreateTemplate = (options?: UseMutationOptions<CountryTemplate, Error, TemplateDraft>) =>
  useInvalidating(api.createTemplate, [keys.templates], options);

export const useUpdateTemplate = (options?: UseMutationOptions<CountryTemplate, Error, { id: number; patch: Partial<TemplateDraft> }>) =>
  useInvalidating(({ id, patch }) => api.updateTemplate(id, patch), [keys.templates], options);

export const useDeleteTemplate = (options?: UseMutationOptions<void, Error, number>) =>
  useInvalidating(api.deleteTemplate, [keys.templates], options);

export const useUpdateRule = (options?: UseMutationOptions<unknown, Error, { id: number; patch: { active?: boolean; severity?: "error" | "warning" } }>) =>
  useInvalidating(({ id, patch }) => api.updateRule(id, patch), [keys.rules], options);

export const useUpdateSettings = (options?: UseMutationOptions<PlatformConfig, Error, Partial<PlatformConfig>>) =>
  useInvalidating(api.updateSettings, [keys.settings], options);

export const useMarkAllRead = () => useInvalidating<unknown, void>(() => api.markAllRead(), [keys.notifications]);

export const useCreateUser = (options?: UseMutationOptions<unknown, Error, { email: string; name: string; partner?: string; roles: UserRole[]; password?: string }>) =>
  useInvalidating(api.createUser, [keys.users], options);

export const useUpdateUser = (options?: UseMutationOptions<unknown, Error, { id: string; patch: { name?: string; partner?: string; status?: string; roles?: UserRole[] } }>) =>
  useInvalidating(({ id, patch }) => api.updateUser(id, patch), [keys.users], options);

export const useDeleteUser = (options?: UseMutationOptions<void, Error, string>) =>
  useInvalidating(api.deleteUser, [keys.users], options);

export const useSaveDraft = (options?: UseMutationOptions<unknown, Error, OnboardingForm>) =>
  useInvalidating(api.saveDraft, [keys.draft], options);

export const useSubmitDraft = (options?: UseMutationOptions<Project, Error, OnboardingForm>) =>
  useInvalidating(api.submitDraft, [keys.projects, keys.draft], options);
