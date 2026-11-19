# Onboarding sheets → Service Hub mapping

Sources (received 19 Nov 2026):

- `smart_validation_onboarding_request_v4.4_4.xlsm` — smart validation sheet v4.4
- `smart_web_pay_onboarding_request_v3.1.xlsm` — smart web pay sheet v3.1
- `entervo_connect_onboarding_request_v3.0.xlsm` — entervo connect sheet v3.0

Required (`*` in the sheet) is enforced in `packages/shared/src/productSheets.ts`
(`PRODUCT_REQUIRED_FIELDS`, `CELL_REQUIREMENTS`) and in `crossStepChecks`.
Formats are rules in `packages/shared/src/schemas/rules.ts`. PSP fields are in
`packages/shared/src/psp.ts`.

Legend for *Where*: **Op** = Step 01 Operator · **CC** = Step 02 Cell Computers
(per cell computer) · **Fac** = Step 03 Facilities (per facility) · **Tab** =
Step 04 Product Settings, that product's tab · **Gen** = generated, shown not
asked · **S&B** = filled in by S&B / PS ITOPS, not asked.

## Shared across the three sheets

| Sheet field | Where | Field | Rule |
|---|---|---|---|
| Operator ID * (all three) | Op | `opId` | exactly 5 digits (rule 17) |
| Operator name / Partner name * | Op | `opName` | required |
| Country * | Op | `country` | required |
| Currency ISO 4217 * (validation, connect) | Op | `currency` | ISO 4217 list |
| Language tag * (validation), Language (web pay) | Op | `lang` | required |
| City * (web pay location, connect) | Op | `city` | required with web pay or connect |

## smart validation v4.4

| Row | Sheet field | Where | Field |
|---|---|---|---|
| A4 | Tenant shortname * | Tab | `tenantShortname` — up to 20 lowercase letters (rule 43) |
| A5 | Tenant description * | Tab | `tenantDescription` |
| A10 | e-mail SUBtech * | Tab | `subtechEmail` |
| A11 | e-mail incident / maintenance | Tab | `incidentEmail` (`;`-list, rule 41) |
| A12 | show LPN in Report (not GDPR conform) | Tab | `showLpnInReport` toggle, default off |
| A15 | cell ID * | CC | `cellId` |
| A16 | cell computer name * | CC | `name` |
| A17–A19 | public cell IP / port / URL ** (IP + port **or** URL; URL has priority) | CC | `ip`, `port`, `url` — one of the two required |
| A20 | Username * (digits) | CC | `uiUserId` (rule 12) |
| A21 | Password * (max 9, no @ or spaces) | CC | `uiPassword` — write-only (rule 6) |
| A22 | LFK enabled | CC step | `lfk` toggle |
| A23 | Cashier Device * (default 799) | CC | `deviceId`, pre-filled 799 |
| A26 | facility ID *, facility name * | Fac | `id`, `name` |
| C26 | timezone * | Fac | `timezone` (IANA list), required where validation runs |
| D26 | mediatypes * (Barcode, LPN, Mobile-ID) | Fac | `mediaTypes`, at least one where validation runs |
| E26 | Location-ID (automatic) | Gen | `SB{cellId}.{facilityId}.0` — see note 1 |
| A49–A55 | URL, sender e-mail, SUBtech e-mail, OVAL Admin, CPI Admin, Kiosk URL | Gen | `validationGeneratedUrls()` |
| A52 | App ID (provided by PS ITOPS) | S&B | — |

## smart web pay v3.1

| Row | Sheet field | Where | Field |
|---|---|---|---|
| A4 | Location ID * (set by ITOPS) | S&B | — |
| A5 | City * | Op | `city` |
| A8–A9 | Operator ID *, Name * | Op | `opId`, `opName` |
| A10 | Description * | Tab | `opDescription` |
| A11 | Address | Op | `address` |
| A12 | Contact Us e-mail * (`;`, no spaces) | Tab | `contactUsEmails` (rule 46) |
| A13 | Incident e-mail * | Tab | `incidentEmail` (rule 41) |
| A14 | E-mail receipt * | Tab | `receiptEmails` (rule 47) |
| A15 | Phone | Op | `phone` |
| A18 | Logo (image ≥ 150 px high) | Tab | note: sent separately — see note 2 |
| A19 | Link * (terms of use) | Tab | `tocUrl` (rule 15) |
| A20–A21 | Country code *, City/Region * | Op | `country`, `city` |
| A22 | PGS location description * | Tab | `pgsLocationDescription` (also the merchant PSP reference, A38) |
| A23–A24 | Payment type *, Payment methods * | Tab | `psp` + `pspConfig.methods` |
| A28 | Cell Computer ID * | CC | `cellId` |
| A29 | Host name * (shown to customers) | CC | `hostName`, required with web pay |
| A30 | Applications (SWP) | — | fixed |
| A31–A33 | IP *, Port *, URL * (IP + port or URL) | CC | `ip`, `port`, `url` |
| A34–A35 | Username *, Password * | CC | `uiUserId`, `uiPassword` (write-only) |
| A36–A37 | LPR / Barcode supported * | CC step | `lpr`, `barcode` toggles |
| A39 | Device ID | CC | `deviceId` |
| A40–A41 | Cashier contract ID, cashier consumer ID | CC | `cashierContractId`, `cashierConsumerId` |
| A42–A43 | Shift ID, Shift number (automatic) | S&B | — |
| A44 | Tariff class (default 0) | Tab | `tariff` |
| A45 | Cell computer address (physical) | CC | `address` |
| A46 | Financial info | Tab | `financialInfo` |
| A47–A50 | Language, Currency, Decimal places * (default 2), VAT | Op | `lang`, `currency`, `decimals`, `vat` |
| A52 | LFK supported * | CC step | `lfk` |
| A54 | Prepayment supported * | Tab | `prepay` |
| A55 | Late payment supported * | Tab | `latePayment` |
| A56 | Shift handling time (00:15) | Tab | `shiftHandlingTime` (rule 48) |
| A57–A58 | In pay time after entry * / after payment * (min, default 0) | Tab | `inPayAfterEntry`, `inPayAfterPayment` (rules 49–50) |
| A59 | Show "In pay time" after payment * | Tab | `showInPayTime` |
| A60 | Service fee * (fixed / percentage / none) | Tab | `serviceFeeType` + `serviceFee` (rule 51) |
| A61 | Operator address (smart pay API) | Op | `address` |
| A63–A116 | Facilities: parent facility ID, facility ID *, name *, address *, city, in-pay times * | Fac | `parentId`, `id`, `name`, `address`, `city`, `inpayEntry`, `inpayPayment` — see note 3 |

