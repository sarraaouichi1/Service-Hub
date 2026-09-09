// Mock data. Replace with API calls when a backend exists.

import type { CountryTemplate } from "../types";

export const INITIAL_TEMPLATES: CountryTemplate[] = [
{ id: 1, title: "UK — Default", country: "GB", lang: "en-GB", currency: "GBP", vat: "20", psp: "Fiserv", status: "active", projects: 3 },
{ id: 2, title: "Germany — Default", country: "DE", lang: "de-DE", currency: "EUR", vat: "19", psp: "Worldline", status: "active", projects: 2 },
{ id: 3, title: "Netherlands — Default", country: "NL", lang: "nl-NL", currency: "EUR", vat: "21", psp: "CCV", status: "active", projects: 1 },
{ id: 4, title: "Switzerland — Default", country: "CH", lang: "de-CH", currency: "CHF", vat: "0", psp: "CCV", status: "draft", projects: 0 },
{ id: 5, title: "France — Default", country: "FR", lang: "fr-FR", currency: "EUR", vat: "20", psp: "Worldline", status: "draft", projects: 0 },
];
