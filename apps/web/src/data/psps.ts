// Seed data for the in-memory API store. Components read this through
// src/api/, never directly; when real endpoints land, only src/api/ changes.

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
