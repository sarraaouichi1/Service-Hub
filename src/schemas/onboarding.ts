import { z } from "zod";
import type { FormErrors, FormTextKey, OnboardingForm } from "../types";
import { blockingRulesFor } from "./rules";

/**
 * Per-step schemas for the onboarding wizard.
 *
 * Format rules come from the rule registry in `./rules`; this module adds the
 * part that registry deliberately leaves out — which fields a given step
 * requires — and composes the two into one schema per step.
 *
 * Each field reports at most one message: a missing required value short-
 * circuits its format rules, and the first failing rule wins. That keeps the
 * output shaped for `Field`, which renders a single message slot per control.
 */

/**
 * A wizard text field: optional by default, checked against its registry rules.
 *
 * The draft omits keys the user has never touched, and Zod skips an absent key
 * whose schema is `.optional()` — which would quietly excuse every required
 * field on a fresh draft. Normalising undefined to "" first keeps the field
 * non-optional, so its checks run whether the key is missing, blank or filled.
 */
function text(key: FormTextKey, requiredMessage?: string) {
  const rules = blockingRulesFor(key);
  return z.preprocess(
    (value) => value ?? "",
    z.string().superRefine((value, ctx) => {
      const trimmed = value.trim();
      if (!trimmed) {
        if (requiredMessage) ctx.addIssue({ code: "custom", message: requiredMessage });
        return;
      }
      const broken = rules.find((rule) => !rule.check!(trimmed));
      if (broken) ctx.addIssue({ code: "custom", message: broken.message });
    }),
  );
}

const facility = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  city: z.string().optional(),
  inpayEntry: z.union([z.string(), z.number()]).optional(),
  inpayPayment: z.union([z.string(), z.number()]).optional(),
});

/**
 * Facilities are a repeating row rather than a single control, so their errors
 * collapse into one message naming the first offending row — there is nowhere
 * per-row to render them yet.
 */
const facilities = z.preprocess(
  (value) => value ?? [],
  z.array(facility).superRefine((rows, ctx) => {
  if (rows.length === 0) {
    ctx.addIssue({ code: "custom", message: "Add at least one facility" });
    return;
  }
  for (const [i, row] of rows.entries()) {
    if (!row.id?.trim() || !row.name?.trim()) {
      ctx.addIssue({ code: "custom", message: `Facility ${i + 1} needs both an ID and a name` });
      return;
    }
    if (!/^\d+$/.test(row.id.trim())) {
      ctx.addIssue({ code: "custom", message: `Facility ${i + 1}: ID must be digits only` });
      return;
    }
  }
  }),
);

const productStep = z.object({
  product: text("product", "Select a product to continue"),
});

const operatorStep = z.object({
  opName: text("opName", "Operator name is required"),
  opId: text("opId"),
  opEmail: text("opEmail", "Operator email is required"),
  techEmail: text("techEmail"),
  phone: text("phone"),
  version: text("version"),
  ip: text("ip", "Static public IP is required"),
  port: text("port"),
  domain: text("domain"),
  address: text("address"),
});

const cellComputerStep = z.object({
  cellId: text("cellId", "Cell computer ID is required"),
  cellName: text("cellName"),
  lang: text("lang", "Language tag is required"),
  country: text("country", "Country is required"),
  currency: text("currency"),
  decimals: text("decimals"),
  uiUserId: text("uiUserId"),
  uiPassword: text("uiPassword"),
  deviceId: text("deviceId"),
  vat: text("vat"),
});

const facilitiesStep = z.object({ facilities });

const appPaymentStep = z.object({
  financialInfo: text("financialInfo"),
  tocUrl: text("tocUrl"),
  tariff: text("tariff"),
  psp: text("psp", "Select a payment service provider"),
  pspMid: text("pspMid", "Merchant ID is required"),
  pspTid: text("pspTid"),
});

const salesApprovalStep = z.object({
  salesApproved: z.preprocess(
    (value) => value ?? false,
    z.boolean().refine((value) => value === true, {
      message: "Sales must confirm payment before this submission can continue",
    }),
  ),
});

/** Indexed by wizard step number — the order the user walks them in. */
export const STEP_SCHEMAS = [
  productStep,
  operatorStep,
  cellComputerStep,
  facilitiesStep,
  appPaymentStep,
  salesApprovalStep,
] as const;

/**
 * Everything the wizard collects. The review step checks against this rather
 * than re-listing fields, so it can't fall behind the individual steps.
 */
export const onboardingDraftSchema = z.object({
  ...productStep.shape,
  ...operatorStep.shape,
  ...cellComputerStep.shape,
  ...facilitiesStep.shape,
  ...appPaymentStep.shape,
  ...salesApprovalStep.shape,
});

/**
 * The fields a given step owns, read straight off its schema so the step
 * boundary is defined in exactly one place. React Hook Form validates a step by
 * triggering this list.
 */
export function fieldsForStep(step: number): (keyof OnboardingForm)[] {
  const schema = STEP_SCHEMAS[step];
  return schema ? (Object.keys(schema.shape) as (keyof OnboardingForm)[]) : [];
}

/** Collapse Zod issues to one message per field, matching `Field`'s single slot. */
function toFormErrors(error: z.ZodError): FormErrors {
  const errors: FormErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]) as keyof FormErrors;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/**
 * Validate one step of the draft. The final step has no controls of its own, so
 * it is checked against the whole draft instead.
 *
 * The wizard itself no longer calls this — React Hook Form's resolver drives
 * the UI. It stays as the module's framework-independent entry point: it is
 * what the verification harness exercises, and what the coming API layer will
 * use to check a payload outside of React.
 */
export function validateStep(step: number, data: OnboardingForm): FormErrors {
  const schema = STEP_SCHEMAS[step] ?? onboardingDraftSchema;
  const result = schema.safeParse(data);
  return result.success ? {} : toFormErrors(result.error);
}

/** True when every step's rules pass. The React path uses `formState.isValid`. */
export function isDraftComplete(data: OnboardingForm): boolean {
  return onboardingDraftSchema.safeParse(data).success;
}

/**
 * Everything still standing between the draft and submission, keyed by field.
 * The API layer rejects a submission with these as its 422 body.
 */
export function draftFieldErrors(data: OnboardingForm): FormErrors {
  const result = onboardingDraftSchema.safeParse(data);
  return result.success ? {} : toFormErrors(result.error);
}

/**
 * The same thing as a plain list of messages. The review step shows these
 * rather than restating which fields matter.
 */
export function draftIssues(data: OnboardingForm): string[] {
  return Object.values(draftFieldErrors(data));
}

