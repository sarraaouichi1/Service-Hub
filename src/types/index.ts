// Domain types for the entervo Service Hub.

import type { Dispatch, ReactNode, SetStateAction } from "react";

// ─── DOMAIN TYPES ───────────────────────────────────────────────────────────
export type ModuleId = "onboarding" | "patch";

export type IconName =
  | "grid"
  | "plus"
  | "check"
  | "chevronRight"
  | "chevronLeft"
  | "bell"
  | "building"
  | "settings"
  | "list"
  | "trash"
  | "creditCard"
  | "shield"
  | "eye"
  | "download"
  | "server"
  | "mapPin"
  | "zap"
  | "users";

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export type ProjectStatus =
  | "draft"
  | "progress"
  | "review"
  | "approved"
  | "sales-approval"
  | "onboarded";

export type ProductId = "smart-web-pay" | "smart-validation" | "econnect" | "eaccess";

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

export interface StatusMeta {
  label: string;
  cls: string;
}
export interface Psp {
  id: string;
  name: string;
  tag: string;
}

export interface ProductDefinition {
  id: ProductId;
  name: string;
  desc: string;
  icon: string;
  color: string;
  bg: string;
  fields: string[];
}

export interface WizardStepDef {
  num: number;
  label: string;
  name: string;
  subtitle: string;
}

export interface PlatformUser {
  id: number;
  initials: string;
  name: string;
  role: string;
  email: string;
  partner: string;
  color: string;
}

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

/** Free-text fields captured by the onboarding wizard. */
export type FormTextKey =
  | "product"
  | "productName"
  | "siteName"
  | "opName"
  | "opId"
  | "opEmail"
  | "techEmail"
  | "phone"
  | "version"
  | "ip"
  | "port"
  | "domain"
  | "address"
  | "cellId"
  | "cellName"
  | "lang"
  | "country"
  | "currency"
  | "decimals"
  | "uiUserId"
  | "uiPassword"
  | "deviceId"
  | "vat"
  | "financialInfo"
  | "tocUrl"
  | "tariff"
  | "psp"
  | "pspMid"
  | "pspTid"
  | "pspKey"
  | "pspSecret";

/** Feature switches captured by the onboarding wizard. */
export type FormBoolKey =
  | "reachable"
  | "forwarding"
  | "lpr"
  | "barcode"
  | "lfk"
  | "freeflow"
  | "vouchers"
  | "prepay"
  | "topup"
  | "salesApproved";

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

export interface StepProps {
  data: OnboardingForm;
  setData: Dispatch<SetStateAction<OnboardingForm>>;
}

export interface ReviewStepProps {
  data: OnboardingForm;
}

/**
 * Validation messages keyed by the field that produced them. Facilities are a
 * repeating row rather than a single control, so they share one key.
 */
export type FormErrors = Partial<
  Record<FormTextKey | FormBoolKey | "facilities", string>
>;

/** Props for a wizard step that renders validation messages against its fields. */
export interface ValidatedStepProps extends StepProps {
  errors: FormErrors;
  setErrors: Dispatch<SetStateAction<FormErrors>>;
  /** The step's own index, so a field can be re-checked in the right context. */
  step: number;
}

export interface DeclarationReviewStepProps extends ReviewStepProps {
  declared: boolean;
  onDeclaredChange: (declared: boolean) => void;
}

export interface FieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  span2?: boolean;
  error?: string;
}

export interface ToggleProps {
  label: string;
  sub?: string;
  value?: boolean;
  onChange: (value: boolean) => void;
}

// ─── ADMIN TYPES ────────────────────────────────────────────────────────────
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
  | "Network"
  | "System"
  | "Localisation"
  | "Security"
  | "Finance"
  | "Contact";
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

export type UserRole =
  | "Admin"
  | "Project Manager"
  | "Sales"
  | "Reviewer"
  | "DevOps"
  | "Partner"
  | "Customer";
export type UserStatus = "active" | "inactive" | "pending";

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

export type InviteDraft = Pick<
  AdminUser,
  "name" | "email" | "role" | "partner"
>;

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
  | "platformName"
  | "supportEmail"
  | "defaultPM"
  | "sessionTimeout";
export type PlatformConfigBoolKey =
  | "notifyOnSubmit"
  | "notifyOnApprove"
  | "notifyOnReject"
  | "requireDualApproval"
  | "autoExportOnApprove";

// ─── PATCH TYPES ────────────────────────────────────────────────────────────
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

export type TemplateDraftTextKey =
  | "title"
  | "country"
  | "lang"
  | "currency"
  | "vat";
export type InviteDraftTextKey = "name" | "email" | "partner";

export interface AuditLogEntry {
  time: string;
  user: string;
  action: string;
  target: string;
  color: string;
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

/** Per-route metadata read by module layouts to render the topbar. */
export interface RouteStaticData {
  title: string;
}
