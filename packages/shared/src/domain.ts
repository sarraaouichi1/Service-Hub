// Domain types for the entervo Service Hub.
//
// These describe the data itself, so both the API and the web app depend on
// them. Anything that only describes how something is drawn — icon names,
// component props — stays in the web app.

export type ProjectStatus =
  | "draft" | "progress" | "review" | "approved" | "sales-approval" | "onboarded";

export type ProductId =
  | "smart-web-pay"
  | "entervo-connect"
  | "smart-validation"
  | "mobility-connect"
  | "smart-select"
  | "smart-tenant"
  | "econnect"
  | "eaccess";

export interface Project {
  id: number;
  name: string;
  partner: string;
  pm: string;
  step: number;
  total: number;
  status: ProjectStatus;
  psp: string;
  country: string;
  product: ProductId;
  /** True when the signed-in person submitted it. Set by the API. */
  mine?: boolean;
}

export interface Psp { id: string; name: string; tag: string }

export interface ProductDefinition {
  id: ProductId;
  name: string;
  desc: string;
  icon: string;
  color: string;
  bg: string;
  fields: string[];
}

export type UserRole =
  | "Admin" | "Project Manager" | "Sales" | "Reviewer" | "DevOps" | "Partner" | "Customer";
export type UserStatus = "active" | "inactive" | "pending";

export interface PlatformUser {
  id: number;
  initials: string;
  name: string;
  role: UserRole;
  email: string;
  partner: string;
  color: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  partner: string;
  status: UserStatus;
  lastLogin: string;
  initials: string;
}

export type InviteDraft = Pick<AdminUser, "name" | "email" | "role" | "partner">;

export type NotificationType = "submit" | "approve" | "reject" | "info";

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  color: string;
  iconColor: string;
}

/**
 * One cell computer belonging to the operator.
 *
 * An operator can run several, each reached on its own address with its own
 * credentials, so connection details live here rather than on the operator.
 * `key` is a stable handle the facilities point at: the user may still edit
 * `cellId` and `name`, and a facility's link must survive that.
 */
export interface CellComputer {
  key: string;
  /** Display name, e.g. CC-01 or CC-North. */
  name: string;
  /** Numeric ID from the entervo system. */
  cellId: string;
  url: string;
  ip: string;
  port: string;
  uiUserId: string;
  /** Write-only: accepted on save, never returned by a read. */
  uiPassword: string;
  deviceId: string;
  /** No longer asked for (not on entervo connect sheet v3.0); kept so older drafts still read. */
  sshPort: string;
  /** smart web pay: the name shown to customers. */
  hostName?: string;
  /** smart web pay: physical address of the cell computer, not its network address. */
  address?: string;
  /** smart web pay: cashier contract and consumer IDs. */
  cashierContractId?: string;
  cashierConsumerId?: string;
}

/** Carpark types from the entervo connect sheet: multi-storey, underground, park area (default). */
export type CarparkType = "MSCP" | "UGCP" | "PA";
/** Media types from the smart validation sheet, per facility. */
export const VALIDATION_MEDIA_TYPES = ["Barcode", "LPN", "Mobile-ID"] as const;

export interface Facility {
  id: string;
  name: string;
  city: string;
  inpayEntry: string | number;
  inpayPayment: string | number;
  /** The `key` of the cell computer this facility is connected to. */
  cellComputer?: string;
  /** Products enabled at this physical location — a subset of those selected. */
  services?: ProductId[];
  /** smart web pay: only when the facility's address differs from the cell computer's. */
  address?: string;
  /** smart web pay: the enclosing facility, for a nested area. */
  parentId?: string;
  /** smart validation: IANA time zone of the facility, e.g. Europe/London. */
  timezone?: string;
  /** smart validation: media accepted here. */
  mediaTypes?: string[];
  /** entervo connect: defaults to PA. */
  carparkType?: CarparkType;
}

/**
 * The chosen PSP's credentials and payment methods. Field keys come from
 * `PSP_DEFINITIONS`; the ones marked secret are write-only.
 */
export interface PspConfig {
  fields: Record<string, string>;
  methods: string[];
}

