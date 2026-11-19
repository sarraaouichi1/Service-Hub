/**
 * Unit tests for the rules both sides share. These run without a server or a
 * database: the wizard and the API import exactly these functions, so testing
 * them here tests what both of them enforce.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createOnboardingSchemas, needsPaymentProvider, normalizeDraft, parseProducts,
  permissionsFor, ROLE_PERMISSIONS,
} from "../src/index.js";
import type { OnboardingForm } from "../src/index.js";

const cell = (over: Record<string, string> = {}) => ({
  key: "k1", name: "CC-01", cellId: "100", url: "", ip: "10.0.0.1", port: "8443",
  uiUserId: "", uiPassword: "", deviceId: "", sshPort: "", ...over,
});

const complete = (over: Partial<OnboardingForm> = {}): OnboardingForm => ({
  product: "smart-validation",
  opName: "Operator", opEmail: "ops@example.com", country: "GB", lang: "en-GB",
  cellComputers: [cell()],
  facilities: [{ id: "1", name: "P1", city: "", inpayEntry: "", inpayPayment: "", cellComputer: "k1", services: ["smart-validation"] }],
  contractDate: "2099-01-01", salesApproved: true,
  ...over,
});

const { onboardingDraftSchema, validateStep, fieldsForStep } = createOnboardingSchemas();
const errorsOf = (draft: OnboardingForm) => {
  const result = onboardingDraftSchema.safeParse(draft);
  if (result.success) return {};
  return Object.fromEntries(result.error.issues.map((i) => [String(i.path[0]), i.message]));
};

test("a complete Validation-only draft passes without a PSP", () => {
  assert.deepEqual(errorsOf(complete()), {});
});

test("a web pay draft needs a PSP, then a merchant ID", () => {
  const webPay = complete({ product: "smart-web-pay", facilities: [{ ...complete().facilities![0], services: ["smart-web-pay"] }] });
  assert.equal(errorsOf(webPay).psp, "Select a payment service provider");
  assert.equal(errorsOf({ ...webPay, psp: "fiserv" }).pspMid, "Merchant ID is required");
  assert.deepEqual(errorsOf({ ...webPay, psp: "fiserv", pspMid: "M1" }), {});
});

test("the PSP check runs alongside other errors, not after them", () => {
  const errors = errorsOf(complete({ product: "smart-web-pay", opName: "", facilities: [] }));
  assert.ok(errors.psp, "psp reported");
  assert.ok(errors.opName, "operator name reported");
});

test("only payment products need a PSP", () => {
  assert.equal(needsPaymentProvider(["smart-validation", "entervo-connect"]), false);
  assert.equal(needsPaymentProvider(["smart-validation", "smart-web-pay"]), true);
});

test("an operator can have several cell computers, each checked on its own", () => {
  const two = complete({ cellComputers: [cell(), cell({ key: "k2", name: "CC-02", cellId: "101", ip: "10.0.0.2" })] });
  assert.deepEqual(errorsOf(two), {});
  const badSecond = complete({ cellComputers: [cell(), cell({ key: "k2", name: "CC-02", cellId: "101", ip: "300.0.0.1" })] });
  assert.equal(errorsOf(badSecond).cellComputers, "CC-02 — Static public IP: Must be a valid IPv4 address");
});

test("cell computers need a name, a numeric ID and an IP, and IDs are unique", () => {
  assert.match(errorsOf(complete({ cellComputers: [] })).cellComputers, /at least one/);
  assert.match(errorsOf(complete({ cellComputers: [cell({ name: "" })] })).cellComputers, /name is required/);
  assert.match(errorsOf(complete({ cellComputers: [cell({ cellId: "" })] })).cellComputers, /Cell computer ID is required/);
  assert.match(errorsOf(complete({ cellComputers: [cell({ ip: "" })] })).cellComputers, /Static public IP is required/);
  assert.match(errorsOf(complete({ cellComputers: [cell({ port: "99999" })] })).cellComputers, /Port/);
  assert.match(errorsOf(complete({ cellComputers: [cell(), cell({ key: "k2", name: "CC-02" })] })).cellComputers, /used twice/);
});

test("a facility must point at an existing cell computer and name its services", () => {
  const base = complete().facilities![0];
  assert.match(errorsOf(complete({ facilities: [{ ...base, cellComputer: "" }] })).facilities, /choose the cell computer/);
  assert.match(errorsOf(complete({ facilities: [{ ...base, cellComputer: "gone" }] })).facilities, /was removed/);
  assert.match(errorsOf(complete({ facilities: [{ ...base, services: [] }] })).facilities, /at least one service/);
  assert.match(errorsOf(complete({ facilities: [{ ...base, services: ["smart-web-pay"] }] })).facilities, /not one of the selected products/);
});

test("locale now lives on the operator step; connection details on the cell computer step", () => {
  assert.ok(fieldsForStep(1).includes("country"));
  assert.ok(fieldsForStep(1).includes("lang"));
  assert.ok(!fieldsForStep(1).includes("ip" as never));
  assert.deepEqual(fieldsForStep(2), ["cellComputers"]);
  assert.equal(validateStep(1, { opName: "x", opEmail: "a@b.co" }).country, "Country is required");
});

test("an administrator switching the IP rule off stops it applying to cell computers", () => {
  const relaxed = createOnboardingSchemas({ 1: { active: false } });
  const result = relaxed.onboardingDraftSchema.safeParse(complete({ cellComputers: [cell({ ip: "not-an-ip" })] }));
  assert.equal(result.success, true);
});

test("a legacy single-cell draft is converted, and conversion is idempotent", () => {
  const legacy = {
    product: "smart-web-pay,smart-validation", ip: "1.2.3.4", port: "8443", cellId: "9", domain: "cc.example.com",
    facilities: [{ id: "1", name: "P", city: "", inpayEntry: 0, inpayPayment: 0 }],
  } as OnboardingForm;
  const once = normalizeDraft(legacy);
  assert.equal(once.cellComputers?.length, 1);
  assert.equal(once.cellComputers?.[0].url, "cc.example.com");
  assert.equal((once as Record<string, unknown>).ip, undefined);
  assert.equal(once.facilities?.[0].cellComputer, once.cellComputers?.[0].key);
  assert.deepEqual(once.facilities?.[0].services, ["smart-web-pay", "smart-validation"]);
  assert.deepEqual(normalizeDraft(once), once);
});

test("a new-shape draft is left alone", () => {
  const draft = complete();
  assert.deepEqual(normalizeDraft(draft), draft);
  assert.deepEqual(normalizeDraft(null), {});
});

test("product parsing tolerates blanks and spaces", () => {
  assert.deepEqual(parseProducts(" smart-web-pay, ,smart-validation "), ["smart-web-pay", "smart-validation"]);
  assert.deepEqual(parseProducts(undefined), []);
});

test("customers can submit onboarding but not approve, deploy or read every project", () => {
  const customer = permissionsFor(["Customer"]);
  for (const p of ["project:create", "project:update", "project:submit"] as const) assert.ok(customer.includes(p), p);
  for (const p of ["payment:confirm", "project:deploy", "project:approve", "project:read-any", "user:read"] as const) {
    assert.ok(!customer.includes(p), p);
  }
  assert.ok(!ROLE_PERMISSIONS.Partner.includes("project:read-any"));
  assert.ok(ROLE_PERMISSIONS.Sales.includes("project:read-any"));
});
