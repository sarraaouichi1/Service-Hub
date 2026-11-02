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

export interface Facility {
  id: string;
  name: string;
  city: string;
  inpayEntry: string | number;
  inpayPayment: string | number;
}

/** Free-text fields captured by the onboarding wizard across all products. */
export type FormTextKey =
  | "product" | "productName" | "siteName" | "opName" | "opId" | "opEmail"
  | "techEmail" | "phone" | "version" | "ip" | "port" | "domain" | "address"
  | "cellId" | "cellName" | "lang" | "country" | "currency" | "decimals"
  | "uiUserId" | "uiPassword" | "deviceId" | "vat" | "financialInfo"
  | "tocUrl" | "tariff" | "psp" | "pspMid" | "pspTid" | "pspKey" | "pspSecret"
  // Connect additions
  | "providerId" | "salutation" | "contactFirstname" | "contactSurname"
  | "contactStreet" | "contactCity" | "contactEmail" | "contactPhone"
  | "adminUsername" | "adminFirstname" | "adminSurname" | "adminEmail" | "adminPhone" | "sshPort"
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
  | "prepaidProductName" | "prepaidPrice" | "prepaidCredit" | "prepaidMinBalance";

/** Feature switches captured by the onboarding wizard across all products. */
export type FormBoolKey =
  | "reachable" | "forwarding" | "lpr" | "barcode" | "lfk" | "freeflow"
  | "vouchers" | "prepay" | "topup" | "salesApproved"
  | "onlineAuth" | "customerMedia" | "counting"
  | "open247" | "accessOutsideHours"
  | "mainAreaConcept" | "autoCheckout" | "boostFunction" | "productWebshop" | "autoDeactivation";

/**
 * The onboarding wizard's working draft. Every field is optional because the
 * wizard lets the user move between steps before anything is filled in.
 * `pm_*` keys hold the per-payment-method toggles selected in Step 4.
 */
export type OnboardingForm = { [K in FormTextKey]?: string } & {
  [K in FormBoolKey]?: boolean;
} & { facilities?: Facility[] } & {
  [key: `pm_${string}`]: boolean | undefined;
};

/**
 * Validation messages keyed by the field that produced them. Facilities are a
 * repeating row rather than a single control, so they share one key.
 */
export type FormErrors = Partial<
  Record<FormTextKey | FormBoolKey | "facilities", string>
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
