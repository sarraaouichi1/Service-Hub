// Mock data. Replace with API calls when a backend exists.

import type { OnboardingForm } from "../types";

/** Pre-filled Medway Hospital draft used to demo the wizard. */
export const DEMO_ONBOARDING_DRAFT: OnboardingForm = {
  ip: "195.171.142.1",
  port: "8443",
  opName: "Medway Hospital",
  version: "V3R0M4",
  opEmail: "medwayft.carparking@nhs.net",
  domain: "204.96.89.10",
  opId: "49666",
  lang: "en-GB",
  country: "GB",
  currency: "GBP",
  cellId: "4438",
  vat: "20",
  lpr: true,
  barcode: true,
  reachable: true,
  forwarding: true,
  psp: "fiserv",
  pspMid: "FIS-MED-001",
  tariff: "0",
  facilities: [
    {
      id: "4439",
      name: "Car Park D – Public",
      city: "Gillingham",
      inpayEntry: 30,
      inpayPayment: 30,
    },
    {
      id: "4440",
      name: "Car Park D – Public (2)",
      city: "Gillingham",
      inpayEntry: 30,
      inpayPayment: 30,
    },
    {
      id: "4441",
      name: "Car Park B – Staff",
      city: "Gillingham",
      inpayEntry: 30,
      inpayPayment: 30,
    },
  ],
};
