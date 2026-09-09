import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AppNotification, FormErrors, OnboardingForm, PlatformUser } from "../../../types";

/**
 * State shared across the onboarding module.
 *
 * The wizard draft lives here rather than inside the wizard route so it
 * survives navigation — moving between steps (or out to the dashboard and
 * back) unmounts the route component but not this provider.
 */
export interface OnboardingContextValue {
  currentUser: PlatformUser;
  setCurrentUser: Dispatch<SetStateAction<PlatformUser>>;
  notifs: AppNotification[];
  setNotifs: Dispatch<SetStateAction<AppNotification[]>>;

  formData: OnboardingForm;
  setFormData: Dispatch<SetStateAction<OnboardingForm>>;
  fieldErrors: FormErrors;
  setFieldErrors: Dispatch<SetStateAction<FormErrors>>;
  declared: boolean;
  setDeclared: Dispatch<SetStateAction<boolean>>;
  submitted: boolean;
  setSubmitted: Dispatch<SetStateAction<boolean>>;
  /** Clear the draft so a new onboarding starts from scratch. */
  resetDraft: () => void;
}

export const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used inside <OnboardingProvider>");
  return ctx;
}
