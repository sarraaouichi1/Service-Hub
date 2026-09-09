import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AppNotification, PlatformUser } from "../../../types";

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
  currentUser: PlatformUser;
  setCurrentUser: Dispatch<SetStateAction<PlatformUser>>;
  notifs: AppNotification[];
  setNotifs: Dispatch<SetStateAction<AppNotification[]>>;

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
