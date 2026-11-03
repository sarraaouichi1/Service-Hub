// Static UI configuration, not server state — it stays here rather than
// moving behind src/api/.

import type { WizardStepDef } from "../types";

export const WIZARD_STEPS: WizardStepDef[] = [
  {
    num: 0,
    label: "Step 00",
    name: "Product Selection",
    subtitle: "Select the entervo smart products you want to onboard.",
  },
  {
    num: 1,
    label: "Step 01",
    name: "Operator & Access",
    subtitle:
      "Fill in the parking operator details and network access information.",
  },
  {
    num: 2,
    label: "Step 02",
    name: "Cell Computer",
    subtitle: "Provide cell computer configuration and system settings.",
  },
  {
    num: 3,
    label: "Step 03",
    name: "Facilities",
    subtitle:
      "Add one or more parking facilities served by this cell computer.",
  },
  {
    num: 4,
    label: "Step 04",
    name: "App & Payment",
    subtitle:
      "Configure the mobile app features and select a payment service provider.",
  },
  {
    num: 5,
    label: "Step 05",
    name: "Delivery Check",
    subtitle: "Sales must confirm that the delivery can be done.",
  },
  {
    num: 6,
    label: "Step 06",
    name: "Review & Submit",
    subtitle: "Review all data before submitting for S&B internal approval.",
  },
];
