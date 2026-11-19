/**
 * Payment service providers and what each one needs, as specified in the
 * "smart web pay ONBOARDING SHEET (Version 3.1)" — the right-hand column of
 * that sheet lists, per PSP, its payment methods and its credential fields.
 *
 * This is the single definition: the API serves the catalogue from it, the
 * wizard draws each PSP's form from it, the schema checks required fields
 * against it, and the API strips the `secret` fields from every read. Adding a
 * PSP or a field is an edit here and nothing else.
 */

export interface PspField {
  /** Stored under `pspConfig.fields[key]`. */
  key: string;
  label: string;
  required: boolean;
  /** Write-only: accepted on save, never returned by a read. */
  secret?: boolean;
  /** A fixed set of choices (e.g. Moneris accepts CAD or USD only). */
  options?: readonly string[];
  hint?: string;
}

export interface PspDefinition {
  id: string;
  name: string;
  tag: string;
  /** Payment methods the sheet offers for this PSP; at least one must be chosen. */
  methods: readonly string[];
  fields: readonly PspField[];
}

export const PSP_DEFINITIONS: readonly PspDefinition[] = [
  {
    id: "fiserv", name: "Fiserv / Telecash", tag: "EU / Global",
    methods: ["visa", "mastercard", "creditcard", "sepa", "paypal", "applepay", "googlepay"],
    fields: [
      { key: "storeId", label: "Store ID", required: true },
      { key: "apiPassword", label: "API password", required: true, secret: true },
      { key: "sharedSecret", label: "Shared secret value", required: true, secret: true },
      { key: "privateKeyPassword", label: "Private key password", required: true, secret: true },
      { key: "privateKeyApiPassword", label: "Private key API password", required: false, secret: true },
      { key: "privateKeyApiSecret", label: "Private key API secret", required: false, secret: true },
      { key: "keyFile", label: "Key file", required: false, hint: "The sheet asks for the key file itself: send it to S&B separately and note its file name here" },
    ],
  },
  {
    id: "planet", name: "Planet", tag: "Hospitality",
    methods: ["creditcard", "paypal"],
    fields: [
      { key: "currency", label: "Currency", required: true, hint: "ISO 4217, e.g. EUR" },
      { key: "merchant", label: "Merchant", required: true },
      { key: "validationCode", label: "Validation code", required: true, secret: true },
      { key: "templateVersion", label: "Template version", required: false },
    ],
  },
  {
    id: "trustcommerce", name: "TrustCommerce", tag: "US / CA",
    methods: ["creditcard"],
    fields: [
      { key: "apiId", label: "API ID", required: true },
      { key: "apiPassword", label: "API password", required: true, secret: true },
      { key: "licenseKey", label: "License key", required: true, secret: true },
    ],
  },
  {
    id: "nmi", name: "NMI", tag: "US / EU",
    methods: ["creditcard"],
    fields: [
      { key: "user", label: "User", required: true },
      { key: "apiKey", label: "API key", required: true, secret: true },
      { key: "tokenizationKey", label: "Tokenization key for collect.js", required: true, secret: true },
      { key: "checkoutKey", label: "Checkout key", required: true, secret: true },
    ],
  },
  {
    id: "worldline", name: "Worldline", tag: "EU",
    methods: ["creditcard", "bancontact", "TWINT", "bizum", "sepa", "iDEAL"],
    fields: [
      { key: "currency", label: "Currency", required: true, hint: "ISO 4217, e.g. EUR" },
      { key: "pspId", label: "PSP ID", required: true },
      { key: "apiKey", label: "API key", required: true, secret: true },
      { key: "secretApiKey", label: "Secret API key", required: true, secret: true },
    ],
  },
  {
    id: "ccv", name: "CCV", tag: "Benelux",
    methods: ["creditcard", "bancontact", "iDEAL"],
    fields: [
      { key: "currency", label: "Currency", required: true, hint: "ISO 4217, e.g. EUR" },
      { key: "apiKey", label: "API key", required: true, secret: true },
    ],
  },
  {
    id: "advam", name: "Advam", tag: "AU / UK",
    methods: ["creditcard", "applepay", "googlepay"],
    fields: [
      { key: "currency", label: "Currency", required: true, hint: "ISO 4217, e.g. AUD" },
      { key: "accountNumber", label: "Account number", required: true },
      { key: "username", label: "Username", required: true },
      { key: "clientId", label: "Client ID", required: true },
      { key: "signingKeyId", label: "Signing key ID", required: true },
      { key: "secretKey", label: "Secret key", required: true, secret: true },
    ],
  },
  {
    id: "moneris", name: "Moneris", tag: "CA / US",
    methods: ["creditcard"],
    fields: [
      { key: "currency", label: "Currency", required: true, options: ["CAD", "USD"] },
      { key: "storeId", label: "Store ID", required: true },
      { key: "apiToken", label: "API token", required: true, secret: true },
      { key: "checkoutPaymentId", label: "Checkout payment ID", required: true },
      { key: "checkoutTokenizationId", label: "Checkout tokenization ID", required: true },
    ],
  },
];

export function pspDefinition(id: string | undefined): PspDefinition | undefined {
  return PSP_DEFINITIONS.find((p) => p.id === id);
}

/** How a payment method reads on screen; the sheet's spelling is the stored value. */
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  visa: "Visa", mastercard: "Mastercard", creditcard: "Credit card", sepa: "SEPA", paypal: "PayPal",
  applepay: "Apple Pay", googlepay: "Google Pay", bancontact: "Bancontact", TWINT: "TWINT",
  bizum: "Bizum", iDEAL: "iDEAL",
};
