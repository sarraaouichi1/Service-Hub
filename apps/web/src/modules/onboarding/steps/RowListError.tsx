import { useFormContext } from "react-hook-form";
import type { OnboardingForm } from "../../../types";

/**
 * The one message a repeating list carries. The schema reports the first
 * offending row on the list itself; React Hook Form may nest it under `root`.
 */
export function RowListError({ name }: { name: "facilities" | "cellComputers" }) {
  const { formState } = useFormContext<OnboardingForm>();
  const listError = formState.errors[name] as { message?: string; root?: { message?: string } } | undefined;
  const message = listError?.message ?? listError?.root?.message;
  if (!message) return null;
  return <div className="error-msg" role="alert" style={{ margin: "10px 0" }}>⚠ {message}</div>;
}
