import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AuthUser } from "@service-hub/shared";
import type { OnboardingForm } from "../../../types";
import { useMarkAllRead, useMarkRead, useNotifications, useOnboardingSchemas, useSavedDraft } from "../../../queries";

import { OnboardingContext } from "./onboardingContext";


export function OnboardingProvider(
  { children, currentUser }: { children: ReactNode; currentUser: AuthUser },
) {
  const notifsQuery = useNotifications();
  const markAllMutation = useMarkAllRead();
  const markOneMutation = useMarkRead();
  // Memoised so an empty list isn't a fresh array on every render, which
  // would make the context value change constantly.
  const notifsData = notifsQuery.data;
  const notifs = useMemo(() => notifsData ?? [], [notifsData]);
  const [declared, setDeclared] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /**
   * `onTouched` is what makes the wizard feel right: a field stays quiet while
   * it is first being filled in, speaks up once the user leaves it or presses
   * Continue, and then re-checks on every keystroke so the message clears the
   * moment the value is fixed. It also keeps `isValid` maintained, which is
   * what gates the submit button.
   */
  // The saved draft is server state; the wizard's in-progress edits are not.
  // The form is seeded from whatever was last saved, then owns the values until
  // the next save.
  const savedDraft = useSavedDraft();
  /**
   * Resolved against the rules as an administrator has them configured, not the
   * ones compiled in — so switching a rule off on the admin screen actually
   * stops the wizard enforcing it.
   *
   * The cast is needed because the schema's parsed output has every key present
   * (each field normalises undefined to a blank value), while the draft type
   * keeps them optional — the wizard lets you move between steps before
   * anything is filled in. The two agree on field names and value types, which
   * is what the resolver actually uses.
   */
  const schemas = useOnboardingSchemas();
  const resolver = useMemo(
    () => zodResolver(schemas.onboardingDraftSchema) as unknown as Resolver<OnboardingForm>,
    [schemas],
  );

  const form = useForm<OnboardingForm>({
    resolver,
    defaultValues: {},
    mode: "onTouched",
  });

  const markAllRead = useCallback(() => markAllMutation.mutate(), [markAllMutation]);
  const markRead = useCallback((id: number) => markOneMutation.mutate(id), [markOneMutation]);

  const { reset: resetForm } = form;
  const loadedDraft = savedDraft.data?.draft;
  useEffect(() => {
    if (loadedDraft) resetForm(loadedDraft);
  }, [loadedDraft, resetForm]);

  const { reset } = form;
  const resetDraft = useCallback(() => {
    reset({});
    setDeclared(false);
    setSubmitted(false);
  }, [reset]);

  const value = useMemo(
    () => ({
      currentUser,
      notifs, markAllRead, markRead,
      declared, setDeclared,
      submitted, setSubmitted,
      resetDraft,
    }),
    [currentUser, notifs, markAllRead, markRead, declared, submitted, resetDraft],
  );

  return (
    <OnboardingContext.Provider value={value}>
      <FormProvider {...form}>{children}</FormProvider>
    </OnboardingContext.Provider>
  );
}
