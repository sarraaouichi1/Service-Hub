import { VALIDATION_MEDIA_TYPES } from "./domain.js";
import type { CellComputer, Facility, OnboardingForm, ProductId } from "./domain.js";

const LEGACY_METHODS: Record<string, string> = {
  Visa: "visa", Mastercard: "mastercard", "Apple Pay": "applepay", "Google Pay": "googlepay", PayPal: "paypal", SEPA: "sepa",
};

/**
 * The wizard stores its product selection as one comma-separated string — the
 * shape React Hook Form binds a multi-select card grid to. Every reader went
 * through the same split-and-filter; this is that, once.
 */
export function parseProducts(value: string | undefined | null): ProductId[] {
  return (value ?? "").split(",").map((p) => p.trim()).filter(Boolean) as ProductId[];
}

/**
 * Products that take payments themselves and therefore need a payment service
 * provider. A Validation-only onboarding has none, and asking for one there
 * misled testers into thinking it was required.
 */
export const PAYMENT_PRODUCTS: readonly ProductId[] = ["smart-web-pay"];

export function needsPaymentProvider(products: readonly ProductId[]): boolean {
  return products.some((p) => PAYMENT_PRODUCTS.includes(p));
}

/** A stable handle for a new cell computer row; see `CellComputer.key`. */
export function newCellComputerKey(): string {
  return `cc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const EMPTY_CELL_COMPUTER: Omit<CellComputer, "key"> = {
  name: "", cellId: "", url: "", ip: "", port: "", uiUserId: "", uiPassword: "", deviceId: "", sshPort: "",
};

/**
 * Before v1.1 a draft held exactly one cell computer as flat fields beside the
 * operator. Drafts and submitted projects saved in that shape are still in the
 * database, so every reader passes them through here first and only ever sees
 * the current shape.
 *
 * The migration is conservative: it fills in what the old shape implied (the
 * single cell computer, every facility on it, every selected product enabled at
 * every facility) and leaves anything already in the new shape alone.
 */
const LEGACY_CELL_FIELDS = {
  cellName: "name", cellId: "cellId", domain: "url", ip: "ip", port: "port",
  uiUserId: "uiUserId", uiPassword: "uiPassword", deviceId: "deviceId", sshPort: "sshPort",
} as const;

export function normalizeDraft(input: OnboardingForm | null | undefined): OnboardingForm {
  const draft: OnboardingForm = { ...(input ?? {}) };
  const flat = draft as Record<string, unknown>;

  const legacyKeys = Object.keys(LEGACY_CELL_FIELDS).filter((k) => typeof flat[k] === "string" && flat[k] !== "");
  if (!Array.isArray(draft.cellComputers) && legacyKeys.length > 0) {
    const migrated: CellComputer = { key: "cc-1", ...EMPTY_CELL_COMPUTER };
    for (const [from, to] of Object.entries(LEGACY_CELL_FIELDS)) {
      if (typeof flat[from] === "string") migrated[to] = flat[from] as string;
    }
    if (!migrated.name) migrated.name = migrated.cellId ? `CC-${migrated.cellId}` : "CC-01";
    draft.cellComputers = [migrated];
  }
  for (const key of Object.keys(LEGACY_CELL_FIELDS)) delete flat[key];

  const cells = draft.cellComputers ?? [];
  // Media types used to be one free-text field for the whole onboarding; the
  // validation sheet asks per facility.
  const legacyMedia = typeof flat.mediatypes === "string"
    ? VALIDATION_MEDIA_TYPES.filter((m) => (flat.mediatypes as string).toLowerCase().includes(m.toLowerCase()))
    : [];
  if (Array.isArray(draft.facilities)) {
    const products = parseProducts(draft.product);
    draft.facilities = draft.facilities.map((row): Facility => {
      const services = row.services ?? (products.length > 0 ? [...products] : undefined);
      const next: Facility = {
        ...row,
        cellComputer: row.cellComputer ?? (cells.length === 1 ? cells[0].key : undefined),
        services,
      };
      if (services?.includes("smart-validation") && !row.mediaTypes && legacyMedia.length) next.mediaTypes = [...legacyMedia];
      // The connect sheet's default carpark type.
      if (services?.includes("entervo-connect") && !row.carparkType) next.carparkType = "PA";
      return next;
    });
  }

  // Payment methods were per-name toggles (`pm_Visa`); the PSP forms keep them
  // as the sheet's values in `pspConfig.methods`.
  if (!draft.pspConfig) {
    const legacyMethods = Object.entries(flat)
      .filter(([k, v]) => k.startsWith("pm_") && v === true)
      .map(([k]) => LEGACY_METHODS[k.slice(3)])
      .filter((m): m is string => Boolean(m));
    if (legacyMethods.length) draft.pspConfig = { fields: {}, methods: legacyMethods };
  }
  return draft;
}
