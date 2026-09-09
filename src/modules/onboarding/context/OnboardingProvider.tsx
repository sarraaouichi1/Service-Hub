import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AppNotification, FormErrors, OnboardingForm, PlatformUser } from "../../../types";
import { PLATFORM_USERS } from "../../../data/users";
import { INITIAL_NOTIFS } from "../../../data/notifications";
import { DEMO_ONBOARDING_DRAFT } from "../../../data/onboardingDraft";
import { OnboardingContext } from "./onboardingContext";

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<PlatformUser>(PLATFORM_USERS[0]);
  const [notifs, setNotifs] = useState<AppNotification[]>(INITIAL_NOTIFS);

  const [formData, setFormData] = useState<OnboardingForm>(DEMO_ONBOARDING_DRAFT);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [declared, setDeclared] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const resetDraft = useCallback(() => {
    setFormData({});
    setFieldErrors({});
    setDeclared(false);
    setSubmitted(false);
  }, []);

  const value = useMemo(
    () => ({
      currentUser, setCurrentUser,
      notifs, setNotifs,
      formData, setFormData,
      fieldErrors, setFieldErrors,
      declared, setDeclared,
      submitted, setSubmitted,
      resetDraft,
    }),
    [currentUser, notifs, formData, fieldErrors, declared, submitted, resetDraft],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}
