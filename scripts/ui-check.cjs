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
  await page.fill('input[name="cellComputers.0.uiPassword"]', "secret1");
  await page.fill('input[name="cellComputers.1.name"]', "CC-South");
  await page.fill('input[name="cellComputers.1.cellId"]', "4442");
  await page.fill('input[name="cellComputers.1.ip"]', "999.1.1.1");
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  check("a bad IP on the second cell computer is named", (await page.textContent("body"))?.includes("CC-South — Static public IP: Must be a valid IPv4 address"));
  await page.fill('input[name="cellComputers.1.ip"]', "195.171.142.2");
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
  await shot(page, "05-facilities");
  await page.click('button:has-text("Continue")');
  await page.waitForURL(/wizard\/4/);

  // ── Step 04: no PSP for Validation ───────────────────────────────────
  check("Validation-only explains that no PSP is needed", await page.isVisible("text=No payment service provider is needed"));
  check("no PSP cards are shown", (await page.locator(".psp-card").count()) === 0);
  await shot(page, "06-no-psp-for-validation");
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
