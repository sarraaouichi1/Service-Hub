import { z } from "zod";
import type { FormErrors, FormTextKey, OnboardingForm } from "../domain.js";
import { blockingRulesFor, type RuleOverrides } from "./rules.js";

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
 * Builds the wizard's schemas.
 *
 * A factory rather than plain module constants, because an administrator can
 * turn a rule off or soften it to a warning and those flags live on the server.
 * Pass the stored overrides and the schemas enforce what the admin screen says;
 * pass nothing and they enforce the registry's defaults.
 *
 * A rule's pattern and check stay fixed in code either way — those are the
 * definition, and the admin table shows exactly what the wizard runs.
 */
export function createOnboardingSchemas(overrides?: RuleOverrides) {
  /**
   * A wizard text field: optional by default, checked against its registry rules.
   *
   * The draft omits keys the user has never touched, and Zod skips an absent key
   * whose schema is `.optional()` — which would quietly excuse every required
   * field on a fresh draft. Normalising undefined to "" first keeps the field
   * non-optional, so its checks run whether the key is missing, blank or filled.
   */
  function text(key: FormTextKey, requiredMessage?: string) {
    const rules = blockingRulesFor(key, overrides);
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
    // Connect & Validation & Mobility additions
    providerId: text("providerId"),
    contactEmail: text("contactEmail"),
    contactPhone: text("contactPhone"),
    adminUsername: text("adminUsername"),
    adminEmail: text("adminEmail"),
    tenantShortname: text("tenantShortname"),
    tenantDescription: text("tenantDescription"),
    zipCode: text("zipCode"),
    city: text("city"),
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
    sshPort: text("sshPort"),
  });

  const facilitiesStep = z.object({
    facilities,
    carparkType: text("carparkType"),
    heightLimit: text("heightLimit"),
    parkingLots: text("parkingLots"),
    chargingStations: text("chargingStations"),
    costCenter: text("costCenter"),
    entryLanes: text("entryLanes"),
    exitLanes: text("exitLanes"),
    latitude: text("latitude"),
    longitude: text("longitude"),
    totalSpaces: text("totalSpaces"),
    mediatypes: text("mediatypes"),
  });

  const appPaymentStep = z.object({
    financialInfo: text("financialInfo"),
    tocUrl: text("tocUrl"),
    tariff: text("tariff"),
    psp: text("psp", "Select a payment service provider"),
    pspMid: text("pspMid", "Merchant ID is required"),
    pspTid: text("pspTid"),
    dailyMax: text("dailyMax"),
    subtechEmail: text("subtechEmail"),
    incidentEmail: text("incidentEmail"),
    onboardingEmail: text("onboardingEmail"),
    portalUrl: text("portalUrl"),
    projectName: text("projectName"),
    senderEmail: text("senderEmail"),
    senderDomain: text("senderDomain"),
    brandColors: text("brandColors"),
    privacyUrl: text("privacyUrl"),
    paymentType: text("paymentType"),
    mobilityProvider: text("mobilityProvider"),
    contractProductName: text("contractProductName"),
    contractOneTimeFee: text("contractOneTimeFee"),
    contractRecurringFee: text("contractRecurringFee"),
    contractMinLeaseMonths: text("contractMinLeaseMonths"),
    contractNoticePeriod: text("contractNoticePeriod"),
    contractMaxBookings: text("contractMaxBookings"),
    timeCardProductName: text("timeCardProductName"),
    timeCardFee: text("timeCardFee"),
    timeCardDuration: text("timeCardDuration"),
    bundleProductName: text("bundleProductName"),
    bundleFee: text("bundleFee"),
    bundleSlotsCount: text("bundleSlotsCount"),
    bundleSlotDuration: text("bundleSlotDuration"),
    bundleOverstayFee: text("bundleOverstayFee"),
    prepaidProductName: text("prepaidProductName"),
    prepaidPrice: text("prepaidPrice"),
    prepaidCredit: text("prepaidCredit"),
    prepaidMinBalance: text("prepaidMinBalance"),
  });

  const salesApprovalStep = z.object({
    salesApproved: z.preprocess(
      (value) => value ?? false,
      z.boolean().refine((value) => value === true, {
        message: "Sales must confirm that the delivery can be done",
      }),
    ),
  });

  /** Indexed by wizard step number — the order the user walks them in. */
  const STEP_SCHEMAS = [
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
  const onboardingDraftSchema = z.object({
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
  function fieldsForStep(step: number): (keyof OnboardingForm)[] {
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
  function validateStep(step: number, data: OnboardingForm): FormErrors {
    const schema = STEP_SCHEMAS[step] ?? onboardingDraftSchema;
    const result = schema.safeParse(data);
    return result.success ? {} : toFormErrors(result.error);
  }

  /** True when every step's rules pass. The React path uses `formState.isValid`. */
  function isDraftComplete(data: OnboardingForm): boolean {
    return onboardingDraftSchema.safeParse(data).success;
  }

  /**
   * Everything still standing between the draft and submission, keyed by field.
   * The API layer rejects a submission with these as its 422 body.
   */
  function draftFieldErrors(data: OnboardingForm): FormErrors {
    const result = onboardingDraftSchema.safeParse(data);
    return result.success ? {} : toFormErrors(result.error);
  }

  /**
   * The same thing as a plain list of messages. The review step shows these
   * rather than restating which fields matter.
   */
  function draftIssues(data: OnboardingForm): string[] {
    return Object.values(draftFieldErrors(data));
  }

  return {
    STEP_SCHEMAS,
    onboardingDraftSchema,
    fieldsForStep,
    validateStep,
    draftFieldErrors,
    draftIssues,
    isDraftComplete,
    toFormErrors,
  };
}

/** The default schemas, enforcing the registry exactly as written. */
const defaults = createOnboardingSchemas();

export const STEP_SCHEMAS = defaults.STEP_SCHEMAS;
export const onboardingDraftSchema = defaults.onboardingDraftSchema;
export const fieldsForStep = defaults.fieldsForStep;
export const validateStep = defaults.validateStep;
export const draftFieldErrors = defaults.draftFieldErrors;
export const draftIssues = defaults.draftIssues;
export const isDraftComplete = defaults.isDraftComplete;
export const toFormErrors = defaults.toFormErrors;

export type OnboardingSchemas = ReturnType<typeof createOnboardingSchemas>;
