import { useFormContext, useWatch } from "react-hook-form";
import type { FormBoolKey, FormTextKey, OnboardingForm } from "../../../types";

/**
 * Binds a wizard step's controls to the shared form.
 *
 * Every step used to define a near-identical `f(key)` helper over the draft in
 * context; this is that helper on top of React Hook Form. Text inputs go
 * through `register`, so they are uncontrolled and a keystroke no longer
 * re-renders the whole onboarding tree. `useWatch` re-renders only the step
 * that calls this, and only for the classes that depend on a value.
 *
 * Validation timing comes from the form's `onTouched` mode: quiet while a
 * field is first filled in, then live once it has been left or Continue has
 * checked it.
 */
export function useStepFields() {
  const { register, setValue, formState, clearErrors, setError } = useFormContext<OnboardingForm>();
  const watched = useWatch<OnboardingForm>();

  const values = watched as Record<string, unknown>;
  const errors = formState.errors as Record<string, { message?: string } | undefined>;

  /** The message for a field, or undefined. Feeds `Field`'s single message slot. */
  const message = (key: string) => errors[key]?.message;

  const state = (key: string) => (errors[key] ? " error" : values[key] ? " valid" : "");

  /** Set a value the user picked rather than typed — a card, a toggle, a row. */
  const choose = (key: string, value: unknown) => {
    clearErrors(key as FormTextKey);
    setValue(key as FormTextKey, value as string, { shouldValidate: true, shouldDirty: true });
  };

  return {
    values: watched,
    message,
    choose,
    register,
    clearErrors,
    setError,
    /** Props for an `<input>`; `extra` adds classes such as `mono`. */
    input: (key: FormTextKey, extra = "") => ({
      ...register(key),
      className: `form-input${extra ? ` ${extra}` : ""}${state(key)}`,
    }),
    /** Props for a `<select>`. */
    select: (key: FormTextKey) => ({
      ...register(key),
      className: `form-select${state(key)}`,
    }),
    /** Props for the `Toggle` component, which reports a boolean rather than an event. */
    toggle: (key: FormBoolKey | `pm_${string}`) => ({
      value: Boolean(values[key]),
      onChange: (next: boolean) => choose(key, next),
    }),
  };
}