/** Free-text fields captured by the onboarding wizard across all products. */
export type FormTextKey =
  | "product" | "productName" | "siteName" | "opName" | "opId" | "opEmail"
  | "techEmail" | "phone" | "version" | "ip" | "port" | "domain" | "address"
  | "cellId" | "cellName" | "lang" | "country" | "currency" | "decimals"
  | "uiUserId" | "uiPassword" | "deviceId" | "vat" | "financialInfo"
  | "tocUrl" | "tariff" | "psp" | "pspMid" | "pspTid" | "pspKey" | "pspSecret"
  // Connect additions
  | "providerId" | "salutation" | "contactTitle" | "contactFirstname" | "contactSurname"
  | "contactStreet" | "contactCity" | "contactEmail" | "contactPhone"
  | "adminUsername" | "adminName" | "adminFirstname" | "adminSurname" | "adminEmail" | "adminPhone" | "sshPort"
  | "onlineAuthProvider" | "customerMediaProvider" | "countingProvider" | "deviceControlProvider"
  // smart web pay (sheet v3.1) additions
  | "opDescription" | "contactUsEmails" | "receiptEmails" | "pgsLocationDescription"
  | "shiftHandlingTime" | "inPayAfterEntry" | "inPayAfterPayment" | "serviceFeeType" | "serviceFee"
  // Smart Validation additions
  | "tenantShortname" | "tenantDescription" | "subtechEmail" | "incidentEmail" | "onboardingEmail" | "mediatypes"
  // Mobility Connect additions
  | "carparkType" | "heightLimit" | "parkingLots" | "chargingStations" | "costCenter"
  | "entryLanes" | "exitLanes" | "zipCode" | "city" | "latitude" | "longitude" | "dailyMax" | "taxId" | "mobilityProvider"
  // Smart Select additions
  | "portalUrl" | "projectName" | "senderEmail" | "senderDomain" | "brandColors" | "privacyUrl" | "paymentType"
  | "totalSpaces" | "minParkingDuration" | "checkInterval" | "overstayDuration"
  | "contractProductName" | "contractOneTimeFee" | "contractRecurringFee" | "contractMinLeaseMonths" | "contractNoticePeriod" | "contractMaxBookings"
  | "timeCardProductName" | "timeCardFee" | "timeCardDuration"
  | "bundleProductName" | "bundleFee" | "bundleSlotsCount" | "bundleSlotDuration" | "bundleOverstayFee"
  | "prepaidProductName" | "prepaidPrice" | "prepaidCredit" | "prepaidMinBalance"
  // Delivery & contract validation
  | "contractDate";

/** Feature switches captured by the onboarding wizard across all products. */
export type FormBoolKey =
  | "reachable" | "forwarding" | "lpr" | "barcode" | "lfk" | "freeflow"
  | "vouchers" | "prepay" | "topup" | "salesApproved"
  | "onlineAuth" | "customerMedia" | "counting"
  | "open247" | "accessOutsideHours"
  | "mainAreaConcept" | "autoCheckout" | "boostFunction" | "productWebshop" | "autoDeactivation"
  // entervo connect, smart validation, smart web pay sheet additions
  | "deviceControl" | "showLpnInReport" | "latePayment" | "showInPayTime";

/**
 * The onboarding wizard's working draft. Every field is optional because the
 * wizard lets the user move between steps before anything is filled in.
 * `pm_*` keys hold the per-payment-method toggles selected in Step 4.
 */
export type OnboardingForm = { [K in FormTextKey]?: string } & {
  [K in FormBoolKey]?: boolean;
} & { facilities?: Facility[]; cellComputers?: CellComputer[]; pspConfig?: PspConfig } & {
  [key: `pm_${string}`]: boolean | undefined;
};

/**
 * Validation messages keyed by the field that produced them. Facilities and
 * cell computers are repeating rows rather than single controls, so each list
 * shares one key and the message names the row.
 */
export type FormErrors = Partial<
  Record<FormTextKey | FormBoolKey | "facilities" | "cellComputers" | "pspConfig", string>
>;

export type TemplateStatus = "active" | "draft";

export interface CountryTemplate {
  id: number;
  title: string;
  country: string;
  lang: string;
  currency: string;
  vat: string;
  psp: string;
  status: TemplateStatus;
  projects: number;
}

export type TemplateDraft = Omit<CountryTemplate, "id" | "projects">;

export type RuleCategory =
  | "Network" | "System" | "Localisation" | "Security" | "Finance" | "Contact";
export type RuleSeverity = "error" | "warning";

export interface ValidationRule {
  id: number;
  field: string;
  category: RuleCategory;
  type: string;
  pattern: string;
  severity: RuleSeverity;
  active: boolean;
  description: string;
}

export interface PlatformConfig {
  platformName: string;
  supportEmail: string;
  defaultPM: string;
  notifyOnSubmit: boolean;
  notifyOnApprove: boolean;
  notifyOnReject: boolean;
  requireDualApproval: boolean;
  autoExportOnApprove: boolean;
  sessionTimeout: string;
  exportFormat: string;
}

export type PlatformConfigTextKey =
  | "platformName" | "supportEmail" | "defaultPM" | "sessionTimeout";
export type PlatformConfigBoolKey =
  | "notifyOnSubmit" | "notifyOnApprove" | "notifyOnReject"
  | "requireDualApproval" | "autoExportOnApprove";

export interface AuditLogEntry {
  time: string;
  user: string;
  action: string;
  target: string;
  color: string;
}

export type PatchSeverity = "Critical" | "High" | "Medium" | "Low";
export type PatchStatus = "deployed" | "testing" | "scheduled" | "pending";

export interface PatchBulletin {
  id: string;
  name: string;
  severity: PatchSeverity;
  released: string;
  systems: number;
  status: PatchStatus;
  risk: string;
}

export interface PatchStage {
  num: number;
  /** HTML entity for the stage glyph. */
  icon: string;
  color: string;
  name: string;
  desc: string;
}

export interface PatchServiceTier {
  id: "basic" | "premium";
  name: string;
  popular: boolean;
  features: string[];
}
