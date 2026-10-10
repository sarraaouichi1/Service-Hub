import type { Permission } from "@service-hub/shared";
import type { IconName } from "../types";

/**
 * The hub's modules. The header switcher and the hub's tiles both read this,
 * so a third module is one entry here rather than an edit in each place.
 */
export interface HubModule {
  to: "/onboarding" | "/patch";
  label: string;
  /** One-word division label, uppercase on the hub tile. */
  kicker: string;
  icon: IconName;
  description: string;
  highlights: string[];
  /** Hidden from anyone who lacks this. The API enforces the same rule. */
  permission: Permission;
}

export const HUB_MODULES: HubModule[] = [
  {
    to: "/onboarding",
    label: "Onboarding",
    kicker: "Provisioning",
    icon: "layers",
    description: "Provision a customer onto entervo smart — company, facilities, hardware, payment and go-live — through one guided, validated workflow.",
    highlights: ["Seven-step guided wizard", "Review, sales and approval flow", "Country templates and validation rules"],
    permission: "project:read",
  },
  {
    to: "/patch",
    label: "Patch Management",
    kicker: "Operations",
    icon: "shield",
    description: "Keep every entervo installation patched — security bulletins, rollout schedules and the managed service tiers behind them.",
    highlights: ["Security bulletins by severity", "Maintenance-window scheduling", "Basic and Premium service tiers"],
    permission: "patch:read",
  },
];
