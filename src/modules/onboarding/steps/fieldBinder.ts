import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import type { FormErrors, FormTextKey, OnboardingForm } from "../../../types";
import { validateField } from "../../../schemas/onboarding";

/**
 * Binds a wizard text field to the draft and to its validation message.
 *
 * Every step used to define its own near-identical `f(key)` helper; this is
 * that helper, with re-validation folded in. A field is only re-checked once it
 * is already showing a message, so the user is corrected while fixing a value
 * but not while first typing one — and because the message is written per key,
 * editing one field can never clear another field's error.
 */
export function createFieldBinder(
  step: number,
  data: OnboardingForm,
  setData: Dispatch<SetStateAction<OnboardingForm>>,
  errors: FormErrors,
  setErrors: Dispatch<SetStateAction<FormErrors>>,
) {
  const commit = (key: FormTextKey, value: string) => {
    const next = { ...data, [key]: value };
    setData(next);
    if (!errors[key]) return;
    const message = validateField(step, next, key);
    setErrors((prev) => {
      if (prev[key] === message) return prev;
      const updated = { ...prev };
      if (message) updated[key] = message;
      else delete updated[key];
      return updated;
    });
  };

  const state = (key: FormTextKey) =>
    errors[key] ? " error" : data[key] ? " valid" : "";

  const drop = (key: keyof FormErrors) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });

  return {
    /**
     * Drop a message for a control the binder doesn't own — a card grid or a
     * toggle, where any interaction at all satisfies the rule.
     */
    clear: drop,
    /**
     * Re-check a non-text control against the draft it is about to become.
     * Like the text bindings, it only speaks up for a field already in error.
     */
    recheck: (key: keyof FormErrors, next: OnboardingForm) => {
      if (!errors[key]) return;
      const message = validateField(step, next, key);
      if (!message) drop(key);
      else setErrors((prev) => (prev[key] === message ? prev : { ...prev, [key]: message }));
    },
    /** Props for an `<input>`; `extra` adds classes such as `mono`. */
    input: (key: FormTextKey, extra = "") => ({
      value: data[key] ?? "",
      onChange: (e: ChangeEvent<HTMLInputElement>) => commit(key, e.target.value),
      className: `form-input${extra ? ` ${extra}` : ""}${state(key)}`,
    }),
    /** Props for a `<select>`. */
    select: (key: FormTextKey) => ({
      value: data[key] ?? "",
      onChange: (e: ChangeEvent<HTMLSelectElement>) => commit(key, e.target.value),
      className: `form-select${state(key)}`,
    }),
  };
}