### PSPs (web pay sheet, column F)

| PSP | Payment methods | Fields (🔒 = write-only secret) |
|---|---|---|
| Fiserv / Telecash | visa, mastercard, creditcard, sepa, paypal, applepay, googlepay | Store ID *, 🔒 API password *, 🔒 Shared secret value *, 🔒 Private key password *, 🔒 Private key API password, 🔒 Private key API secret, Key file (sent separately) |
| Planet | creditcard, paypal | Currency *, Merchant *, 🔒 Validation code *, Template version |
| TrustCommerce | creditcard | API ID *, 🔒 API password *, 🔒 License key * |
| NMI | creditcard | User *, 🔒 API key *, 🔒 Tokenization key for collect.js *, 🔒 Checkout key * |
| Worldline | creditcard, bancontact, TWINT, bizum, sepa, iDEAL | Currency *, PSP ID *, 🔒 API key *, 🔒 Secret API key * |
| CCV | creditcard, bancontact, iDEAL | Currency *, 🔒 API key * |
| Advam *(new)* | creditcard, applepay, googlepay | Currency *, Account number *, Username *, Client ID *, Signing key ID *, 🔒 Secret key * |
| Moneris *(new)* | creditcard | Currency (CAD \| USD) *, Store ID *, 🔒 API token *, Checkout payment ID *, Checkout tokenization ID * |

## entervo connect v3.0

| Row | Sheet field | Where | Field |
|---|---|---|---|
| A4 | Partner Name * | Op | `opName` (labelled "Operator / business partner name") |
| A5–A7 | Country *, City *, Currency * | Op | `country`, `city`, `currency` |
| A8 | provider ID * (> 100 operator, ≤ 100 authorisation provider) | Tab | `providerId` (rule 18) |
| A9 | Operator ID * | Op | `opId` |
| A12–A19 | Contact person: Salutation *, Title, Firstname *, Surname *, Street / Houseno., Postcode / City, E-Mail *, Phone * | Tab | `salutation`, `contactTitle`, `contactFirstname`, `contactSurname`, `contactStreet`, `contactCity`, `contactEmail`, `contactPhone` |
| A22–A25 | Administrator: Username *, E-Mail *, Name *, Phone | Tab | `adminUsername`, `adminEmail`, `adminName`, `adminPhone` |
| A28 | cell ID * | CC | `cellId` |
| A29 | Participant ID * (profile "Superuser S&B") | CC | `uiUserId` (labelled "Username / participant ID") |
| A30 | Password * | CC | `uiPassword` (write-only) |
| A33–A36 | Services: Online Authorization, Customer & Media, Counting, Device Control — YES/NO + provider | Tab | `onlineAuth`/`customerMedia`/`counting`/`deviceControl` + `…Provider` |
| A39, B39 | facility ID *, facility name * | Fac | `id`, `name` |
| C39 | Carpark Type * (MSCP / UGCP / PA = default) | Fac | `carparkType`, default PA, required where connect runs |
| D39–G39 | API-KEY, username, password (provided by PS ITOPS) | S&B | — |

## Removed from the wizard (not on the new sheets)

- SSH port (cell computer) — not on connect sheet v3.0. Kept in stored data.
- Onboarding notification e-mail and the single free-text "media types" field
  (validation) — media types are now per facility; old drafts are converted.
- Generic PSP fields (Merchant ID, Terminal ID, API key, API secret) and the
  fixed Visa/Mastercard/… toggles — replaced by each PSP's own fields and
  methods. Old toggles carry over to the new methods.
- Vouchers and top-up toggles (web pay) — not on sheet v3.1.

## Notes for S&B

1. **Location-ID formula in the validation sheet.** Column E is
   `"SB" & C15 & "." & A & ".0" & C12`. C12 is "show LPN in Report" (yes/no),
   so a facility gets an ID like `SB4438.1338.0no`. This looks like a row shift
   in v4.4; the Hub uses `SB4438.1338.0`. Please confirm.
2. **Files.** The web pay sheet asks for a logo and, for Fiserv/Telecash, a key
   file. The Hub doesn't take uploads yet; it says to send them separately and
   records the key file's name.
3. **Facility addresses (web pay).** The sheet has up to five extra facility
   blocks "only if different addresses are needed than cellcomputer". In the
   Hub every facility has an optional address and parent facility ID, with no
   limit on the number.
4. **Tenant shortname.** The sheet says "small letters only, no other
   characters", so digits are refused too. If digits should be allowed, it is
   a one-line change to rule 43.
