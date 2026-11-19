/**
 * The three onboarding sheets' requirements, one test per rule the sheet
 * states. When S&B publishes a new sheet version, this is the file to diff.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createOnboardingSchemas, normalizeDraft, PSP_DEFINITIONS, pspDefinition,
  validationGeneratedUrls, validationLocationId, blockingRulesFor,
} from "../src/index.js";
import type { OnboardingForm } from "../src/index.js";

const { onboardingDraftSchema } = createOnboardingSchemas();
const serverSchemas = createOnboardingSchemas(undefined, { requireSecrets: true });
const errorsOf = (draft: OnboardingForm, schema = onboardingDraftSchema) => {
  const result = schema.safeParse(draft);
  return result.success ? {} : Object.fromEntries(result.error.issues.map((i) => [String(i.path[0]), i.message]));
};
const ruleOk = (key: Parameters<typeof blockingRulesFor>[0], value: string) =>
  blockingRulesFor(key).every((r) => r.check!(value));

const base = (product: string, over: Partial<OnboardingForm> = {}): OnboardingForm => ({
  product, opName: "Op", opId: "55555", opEmail: "a@b.co", country: "GB", lang: "en-GB", currency: "GBP", city: "London",
  cellComputers: [{ key: "k", name: "CC-01", cellId: "7020", url: "", ip: "1.2.3.4", port: "8443", uiUserId: "42", uiPassword: "", deviceId: "799", sshPort: "", hostName: "Host" }],
  facilities: [{ id: "1", name: "F", city: "", inpayEntry: 0, inpayPayment: 0, cellComputer: "k", services: [product as never], timezone: "Europe/London", mediaTypes: ["LPN"], carparkType: "PA" }],
  contractDate: "2099-01-01", salesApproved: true, ...over,
});

// ── smart validation v4.4 ──────────────────────────────────────────────────
test("validation: tenant shortname, description, operator ID, currency and SUBtech e-mail are required", () => {
  const errors = errorsOf(base("smart-validation"));
  for (const key of ["tenantShortname", "tenantDescription", "subtechEmail"]) assert.ok(errors[key], key);
  const noOpId = errorsOf(base("smart-validation", { opId: "", tenantShortname: "x", tenantDescription: "x", subtechEmail: "a@b.co" }));
  assert.equal(noOpId.opId, "Operator ID is required for smart validation");
});

test("validation: tenant shortname is up to 20 lowercase letters", () => {
  assert.ok(ruleOk("tenantShortname", "centralgarage"));
  for (const bad of ["central-garage", "Central", "garage1", "a".repeat(21), "c g"]) assert.ok(!ruleOk("tenantShortname", bad), bad);
});

test("validation: operator ID is 5 digits", () => {
  assert.ok(ruleOk("opId", "55555"));
  for (const bad of ["5555", "555555", "5555a"]) assert.ok(!ruleOk("opId", bad), bad);
});

test("validation: each validation facility needs a time zone and media types", () => {
  const ok = { tenantShortname: "x", tenantDescription: "x", subtechEmail: "a@b.co" };
  const f = base("smart-validation").facilities![0];
  assert.match(errorsOf(base("smart-validation", { ...ok, facilities: [{ ...f, timezone: "" }] })).facilities, /time zone/);
  assert.match(errorsOf(base("smart-validation", { ...ok, facilities: [{ ...f, mediaTypes: [] }] })).facilities, /media types/);
  assert.deepEqual(errorsOf(base("smart-validation", ok)), {});
});

test("validation: a cell computer may be reached by URL instead of IP and port", () => {
  const ok = { tenantShortname: "x", tenantDescription: "x", subtechEmail: "a@b.co" };
  const c = base("smart-validation").cellComputers![0];
  assert.deepEqual(errorsOf(base("smart-validation", { ...ok, cellComputers: [{ ...c, ip: "", port: "", url: "cc.example.com" }] })), {});
  assert.match(errorsOf(base("smart-validation", { ...ok, cellComputers: [{ ...c, port: "" }] })).cellComputers, /IP and port, or a URL/);
});

test("validation: generated URLs and Location-ID follow the sheet's formulas", () => {
  const urls = validationGeneratedUrls("centralgarage")!;
  assert.equal(urls.url, "smartvalidation-centralgarage.scheidt-bachmann.net");
  assert.equal(urls.senderEmail, "smartvalidation-centralgarage@scheidt-bachmann.net");
  assert.equal(urls.subtechEmail, "smartvalidation-subtech-centralgarage@scheidt-bachmann.net");
  assert.equal(urls.ovalAdminUrl, "https://validation-portal-smartvalidation-centralgarage.prod.parking-core.scheidt-bachmann.net/oval-admin");
  assert.equal(urls.cpiAdminUrl, "https://validation-portal-smartvalidation-centralgarage.prod.parking-core.scheidt-bachmann.net/cpi-admin");
  assert.equal(urls.kioskUrl, "https://smartvalidation-kiosk.prod.parking-core.scheidt-bachmann.net/centralgarage/login");
  assert.equal(validationGeneratedUrls(""), null);
  assert.equal(validationLocationId("4438", "1338"), "SB4438.1338.0");
  assert.equal(validationLocationId("", "1338"), "");
});

// ── smart web pay v3.1 ─────────────────────────────────────────────────────
const webPayFields: Partial<OnboardingForm> = {
  opDescription: "d", contactUsEmails: "a@b.co;c@d.co", incidentEmail: "i@b.co", receiptEmails: "r@b.co",
  tocUrl: "https://x.co/terms", pgsLocationDescription: "PGS", decimals: "2", inPayAfterEntry: "0", inPayAfterPayment: "0",
  serviceFeeType: "none", psp: "nmi", pspConfig: { fields: { user: "u" }, methods: ["creditcard"] },
};

test("web pay: the sheet's starred fields are required", () => {
  const errors = errorsOf(base("smart-web-pay", { psp: "nmi", pspConfig: { fields: { user: "u" }, methods: ["creditcard"] } }));
  for (const key of ["opDescription", "contactUsEmails", "incidentEmail", "receiptEmails", "tocUrl", "pgsLocationDescription", "inPayAfterEntry", "inPayAfterPayment", "serviceFeeType"]) {
    assert.ok(errors[key], key);
  }
  assert.deepEqual(errorsOf(base("smart-web-pay", webPayFields)), {});
});

test("web pay: e-mail fields take ;-separated lists without spaces", () => {
  assert.ok(ruleOk("contactUsEmails", "a@b.co;c@d.co"));
  assert.ok(!ruleOk("contactUsEmails", "a@b.co; c@d.co"));
  assert.ok(!ruleOk("receiptEmails", "a@b.co,c@d.co"));
  assert.ok(!ruleOk("incidentEmail", "a@b.co;"));
});

test("web pay: each cell computer needs a host name, and in-pay times are whole minutes", () => {
  const c = base("smart-web-pay").cellComputers![0];
  assert.match(errorsOf(base("smart-web-pay", { ...webPayFields, cellComputers: [{ ...c, hostName: "" }] })).cellComputers, /host name/);
  assert.ok(!ruleOk("inPayAfterEntry", "1.5"));
  assert.ok(ruleOk("shiftHandlingTime", "00:15"));
  assert.ok(ruleOk("shiftHandlingTime", "00:15:00"));
  assert.ok(!ruleOk("shiftHandlingTime", "15 min"));
});

test("web pay: the sheet's eight PSPs, each with its own fields and methods", () => {
  assert.deepEqual(PSP_DEFINITIONS.map((p) => p.id), ["fiserv", "planet", "trustcommerce", "nmi", "worldline", "ccv", "advam", "moneris"]);
  assert.deepEqual(pspDefinition("worldline")!.methods, ["creditcard", "bancontact", "TWINT", "bizum", "sepa", "iDEAL"]);
  assert.deepEqual(pspDefinition("moneris")!.fields.find((f) => f.key === "currency")!.options, ["CAD", "USD"]);
  assert.ok(pspDefinition("nmi")!.fields.filter((f) => f.secret).length === 3);
});

test("web pay: PSP secrets are required on submit, not in the browser", () => {
  const draft = base("smart-web-pay", webPayFields);
  assert.deepEqual(errorsOf(draft), {});
  assert.equal(errorsOf(draft, serverSchemas.onboardingDraftSchema).pspConfig, "NMI: API key is required");
  const withSecrets = { ...draft, pspConfig: { fields: { user: "u", apiKey: "k", tokenizationKey: "t", checkoutKey: "c" }, methods: ["creditcard"] } };
  assert.match(errorsOf(withSecrets, serverSchemas.onboardingDraftSchema).cellComputers, /password is required/);
  const cells = withSecrets.cellComputers!.map((c) => ({ ...c, uiPassword: "pw" }));
  assert.deepEqual(errorsOf({ ...withSecrets, cellComputers: cells }, serverSchemas.onboardingDraftSchema), {});
});

test("a credential the server holds counts as given in the browser", () => {
  const draft = base("smart-web-pay", { ...webPayFields, pspConfig: { fields: { user: "u" }, methods: ["creditcard"] } });
  const onFile = createOnboardingSchemas(undefined, {
    requireSecrets: true,
    secretsOnFile: ["pspConfig.fields.apiKey", "pspConfig.fields.tokenizationKey", "pspConfig.fields.checkoutKey", "cellComputers.k.uiPassword"],
  });
  assert.deepEqual(errorsOf(draft, onFile.onboardingDraftSchema), {});
  const partly = createOnboardingSchemas(undefined, { requireSecrets: true, secretsOnFile: ["pspConfig.fields.apiKey"] });
  assert.equal(errorsOf(draft, partly.onboardingDraftSchema).pspConfig, "NMI: Tokenization key for collect.js is required");
});

test("web pay: a payment method from another PSP doesn't count", () => {
  const draft = base("smart-web-pay", { ...webPayFields, pspConfig: { fields: { user: "u" }, methods: ["TWINT"] } });
  assert.equal(errorsOf(draft).pspConfig, "NMI: choose at least one payment method");
});

// ── entervo connect v3.0 ───────────────────────────────────────────────────
const connectFields: Partial<OnboardingForm> = {
  providerId: "101", salutation: "Ms", contactFirstname: "Ann", contactSurname: "Lee", contactEmail: "ann@x.co",
  contactPhone: "+44 1", adminUsername: "admin", adminEmail: "admin@x.co", adminName: "Ad Min",
};

test("connect: partner, contact person and administrator fields are required", () => {
  const errors = errorsOf(base("entervo-connect"));
  for (const key of Object.keys(connectFields)) assert.ok(errors[key], key);
  assert.deepEqual(errorsOf(base("entervo-connect", connectFields)), {});
});

test("connect: a cell computer needs no address, only its participant", () => {
  const c = base("entervo-connect").cellComputers![0];
  assert.deepEqual(errorsOf(base("entervo-connect", { ...connectFields, cellComputers: [{ ...c, ip: "", port: "" }] })), {});
  assert.match(errorsOf(base("entervo-connect", { ...connectFields, cellComputers: [{ ...c, uiUserId: "" }] })).cellComputers, /participant/);
});

test("connect: connect facilities need a carpark type, PA by default", () => {
  const f = base("entervo-connect").facilities![0];
  assert.match(errorsOf(base("entervo-connect", { ...connectFields, facilities: [{ ...f, carparkType: undefined }] })).facilities, /carpark type/);
  const migrated = normalizeDraft({ product: "entervo-connect", facilities: [{ ...f, carparkType: undefined }] });
  assert.equal(migrated.facilities![0].carparkType, "PA");
});

// ── several products at once ───────────────────────────────────────────────
test("a field two sheets require is reported once", () => {
  const issues = onboardingDraftSchema.safeParse(base("smart-web-pay,entervo-connect", { city: "" }));
  assert.equal(issues.success, false);
  if (!issues.success) assert.equal(issues.error.issues.filter((i) => i.path[0] === "city").length, 1);
});

test("legacy payment-method toggles carry over to the PSP form", () => {
  const migrated = normalizeDraft({ product: "smart-web-pay", pm_Visa: true, "pm_Apple Pay": true, pm_SEPA: false } as OnboardingForm);
  assert.deepEqual(migrated.pspConfig?.methods, ["visa", "applepay"]);
});
