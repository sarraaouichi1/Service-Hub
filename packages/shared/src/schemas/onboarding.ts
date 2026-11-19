import { z } from "zod";
import type { FormErrors, FormTextKey, OnboardingForm } from "../domain.js";
import { needsPaymentProvider, parseProducts } from "../products.js";
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

  /**
   * The first message a row value earns: required first, then the registry's
   * rules for that field. Rows have nowhere to render per-cell messages yet, so
   * callers prefix it with the row it came from.
   */
  function rowValueError(value: unknown, key: FormTextKey, label: string, required: boolean): string | undefined {
    const trimmed = typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : "";
    if (!trimmed) return required ? `${label} is required` : undefined;
    const broken = blockingRulesFor(key, overrides).find((rule) => !rule.check!(trimmed));
    return broken ? `${label}: ${broken.message}` : undefined;
  }

  const cellComputer = z.object({
    key: z.string().optional(),
    name: z.string().optional(),
    cellId: z.string().optional(),
    url: z.string().optional(),
    ip: z.string().optional(),
    port: z.string().optional(),
    uiUserId: z.string().optional(),
    uiPassword: z.string().optional(),
    deviceId: z.string().optional(),
    sshPort: z.string().optional(),
  });

  /**
   * Cell computers repeat, so — like facilities — their errors collapse into
   * one message naming the first offending row and field. Each value is still
   * checked against the registry rule for that field, so the admin toggles on
   * "IP Address" or "Communication Port" keep governing them.
   */
  const cellComputers = z.preprocess(
    (value) => value ?? [],
    z.array(cellComputer).superRefine((rows, ctx) => {
      if (rows.length === 0) {
        ctx.addIssue({ code: "custom", message: "Add at least one cell computer" });
        return;
      }
      const seenIds = new Set<string>();
      for (const [i, row] of rows.entries()) {
        const label = row.name?.trim() || `Cell computer ${i + 1}`;
        const problem =
          (row.name?.trim() ? undefined : `Cell computer ${i + 1}: name is required`) ??
          rowValueError(row.cellId, "cellId", `${label} — Cell computer ID`, true) ??
          rowValueError(row.ip, "ip", `${label} — Static public IP`, true) ??
          rowValueError(row.port, "port", `${label} — Port`, false) ??
          rowValueError(row.uiUserId, "uiUserId", `${label} — UI user ID`, false) ??
          rowValueError(row.uiPassword, "uiPassword", `${label} — UI password`, false) ??
          rowValueError(row.sshPort, "sshPort", `${label} — SSH port`, false);
        if (problem) {
          ctx.addIssue({ code: "custom", message: problem });
          return;
        }
        const id = row.cellId!.trim();
        if (seenIds.has(id)) {
          ctx.addIssue({ code: "custom", message: `${label}: cell computer ID ${id} is used twice` });
          return;
        }
        seenIds.add(id);
      }
    }),
  );

  const facility = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    city: z.string().optional(),
    inpayEntry: z.union([z.string(), z.number()]).optional(),
    inpayPayment: z.union([z.string(), z.number()]).optional(),
    cellComputer: z.string().optional(),
    services: z.array(z.string()).optional(),
  });

  /**
   * Facilities are a repeating row rather than a single control, so their errors
   * collapse into one message naming the first offending row — there is nowhere
   * per-row to render them yet. Whether a facility's cell computer and services
   * actually exist depends on other steps, so that is checked on the whole draft
   * below.
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
      if (!row.cellComputer) {
        ctx.addIssue({ code: "custom", message: `Facility ${i + 1}: choose the cell computer it is connected to` });
        return;
      }
      if (!row.services || row.services.length === 0) {
        ctx.addIssue({ code: "custom", message: `Facility ${i + 1}: select at least one service enabled at this location` });
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
    address: text("address"),
    // Locale is the operator's, shared by every cell computer it runs.
    country: text("country", "Country is required"),
    lang: text("lang", "Language tag is required"),
    currency: text("currency"),
    decimals: text("decimals"),
    vat: text("vat"),
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
    cellComputers,
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
    // Required only when a payment product is selected — see `requirePayment`.
    psp: text("psp"),
    pspMid: text("pspMid"),
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
    contractDate: z.preprocess(
      (value) => value ?? "",
      z.string().superRefine((val, ctx) => {
        const trimmed = (val as string).trim();
        if (!trimmed) {
          ctx.addIssue({ code: "custom", message: "Contract date is required" });
          return;
        }
        const d = new Date(trimmed);
        if (isNaN(d.getTime())) {
          ctx.addIssue({ code: "custom", message: "Invalid contract date format" });
          return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        d.setHours(23, 59, 59, 999);
        if (d < today) {
          ctx.addIssue({
            code: "custom",
            message: "Contract has expired. Contract must be active and valid for onboarding.",
          });
        }
      }),
    ),
    salesApproved: z.preprocess(
      (value) => value ?? false,
      z.boolean().refine((value) => value === true, {
        message: "Sales must confirm that the delivery can be done",
      }),
    ),
  });

  /**
   * Checks that span steps. They run on the whole draft — the wizard's resolver
   * and the submit endpoint both validate that — and `when: () => true` makes
   * them run even while other fields still have errors, so a missing PSP is
   * reported alongside everything else rather than only once the rest is fixed.
   */
  function crossStepChecks(draft: Record<string, unknown>, ctx: z.RefinementCtx) {
    const products = parseProducts(typeof draft.product === "string" ? draft.product : "");

    if (needsPaymentProvider(products)) {
      if (!String(draft.psp ?? "").trim()) {
        ctx.addIssue({ code: "custom", path: ["psp"], message: "Select a payment service provider" });
      } else if (!String(draft.pspMid ?? "").trim()) {
        ctx.addIssue({ code: "custom", path: ["pspMid"], message: "Merchant ID is required" });
      }
    }

    const cells = Array.isArray(draft.cellComputers) ? (draft.cellComputers as { key?: string }[]) : [];
    const cellKeys = new Set(cells.map((c) => c.key).filter(Boolean));
    const rows = Array.isArray(draft.facilities)
      ? (draft.facilities as { cellComputer?: string; services?: string[] }[])
      : [];
    for (const [i, row] of rows.entries()) {
      if (row.cellComputer && !cellKeys.has(row.cellComputer)) {
        ctx.addIssue({ code: "custom", path: ["facilities"], message: `Facility ${i + 1}: its cell computer was removed — choose another` });
        return;
      }
      const stray = (row.services ?? []).find((s) => !products.includes(s as never));
      if (stray) {
        ctx.addIssue({ code: "custom", path: ["facilities"], message: `Facility ${i + 1}: ${stray} is not one of the selected products` });
        return;
      }
    }
  }

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
  }).superRefine(crossStepChecks, { when: () => true });

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
