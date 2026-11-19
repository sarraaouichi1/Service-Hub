/**
 * End-to-end check of the v1.1 onboarding flow in a real browser, written as
 * labelled PASS/FAIL assertions (see "Verifying" in CLAUDE.md).
 *
 *   node scripts/ui-check.cjs            # app running on :5173, freshly seeded
 *   BASE=http://localhost:8080 SHOTS=/tmp/shots node scripts/ui-check.cjs
 *
 * Needs Playwright with Chromium (`npm i -g playwright && npx playwright install chromium`,
 * or point PLAYWRIGHT_MODULE at an existing install). It submits a project and
 * creates a user, so run it against a demo database only.
 */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const BASE = process.env.BASE || "http://localhost:5173";
const SHOTS = process.env.SHOTS || "/tmp/ui-shots";
require("node:fs").mkdirSync(SHOTS, { recursive: true });
const PASSWORD = "ChangeMe123!dev";
let failed = 0;
const check = (label, ok, extra = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : "  " + extra}`); };
const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

  const login = async (email) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE}/`);
  };

  // ── Customer: saved draft is discoverable ────────────────────────────
  await login("customer@scheidt-bachmann.de");
  await page.goto(`${BASE}/onboarding/dashboard`);
  await page.waitForSelector(".resume-banner", { timeout: 8000 }).catch(() => {});
  check("dashboard shows the saved-draft banner", await page.isVisible(".resume-banner"));
  check("banner names the draft", (await page.textContent(".resume-banner"))?.includes("Medway Hospital"));
  check("customer sees the New onboarding button", await page.isVisible('text=New onboarding'));
  await shot(page, "01-dashboard-resume-banner");

  await page.goto(`${BASE}/onboarding/projects`);
  await page.waitForSelector(".draft-row");
  check("All projects lists the user's own draft", await page.isVisible(".draft-row"));

  await page.click('.sidebar-cta button');
  await page.waitForSelector("dialog.modal[open]");
  check("New onboarding asks resume or start fresh", (await page.textContent("dialog.modal"))?.includes("You have a saved draft"));
  await shot(page, "02-resume-or-start-fresh");

  await page.click('dialog.modal >> text=Resume draft');
  await page.waitForURL(/wizard\/0/);
  await page.click(".wizard-step-item >> nth=2");
  await page.waitForSelector(".row-card");
  check("resuming loads the draft's two cell computers", (await page.locator(".row-card").count()) === 2);

  // Start fresh instead
  await page.click('.sidebar-cta button');
  await page.waitForSelector("dialog.modal[open]");
  await page.click('dialog.modal >> text=Start fresh');
  await page.waitForURL(/wizard\/0/);
  await page.waitForTimeout(600);

  // ── Step 00: Validation only ─────────────────────────────────────────
  await page.click('text=entervo smart validation');
  await page.click('button:has-text("Continue")');
  await page.waitForURL(/wizard\/1/);

  // ── Step 01: operator + locale ───────────────────────────────────────
  await page.fill('input[name="opName"]', "Central Garage Ltd");
  await page.fill('input[name="opEmail"]', "ops@centralgarage.example");
  await page.fill('input[name="opId"]', "4321");
  await page.locator("select").first().selectOption("GB");
  await page.click('button:has-text("Continue")');
  check("validation needs a 5-digit operator ID", (await page.textContent("body")).includes("Operator ID must be exactly 5 digits"));
  await page.fill('input[name="opId"]', "54321");
  check("operator step has no IP field any more", (await page.locator('input[name="ip"]').count()) === 0);
  const countrySelect = page.locator("select").first();
  await countrySelect.selectOption("GB");
  await page.waitForTimeout(300);
  check("choosing a country fills the language from the template", (await page.locator('select[name="lang"]').inputValue()) === "en-GB");
  await shot(page, "03-operator-locale");
  await page.click('button:has-text("Continue")');
  await page.waitForURL(/wizard\/2/);

  // ── Step 02: two cell computers ──────────────────────────────────────
  await page.click('button:has-text("Continue")');
  check("cannot continue without a cell computer", (await page.textContent(".wizard-footer"))?.includes("required fields"));
  check("and the list says why", await page.isVisible("text=Add at least one cell computer"));
  await page.click('button:has-text("Add cell computer")');
  await page.click('button:has-text("Add cell computer")');
  await page.fill('input[name="cellComputers.0.name"]', "CC-North");
  await page.fill('input[name="cellComputers.0.cellId"]', "4438");
  await page.fill('input[name="cellComputers.0.ip"]', "195.171.142.1");
  await page.fill('input[name="cellComputers.0.port"]', "8443");
  await page.fill('input[name="cellComputers.0.uiUserId"]', "42");
  await page.fill('input[name="cellComputers.0.uiPassword"]', "secret1");
  check("validation pre-fills the cashier device 799", (await page.inputValue('input[name="cellComputers.0.deviceId"]')) === "799");
  check("the SSH port is gone (not on the connect sheet)", (await page.locator('input[name="cellComputers.0.sshPort"]').count()) === 0);
  await page.fill('input[name="cellComputers.1.name"]', "CC-South");
  await page.fill('input[name="cellComputers.1.cellId"]', "4442");
  await page.fill('input[name="cellComputers.1.ip"]', "999.1.1.1");
  await page.fill('input[name="cellComputers.1.uiUserId"]', "43");
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  check("a bad IP on the second cell computer is named", (await page.textContent("body"))?.includes("CC-South — Static public IP: Must be a valid IPv4 address"));
  await page.fill('input[name="cellComputers.1.ip"]', "195.171.142.2");
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  check("an IP without a port is not enough", (await page.textContent("body")).includes("CC-South: enter its public IP and port, or a URL"));
  await page.fill('input[name="cellComputers.1.port"]', "8443");
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  check("a missing password is caught on this step, not at submission", (await page.textContent("body")).includes("CC-South: the password is required"));
  await page.fill('input[name="cellComputers.1.uiPassword"]', "secret2");
  await shot(page, "04-cell-computers");
  await page.click('button:has-text("Continue")');
  await page.waitForURL(/wizard\/3/);

  // ── Step 03: facilities ──────────────────────────────────────────────
  await page.click('button:has-text("Add facility")');
  await page.click('button:has-text("Add facility")');
  await page.fill('input[name="facilities.0.id"]', "1338");
  await page.fill('input[name="facilities.0.name"]', "Level 1 – Public");
  await page.fill('input[name="facilities.1.id"]', "1339");
  await page.fill('input[name="facilities.1.name"]', "Staff deck");
  const options = await page.locator('select[name="facilities.0.cellComputer"] option').allTextContents();
  check("facility dropdown lists both cell computers", options.some(o => o.includes("CC-North")) && options.some(o => o.includes("CC-South")));
  await page.selectOption('select[name="facilities.0.cellComputer"]', { label: "CC-North — 195.171.142.1" });
  await page.selectOption('select[name="facilities.1.cellComputer"]', { label: "CC-South — 195.171.142.2" });
  const chip0 = page.locator(".row-card >> nth=0").locator(".service-chip");
  check("with one product, the service is pre-selected", (await chip0.first().getAttribute("class"))?.includes("selected"));
  await page.locator(".row-card >> nth=1").locator(".service-chip input").first().uncheck();
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  check("a facility without services is refused", (await page.textContent("body"))?.includes("Facility 2: select at least one service"));
  await page.locator(".row-card >> nth=1").locator(".service-chip input").first().check();
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  check("a validation facility needs its time zone", (await page.textContent("body")).includes("Facility 1: choose its time zone"));
  check("and shows its generated Location-ID", (await page.inputValue('input[aria-label="Location-ID (generated)"] >> nth=0')) === "SB4438.1338.0");
  for (const n of [0, 1]) {
    await page.selectOption(`select[name="facilities.${n}.timezone"]`, "Europe/London");
    await page.locator(".row-card >> nth=" + n).locator('[role="group"][aria-label^="Media types"] input').first().check();
  }
  await shot(page, "05-facilities");
  await page.click('button:has-text("Continue")');
  await page.waitForURL(/wizard\/4/);

  // ── Step 04: no PSP for Validation ───────────────────────────────────
  check("Validation-only explains that no PSP is needed", await page.isVisible("text=No payment service provider is needed"));
  check("no PSP cards are shown", (await page.locator(".psp-card").count()) === 0);
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  check("the validation sheet's tenant fields are required", (await page.textContent("body")).includes("Tenant shortname is required"));
  await page.fill('input[name="tenantShortname"]', "central-garage");
  await page.fill('input[name="tenantDescription"]', "Central Garage visitor validation");
  await page.fill('input[name="subtechEmail"]', "it@centralgarage.example");
  await page.locator('input[name="tenantShortname"]').blur();
  await page.waitForTimeout(200);
  check("the tenant shortname is lowercase letters only", (await page.textContent("body")).includes("Use up to 20 lowercase letters only"));
  await page.fill('input[name="tenantShortname"]', "centralgarage");
  await page.waitForTimeout(200);
  check("the generated URLs appear", (await page.textContent("body")).includes("https://smartvalidation-kiosk.prod.parking-core.scheidt-bachmann.net/centralgarage/login"));
  await shot(page, "06-validation-settings");
  await page.click('button:has-text("Continue")');
  await page.waitForURL(/wizard\/5/);
  check("continues without a PSP", true);

  // ── Step 05: delivery check ──────────────────────────────────────────
  await page.fill('input[type="date"]', "2028-06-30");
  await page.click('button:has-text("Simulate approval")');
  await page.click('button:has-text("Continue")');
  await page.waitForURL(/wizard\/6/);

  // ── Step 06: one-page review with copy ───────────────────────────────
  check("review shows the configuration view", await page.isVisible(".config-view"));
  const reviewText = await page.textContent(".config-view");
  check("review lists both cell computers", reviewText.includes("CC-North") && reviewText.includes("CC-South"));
  check("review shows each facility's cell computer", reviewText.includes("Staff deck") && reviewText.includes("Cell computer"));
  check("review has no PSP section for Validation", !reviewText.includes("Payment service provider"));
  check("review shows the generated validation URLs", reviewText.includes("smartvalidation-centralgarage@scheidt-bachmann.net"));
  await page.click('button:has-text("Copy JSON")');
  const json = await page.evaluate(() => navigator.clipboard.readText());
  check("Copy JSON puts the configuration on the clipboard", json.includes("\"cellComputers\""));
  check("and the typed UI password is not in it", !json.includes("secret1"));
  await shot(page, "07-review-one-page");
  await page.click('.declaration input[type="checkbox"]');
  await page.click('button:has-text("Submit for Review")');
  await page.waitForSelector("text=Submitted for Review");
  check("a customer can submit the onboarding", true);

  // ── Configuration page from All projects ─────────────────────────────
  await page.goto(`${BASE}/onboarding/projects`);
  await page.waitForSelector("text=Central Garage Ltd");
  check("the draft row is gone after submitting", (await page.locator(".draft-row").count()) === 0);
  await page.click("text=Central Garage Ltd");
  await page.waitForURL(/configuration/);
  await page.waitForSelector(".config-view");
  await page.click('button:has-text("Copy configuration")');
  const text = await page.evaluate(() => navigator.clipboard.readText());
  check("Copy configuration gives readable text", text.includes("## Cell computers (2)") && text.includes("CC-South"));
  await page.click('.config-section-head >> nth=1');
  check("sections collapse", (await page.locator(".config-section.open").count()) < (await page.locator(".config-section").count()));
  await shot(page, "08-project-configuration");

  // ── All three mapped products at once, as a project manager ──────────
  await page.click('button[aria-label^="Account menu"]');
  await page.click("text=Sign out");
  await page.waitForURL(/login/);
  await login("manager@scheidt-bachmann.de");
  await page.goto(`${BASE}/onboarding/dashboard`);
  await page.click('.sidebar-cta button');
  if (await page.isVisible("dialog.modal[open]").catch(() => false)) await page.click('dialog.modal >> text=Start fresh');
  await page.waitForURL(/wizard\/0/);
  await page.waitForTimeout(500);
  for (const name of ["entervo smart web pay", "entervo connect", "entervo smart validation"]) await page.click(`text=${name}`);
  await page.click('button:has-text("Continue")');
  await page.waitForURL(/wizard\/1/);
  await page.fill('input[name="opName"]', "Harbour Parking BV");
  await page.fill('input[name="opEmail"]', "ops@harbour.example");
  await page.fill('input[name="opId"]', "77001");
  await page.locator("select").first().selectOption("NL");
  await page.waitForTimeout(300);
  await page.selectOption('select[name="lang"]', "nl-NL");
  await page.selectOption('select[name="currency"]', "EUR");
  await page.fill('input[name="decimals"]', "2");
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  check("web pay and connect make the city required", (await page.textContent("body")).includes("City is required"));
  await page.fill('input[name="city"]', "Rotterdam");
  await page.click('button:has-text("Continue")');
  await page.waitForURL(/wizard\/2/);

  await page.click('button:has-text("Add cell computer")');
  await page.fill('input[name="cellComputers.0.name"]', "CC-Harbour");
  await page.fill('input[name="cellComputers.0.cellId"]', "7020");
  await page.fill('input[name="cellComputers.0.url"]', "harbour-cc.example.com");
  await page.fill('input[name="cellComputers.0.uiUserId"]', "1234567890");
  await page.fill('input[name="cellComputers.0.uiPassword"]', "pw12345");
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  check("web pay needs the host name shown to customers", (await page.textContent("body")).includes("the host name shown to customers is required"));
  await page.fill('input[name="cellComputers.0.hostName"]', "Harbour Garage");
  await shot(page, "14-three-products-cell");
  await page.click('button:has-text("Continue")');
  await page.waitForURL(/wizard\/3/);
  check("a URL alone is enough to reach the cell computer", true);

  await page.click('button:has-text("Add facility")');
  await page.fill('input[name="facilities.0.id"]', "2001");
  await page.fill('input[name="facilities.0.name"]', "Harbour P1");
  const chips = page.locator(".row-card >> nth=0").locator('[aria-label^="Services at facility"] input');
  for (let n = 0; n < 3; n++) await chips.nth(n).check();
  check("connect facilities default to carpark type PA", (await page.inputValue('select[name="facilities.0.carparkType"]')) === "PA");
  await page.selectOption('select[name="facilities.0.timezone"]', "Europe/Amsterdam");
  await page.locator('[role="group"][aria-label^="Media types"] input').nth(1).check();
  await page.fill('input[name="facilities.0.address"]', "Kade 1, Rotterdam");
  await shot(page, "15-three-products-facility");
  await page.click('button:has-text("Continue")');
  await page.waitForURL(/wizard\/4/);

  check("one tab per product", (await page.locator(".product-tab").count()) === 3);
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  check("tabs with missing fields are marked", (await page.locator(".product-tab-dot").count()) === 3);
  // web pay
  await page.click('.product-tab:has-text("smart web pay")');
  await page.fill('input[name="opDescription"]', "Harbour Parking car parks");
  await page.fill('input[name="contactUsEmails"]', "info@harbour.example; help@harbour.example");
  await page.locator('input[name="contactUsEmails"]').blur();
  await page.waitForTimeout(200);
  check("e-mail lists must not contain spaces", (await page.textContent("body")).includes("separated by semicolons, without spaces"));
  await page.fill('input[name="contactUsEmails"]', "info@harbour.example;help@harbour.example");
  await page.fill('input[name="incidentEmail"]', "it@harbour.example");
  await page.fill('input[name="receiptEmails"]', "finance@harbour.example");
  await page.fill('input[name="tocUrl"]', "https://harbour.example/terms");
  await page.fill('input[name="pgsLocationDescription"]', "Harbour Parking Rotterdam");
  await page.fill('input[name="inPayAfterEntry"]', "0");
  await page.fill('input[name="inPayAfterPayment"]', "15");
  await page.fill('input[name="shiftHandlingTime"]', "00:15");
  await page.selectOption('select[name="serviceFeeType"]', "percentage");
  await page.fill('input[aria-label="Service fee amount"]', "2.5");
  check("eight PSPs are offered", (await page.locator(".psp-card").count()) === 8);
  await page.click('.psp-card:has-text("Worldline")');
  const wlText = await page.textContent(".product-panel");
  check("Worldline shows its own fields", ["PSP ID", "API key", "Secret API key"].every(t => wlText.includes(t)));
  check("and its own payment methods", ["Bancontact", "TWINT", "Bizum", "iDEAL"].every(t => wlText.includes(t)));
  await page.fill('input[name="pspConfig.fields.currency"]', "EUR");
  await page.fill('input[name="pspConfig.fields.pspId"]', "WL-778");
  await page.fill('input[name="pspConfig.fields.apiKey"]', "wl-key");
  await page.fill('input[name="pspConfig.fields.secretApiKey"]', "wl-secret");
  await page.locator('.product-panel label:has-text("iDEAL") input').check();
  await shot(page, "16-web-pay-worldline");
  // connect
  await page.click('.product-tab:has-text("entervo connect")');
  await page.fill('input[name="providerId"]', "101");
  await page.selectOption('select[name="salutation"]', "Ms");
  await page.fill('input[name="contactFirstname"]', "Eva");
  await page.fill('input[name="contactSurname"]', "de Vries");
  await page.fill('input[name="contactEmail"]', "eva@harbour.example");
  await page.fill('input[name="contactPhone"]', "+31 10 000 0000");
  await page.fill('input[name="adminUsername"]', "harbour-admin");
  await page.fill('input[name="adminName"]', "Jan Bakker");
  await page.fill('input[name="adminEmail"]', "jan@harbour.example");
  // Leave the last field first: its "required" message clearing on blur moves
  // the page, and a click mid-move lands on nothing.
  await page.locator('input[name="adminEmail"]').blur();
  await page.waitForTimeout(200);
  await page.locator('.connect-service:has-text("Counting") button.toggle').click();
  await page.fill('input[aria-label="Counting provider"]', "ParkCount");
  await shot(page, "17-connect-settings");
  // validation
  await page.click('.product-tab:has-text("smart validation")');
  await page.fill('input[name="tenantShortname"]', "harbour");
  await page.fill('input[name="tenantDescription"]', "Harbour Parking validation");
  await page.fill('input[name="subtechEmail"]', "it@harbour.example");
  await page.click('button:has-text("Continue")');
  await page.waitForURL(/wizard\/5/);
  check("all three product tabs complete", true);
  await page.fill('input[type="date"]', "2028-06-30");
  await page.click('button:has-text("Simulate approval")');
  await page.click('button:has-text("Continue")');
  await page.waitForURL(/wizard\/6/);
  const review3 = await page.textContent(".config-view");
  check("review shows the Worldline PSP without its secrets", review3.includes("Worldline") && review3.includes("WL-778") && !review3.includes("wl-secret"));
  check("review shows the connect services", review3.includes("Yes — provider: ParkCount"));
  await page.click('button:has-text("Copy JSON")');
  const json3 = await page.evaluate(() => navigator.clipboard.readText());
  check("Copy JSON leaves PSP secrets and passwords out", !json3.includes("wl-secret") && !json3.includes("wl-key") && !json3.includes("pw12345"));
  await page.click('.declaration input[type="checkbox"]');
  await page.click('button:has-text("Submit for Review")');
  await page.waitForSelector("text=Submitted for Review", { timeout: 10000 }).catch(() => {});
  check("an onboarding with all three products submits", await page.isVisible("text=Submitted for Review"));

  // ── Layout: half screen, collapsed sidebar, dark mode ────────────────
  await page.setViewportSize({ width: 720, height: 900 });
  await page.goto(`${BASE}/onboarding/projects`);
  await page.waitForSelector(".sidebar");
  await page.evaluate(() => localStorage.removeItem("service-hub-sidebar-collapsed"));
  await page.reload();
  await page.waitForSelector(".sidebar");
  check("a half-screen window starts with the sidebar collapsed", (await page.getAttribute(".sidebar", "class")).includes("collapsed"));
  const sw = await page.evaluate(() => { const c = document.querySelector(".content"); return { scroll: c.scrollWidth, client: c.clientWidth, x: getComputedStyle(c).overflowX }; });
  check("wide content scrolls sideways instead of being cut off", sw.x === "auto");
  await shot(page, "09-half-screen-collapsed");
  await page.click(".sidebar-toggle");
  check("the sidebar can be expanded again", !(await page.getAttribute(".sidebar", "class")).includes("collapsed"));
  await page.click(".sidebar-toggle");
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.click('button[aria-label^="Theme"]');
  await page.click('role=menuitemradio[name="Dark"]');
  check("dark mode applies", (await page.getAttribute("html", "data-theme")) === "dark");
  await page.goto(`${BASE}/onboarding/dashboard`);
  check("dark mode survives a reload", (await page.getAttribute("html", "data-theme")) === "dark");
  const bg = await page.evaluate(() => getComputedStyle(document.querySelector(".content")).backgroundColor + "|" + getComputedStyle(document.querySelector(".sidebar")).backgroundColor);
  check("surfaces are dark", !bg.includes("255, 255, 255"), bg);
  await page.waitForTimeout(1500);
  await shot(page, "10-dark-dashboard");
  await page.goto(`${BASE}/onboarding/wizard/3`);
  await page.waitForTimeout(800);
  await shot(page, "11-dark-wizard");
  await page.click('button[aria-label^="Theme"]');
  await page.click('role=menuitemradio[name="Light"]');

  // ── Admin: invitation link and activation ────────────────────────────
  await page.click('button[aria-label^="Account menu"]');
  await page.click("text=Sign out");
  await page.waitForURL(/login/);
  await login("admin@scheidt-bachmann.de");
  await page.goto(`${BASE}/onboarding/admin/users`);
  await page.click('button:has-text("Invite User")');
  await page.fill('input[placeholder="e.g. Anna Schmidt"]', "Ola Operator");
  await page.fill('input[placeholder="anna@company.com"]', "ola.operator@example.com");
  await page.click('button:has-text("Create user")');
  await page.waitForSelector("dialog.modal[open]");
  const link = await page.inputValue('dialog.modal input[aria-label="Activation link"]');
  check("creating a user shows a copyable activation link", link.startsWith(`${BASE}/activate?token=`));
  await shot(page, "12-invitation-link");
  await page.click('dialog.modal >> text=Done');

  const guest = await (await browser.newContext()).newPage();
  await guest.goto(link);
  await guest.waitForSelector("text=Choose a password");
  await guest.fill('input[name="password"]', "Welcome-to-hub1");
  await guest.fill('input[name="confirm"]', "Welcome-to-hub1");
  await shot(guest, "13-activate-account");
  await guest.click('button:has-text("Activate account")');
  await guest.waitForSelector("text=Your account is active");
  check("the invited person activates their account", true);
  await guest.goto(`${BASE}/login`);
  await guest.fill('input[type="email"]', "ola.operator@example.com");
  await guest.fill('input[type="password"]', "Welcome-to-hub1");
  await guest.click('button[type="submit"]');
  await guest.waitForURL(`${BASE}/`);
  check("and signs in with the password they chose", true);

  const real = errors.filter(e => !e.includes("401") && !e.includes("Failed to load resource"));
  check("no errors in the browser console", real.length === 0, real.slice(0, 3).join(" | "));
  await browser.close();
  console.log(failed === 0 ? "\nALL PASS" : `\n${failed} FAILED`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error("CRASH", e.message); process.exit(2); });
