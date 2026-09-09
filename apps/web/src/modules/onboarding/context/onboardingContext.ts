import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AuthUser } from "@service-hub/shared";
import type { AppNotification } from "../../../types";

/**
 * State shared across the onboarding module that isn't the wizard draft.
 *
 * The draft itself now lives in a React Hook Form instance created alongside
 * this context and shared through `FormProvider` — see `OnboardingProvider`.
 * Both live at the module level rather than inside the wizard route because
 * each wizard step is its own route: state owned by a step would be destroyed
 * every time the user pressed Continue.
 */
export interface OnboardingContextValue {
  /** Whoever is signed in. Comes from the session, so nothing here changes it. */
  currentUser: AuthUser;
  notifs: AppNotification[];
  /** Marks every notification read on the server; the list refreshes from it. */
  markAllRead: () => void;

  /** The final declaration tick. Not part of the draft, so not a form field. */
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
