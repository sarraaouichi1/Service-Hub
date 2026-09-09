// Mock data. Replace with API calls when a backend exists.

import type { Psp } from "../types";

export const PSP_LIST: Psp[] = [
  { id: "fiserv", name: "Fiserv / Telecash", tag: "EU / Global" },
  { id: "planet", name: "Planet", tag: "Hospitality" },
  { id: "trustcommerce", name: "TrustCommerce", tag: "US / CA" },
  { id: "nmi", name: "NMI", tag: "US / EU" },
  { id: "ccv", name: "CCV", tag: "Benelux" },
  { id: "worldline", name: "Worldline", tag: "EU" },
];

/** Short PSP names offered when configuring a country template. */
export const PSP_NAMES = ["Fiserv", "Planet", "TrustCommerce", "NMI", "CCV", "Worldline"];
