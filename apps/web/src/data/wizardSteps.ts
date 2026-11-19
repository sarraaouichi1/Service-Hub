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
    name: "Operator",
    subtitle:
      "Fill in the parking operator's details, locale and finance settings.",
  },
  {
    num: 2,
    label: "Step 02",
    name: "Cell Computers",
    subtitle: "Add every cell computer the operator runs, each with its own address and credentials.",
  },
  {
    num: 3,
    label: "Step 03",
    name: "Facilities",
    subtitle:
      "Add each facility, the cell computer it is connected to, and the services enabled there.",
  },
  {
    num: 4,
    label: "Step 04",
    name: "Product Settings",
    subtitle:
      "What each selected product's onboarding sheet asks for, including the payment service provider for smart web pay.",
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
