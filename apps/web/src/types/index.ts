// Web-app types.
//
// The data itself is described in @service-hub/shared, which the API depends on
// too. What lives here is only how the web app draws that data: icon names,
// component props, route metadata. Domain types are re-exported so call sites
// can keep importing from one place.

import type { ReactNode } from "react";

export type * from "@service-hub/shared";

export type ModuleId = "onboarding" | "patch";

export type IconName =
  | "grid" | "plus" | "check" | "chevronRight" | "chevronLeft" | "bell"
  | "building" | "settings" | "list" | "trash" | "creditCard" | "shield"
  | "eye" | "download" | "server" | "mapPin" | "zap" | "users" | "lock";

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export interface StatusMeta {
  label: string;
  cls: string;
}

export interface WizardStepDef {
  num: number;
  label: string;
  name: string;
  subtitle: string;
}

/**
 * Wizard steps take no draft props: they reach the shared React Hook Form
 * instance through `FormProvider`. The review step still needs the declaration
 * tick, which is module state rather than draft data.
 */
export interface DeclarationReviewStepProps {
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

export type TemplateDraftTextKey = "title" | "country" | "lang" | "currency" | "vat";
export type InviteDraftTextKey = "name" | "email" | "partner";

/** Per-route metadata read by module layouts to render the topbar. */
export interface RouteStaticData {
  title: string;
}
