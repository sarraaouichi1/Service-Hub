import type { OnboardingForm, Project } from "../types";
import { draftFieldErrors } from "../schemas/onboarding";
import { fail, ok } from "./client";
import { nextId, store } from "./store";

export function getDraft(): Promise<OnboardingForm> {
  return ok(store.draft);
}

/** Persist the working draft. This is what "Save Draft" needs in order to stop being a no-op. */
export async function saveDraft(draft: OnboardingForm): Promise<OnboardingForm> {
  store.draft = structuredClone(draft);
  return ok(store.draft);
}

/**
 * Submit a draft for review.
 *
 * The schema runs here as well as in the wizard, and that repetition is the
 * point: a client can always be bypassed, so the boundary checks for itself.
 * A failure comes back as a 422 carrying per-field messages, which is the shape
 * `Field` was built to render — the same message slot serves client-side
 * validation and a server rejection.
 */
export async function submitDraft(draft: OnboardingForm): Promise<Project> {
  const fieldErrors = draftFieldErrors(draft) as Record<string, string>;
  if (Object.keys(fieldErrors).length > 0) {
    return fail(422, "This submission is incomplete", fieldErrors);
  }

  const project: Project = {
    id: nextId(store.projects),
    name: draft.opName ?? "Untitled onboarding",
    partner: draft.opName ?? "—",
    pm: "Unassigned",
    step: 7,
    total: 7,
    status: "review",
    psp: draft.psp ?? "—",
    country: draft.country ?? "—",
    product: (draft.product as Project["product"]) ?? "smart-web-pay",
  };
  store.projects.push(project);
  return ok(project);
}
