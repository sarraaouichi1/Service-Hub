import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AppNotification, OnboardingForm, PlatformUser } from "../../../types";
import { PLATFORM_USERS } from "../../../data/users";
import { INITIAL_NOTIFS } from "../../../data/notifications";
import { DEMO_ONBOARDING_DRAFT } from "../../../data/onboardingDraft";
import { onboardingDraftSchema } from "../../../schemas/onboarding";
import { OnboardingContext } from "./onboardingContext";

/**
 * The draft resolves against the whole schema; the wizard narrows that to one
 * step at a time by triggering only that step's fields.
 *
 * The cast is needed because the schema's parsed output has every key present
 * (each field normalises undefined to a blank value), while the draft type
 * keeps them optional — the wizard lets you move between steps before anything
 * is filled in. The two agree on field names and value types, which is what the
 * resolver actually uses.
 */
const resolver = zodResolver(onboardingDraftSchema) as unknown as Resolver<OnboardingForm>;

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<PlatformUser>(PLATFORM_USERS[0]);
  const [notifs, setNotifs] = useState<AppNotification[]>(INITIAL_NOTIFS);
  const [declared, setDeclared] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /**
   * `onTouched` is what makes the wizard feel right: a field stays quiet while
   * it is first being filled in, speaks up once the user leaves it or presses
   * Continue, and then re-checks on every keystroke so the message clears the
   * moment the value is fixed. It also keeps `isValid` maintained, which is
   * what gates the submit button.
   */
  const form = useForm<OnboardingForm>({
    resolver,
    defaultValues: DEMO_ONBOARDING_DRAFT,
    mode: "onTouched",
  });

  const { reset } = form;
  const resetDraft = useCallback(() => {
    reset({});
    setDeclared(false);
    setSubmitted(false);
  }, [reset]);

  const value = useMemo(
    () => ({
      currentUser, setCurrentUser,
      notifs, setNotifs,
      declared, setDeclared,
      submitted, setSubmitted,
      resetDraft,
    }),
    [currentUser, notifs, declared, submitted, resetDraft],
  );

  return (
    <OnboardingContext.Provider value={value}>
      <FormProvider {...form}>{children}</FormProvider>
    </OnboardingContext.Provider>
  );
}
