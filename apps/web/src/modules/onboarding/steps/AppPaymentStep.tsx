import { useState } from "react";
import { Field } from "../../../components/Field";
import { Toggle } from "../../../components/Toggle";
import { clickable } from "../../../components/clickable";
import { useStepFields } from "./useStepFields";
import { AsyncSection } from "../../../components/AsyncSection";
import { usePsps, useSecretsOnFile, useProducts } from "../../../queries";

export function AppPaymentStep() {
  const psps = usePsps();
  const productsQuery = useProducts();
  const secretsOnFile = useSecretsOnFile();
  const { values, input, toggle, choose, message } = useStepFields();

  const selectedStr = (values.product as string) || "smart-web-pay";
  const selectedList = selectedStr ? selectedStr.split(",").filter(Boolean) : ["smart-web-pay"];

  // Default active product tab to the first selected (starting) product
  const [activeTab, setActiveTab] = useState<string>(selectedList[0] || "smart-web-pay");


  const psp = values.psp;

  return (
    <div className="slide-in">
      {/* Multi-product tab header if more than 1 product selected */}
      {selectedList.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
              Multi-Product Configuration Batch ({selectedList.length} products)
            </span>
            <span style={{ fontSize: 12, color: "var(--gray-600)" }}>
              ⭐ Starting Product: <strong>{(productsQuery.data ?? []).find(p => p.id === selectedList[0])?.name || selectedList[0]}</strong>
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, borderBottom: "1.5px solid var(--gray-200)", paddingBottom: 8, overflowX: "auto" }}>
            {selectedList.map((prodId, idx) => {
              const pInfo = (productsQuery.data ?? []).find(p => p.id === prodId);
              const isActive = activeTab === prodId;
              const isFirst = idx === 0;

              return (
                <button
                  key={prodId}
                  type="button"
                  onClick={() => setActiveTab(prodId)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    border: `1.5px solid ${isActive ? pInfo?.color || "var(--blue)" : "var(--gray-300)"}`,
                    background: isActive ? pInfo?.bg || "var(--blue-pale)" : "white",
                    color: isActive ? pInfo?.color || "var(--blue)" : "var(--gray-600)",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 12.5,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                >
                  <span>{isFirst ? "⭐ 1st " : ""}</span>
                  <span>{pInfo?.name || prodId}</span>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 10, padding: "8px 12px", background: "var(--blue-pale)", borderRadius: 6, fontSize: 12, color: "var(--blue)" }}>
            ✨ <strong>Cross-Product Sync Active:</strong> Shared operator &amp; cell computer data is safely saved in the database. You only need to complete the product-specific settings for each tab below.
          </div>
        </div>
      )}

      {/* ─── TAB 1: SMART WEB PAY (default / primary mobile web pay) ─── */}
      {activeTab === "smart-web-pay" && (
        <div className="slide-in">
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>
            entervo smart web pay — App Features &amp; Payment Gateway
          </div>

          <div className="form-grid" style={{ marginBottom: 20 }}>
            <Field label="Financial Information" hint="Printed on the payment receipt" span2 error={message("financialInfo")}>
              <input {...input("financialInfo", "mono")} placeholder="e.g. 654929496" />
            </Field>
            <Field label="Terms & Conditions URL" error={message("tocUrl")}>
              <input {...input("tocUrl")} placeholder="https://…" />
            </Field>
            <Field label="Tariff Class ID" hint="0 = standard tariff (digits only)" error={message("tariff")}>
              <input {...input("tariff", "mono")} placeholder="0" />
            </Field>
          </div>

          <div style={{ marginBottom: 18, display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr 1fr" }}>
            <Toggle label="Vouchers" {...toggle("vouchers")} />
            <Toggle label="Prepayment" {...toggle("prepay")} />
            <Toggle label="Top-up" {...toggle("topup")} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div className="form-label" style={{ marginBottom: 10 }}>Payment Service Provider <span style={{ color: "var(--red)" }}>*</span></div>
            <AsyncSection query={psps} label="payment providers">
              {(list) => (
                <div className="psp-grid">
                  {list.map(p => (
                    <div key={p.id} className={`psp-card${psp === p.id ? " selected" : ""}`} {...clickable(() => choose("psp", p.id))}>
                      <div className="psp-name">{p.name}</div>
                      <div className="psp-tag">{p.tag}</div>
                    </div>
                  ))}
                </div>
              )}
            </AsyncSection>
            {message("psp") && <div className="error-msg" role="alert" style={{ marginTop: 8 }}>⚠ {message("psp")}</div>}
          </div>

          {psp && (
            <div className="slide-in" style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 8, padding: "18px 20px", marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 14 }}>
                {psps.data?.find(p => p.id === psp)?.name ?? psp} — Gateway Configuration
              </div>
              <div className="form-grid">
                <Field label="Merchant ID" required error={message("pspMid")}><input {...input("pspMid", "mono")} placeholder="MID-xxxxx" /></Field>
                <Field label="Terminal ID" error={message("pspTid")}><input {...input("pspTid", "mono")} placeholder="TID-xxxxx" /></Field>
                <Field
                  label="API Key / Client ID"
                  hint={secretsOnFile.includes("pspKey") ? "Stored in DB — type to replace" : undefined}>
                  <input {...input("pspKey", "mono")} placeholder={secretsOnFile.includes("pspKey") ? "•••••••• stored" : "••••••••••••"} type="password" autoComplete="off" />
                </Field>
                <Field
                  label="API Secret"
                  hint={secretsOnFile.includes("pspSecret") ? "Stored in DB — type to replace" : undefined}>
                  <input {...input("pspSecret", "mono")} placeholder={secretsOnFile.includes("pspSecret") ? "•••••••• stored" : "••••••••••••"} type="password" autoComplete="off" />
                </Field>
              </div>
              <div style={{ marginTop: 14, display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr" }}>
                {["Visa", "Mastercard", "Apple Pay", "Google Pay", "PayPal", "SEPA"].map(pm => (
                  <Toggle key={pm} label={pm} {...toggle(`pm_${pm}`)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: ENTERVO CONNECT ─── */}
      {activeTab === "entervo-connect" && (
        <div className="slide-in">
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🔗 entervo connect — Platform &amp; Integration Parameters</span>
          </div>

          <div className="form-grid" style={{ marginBottom: 18 }}>
            <Field label="Provider ID" hint="Unique number > 100 for car park operator (digits only)" error={message("providerId")}>
              <input {...input("providerId", "mono")} placeholder="e.g. 46722" />
            </Field>

            <Field label="Contact Person Email" error={message("contactEmail")}>
              <input {...input("contactEmail")} type="email" placeholder="stuart.hartman@parking-partners.co.uk" />
            </Field>

            <Field label="Technical Administrator Username" error={message("adminUsername")}>
              <input {...input("adminUsername")} placeholder="e.g. Stuart Chriscoli" />
            </Field>

            <Field label="Technical Administrator Email" error={message("adminEmail")}>
              <input {...input("adminEmail")} type="email" placeholder="admin@scheidt-bachmann.de" />
            </Field>

            <Field label="SSH Port" hint="Delivered by DevOps (1–65535)" error={message("sshPort")}>
              <input {...input("sshPort", "mono")} placeholder="e.g. 8443" />
            </Field>
          </div>

          <div style={{ padding: "14px 16px", background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>Active Services</div>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr" }}>
              <Toggle label="Online Authorization" sub="YES / NO - Provider" {...toggle("onlineAuth")} />
              <Toggle label="Customer & Media" sub="YES / NO - Provider" {...toggle("customerMedia")} />
              <Toggle label="Counting" sub="Smart CONTRACT" {...toggle("counting")} />
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: SMART VALIDATION ─── */}
      {activeTab === "smart-validation" && (
        <div className="slide-in">
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>
            ✅ entervo smart validation — Tenant &amp; Distribution Lists
          </div>

          <div className="form-grid" style={{ marginBottom: 18 }}>
            <Field label="Tenant Shortname" hint="Max 20 chars, small letters &amp; numbers only (URL slug)" error={message("tenantShortname")}>
              <input {...input("tenantShortname", "mono")} placeholder="e.g. medwayvalidation" />
            </Field>

            <Field label="Tenant Long Name / Description" error={message("tenantDescription")}>
              <input {...input("tenantDescription")} placeholder="e.g. Medway Hospital Staff & Visitor Validation" />
            </Field>

            <Field label="SUBTECH Admin Email" hint="For admin user to manage OVAL ADMIN" error={message("subtechEmail")}>
              <input {...input("subtechEmail")} type="email" placeholder="oval-admin@organisation.com" />
            </Field>

            <Field label="Maintenance & Incident Email" hint="Alerts for maintenance windows or incidents" error={message("incidentEmail")}>
              <input {...input("incidentEmail")} type="email" placeholder="alerts@organisation.com" />
            </Field>

            <Field label="Onboarding Notification Email" hint="Notifications during onboarding progress" error={message("onboardingEmail")}>
              <input {...input("onboardingEmail")} type="email" placeholder="onboarding-team@organisation.com" />
            </Field>

            <Field label="Supported Media Types" hint="e.g. Barcode, LPN, Mobile-ID" error={message("mediatypes")}>
              <input {...input("mediatypes")} placeholder="Barcode, LPN, Mobile-ID" />
            </Field>
          </div>
        </div>
      )}

      {/* ─── TAB 4: MOBILITY CONNECT ─── */}
      {activeTab === "mobility-connect" && (
        <div className="slide-in">
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>
            🚗 mobility CONNECT — Garage Architecture &amp; Mobility Provider
          </div>

          <div className="form-grid" style={{ marginBottom: 18 }}>
            <Field label="Height Limit (m)" hint="e.g. 2.10 (numbers only)" error={message("heightLimit")}>
              <input {...input("heightLimit", "mono")} placeholder="e.g. 2.10" />
            </Field>

            <Field label="Number of Parking Lots" hint="Total garage capacity (digits only)" error={message("parkingLots")}>
              <input {...input("parkingLots", "mono")} placeholder="e.g. 500" />
            </Field>

            <Field label="Electric Charging Stations" hint="Digits only" error={message("chargingStations")}>
              <input {...input("chargingStations", "mono")} placeholder="e.g. 16" />
            </Field>

            <Field label="Daily Maximum Price" hint="Numeric value" error={message("dailyMax")}>
              <input {...input("dailyMax", "mono")} placeholder="e.g. 25.00" />
            </Field>

            <Field label="Cost Center" error={message("costCenter")}>
              <input {...input("costCenter")} placeholder="e.g. CC-4019" />
            </Field>

            <Field label="Mobility Service Provider" hint="e.g. EasyPark, ParkMobile" error={message("mobilityProvider")}>
              <input {...input("mobilityProvider")} placeholder="e.g. EasyPark" />
            </Field>
          </div>

          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
            <Toggle label="Open 24/7" sub="Garage operates continuously" {...toggle("open247")} />
            <Toggle label="Access Outside Opening Hours" sub="Patron access enabled" {...toggle("accessOutsideHours")} />
          </div>
        </div>
      )}

      {/* ─── TAB 5: SMART SELECT (evopark smart select) ─── */}
      {activeTab === "smart-select" && (
        <div className="slide-in">
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>
            🎛️ entervo smart select — Webshop Portal &amp; Product Packages
          </div>

          <div className="form-grid" style={{ marginBottom: 18 }}>
            <Field label="Portal URL" hint="e.g. my-parkingportal.com/centralgarage" error={message("portalUrl")}>
              <input {...input("portalUrl")} placeholder="my-parkingportal.com/yourgarage" />
            </Field>

            <Field label="Project Name on Website" error={message("projectName")}>
              <input {...input("projectName")} placeholder="e.g. Central Garage Parking" />
            </Field>

            <Field label="Sender Email Address (DKIM)" error={message("senderEmail")}>
              <input {...input("senderEmail")} type="email" placeholder="contact@centralgarage.com" />
            </Field>

            <Field label="DKIM Domain" error={message("senderDomain")}>
              <input {...input("senderDomain")} placeholder="centralgarage.com" />
            </Field>

            <Field label="Brand Colors (Hex Code)" hint="e.g. #1A6FD4" error={message("brandColors")}>
              <input {...input("brandColors", "mono")} placeholder="#1A6FD4" />
            </Field>

            <Field label="Payment Type" error={message("paymentType")}>
              <select {...input("paymentType")}>
                <option value="Pay-as-you-go (encashment)">Pay-as-you-go (encashment - automatic)</option>
                <option value="Monthly (encashment)">Monthly (encashment - automatic)</option>
                <option value="Monthly (invoice)">Monthly (invoice)</option>
                <option value="Daily (encashment)">Daily (encashment)</option>
                <option value="No billing">No billing</option>
              </select>
            </Field>
          </div>

          <div style={{ padding: "14px 16px", background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 8, marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>Special Functions</div>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
              <Toggle label="Automatic Check-Out" sub="Check out after max duration" {...toggle("autoCheckout")} />
              <Toggle label="Boost Function" sub="Short-term entrance → smart select exit" {...toggle("boostFunction")} />
              <Toggle label="Product-Webshop" sub="Enable online parking pass webshop" {...toggle("productWebshop")} />
              <Toggle label="Auto Deactivation on Failed Payment" sub="Medium deactivated if charge fails" {...toggle("autoDeactivation")} />
            </div>
          </div>

          {/* Product Types from Excel */}
          <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>
              Configured Product Package (Sample: Contract Parker / Season Pass)
            </div>
            <div className="form-grid">
              <Field label="Product Name" error={message("contractProductName")}>
                <input {...input("contractProductName")} placeholder="e.g. Season Parker A" />
              </Field>
              <Field label="One-Time Fee" hint="Numeric value" error={message("contractOneTimeFee")}>
                <input {...input("contractOneTimeFee", "mono")} placeholder="0" />
              </Field>
              <Field label="Recurring Monthly Fee" hint="Numeric value" error={message("contractRecurringFee")}>
                <input {...input("contractRecurringFee", "mono")} placeholder="50" />
              </Field>
              <Field label="Minimum Lease Term (Months)" hint="Digits only" error={message("contractMinLeaseMonths")}>
                <input {...input("contractMinLeaseMonths", "mono")} placeholder="1" />
              </Field>
              <Field label="Notice Period (Months)" hint="Digits only" error={message("contractNoticePeriod")}>
                <input {...input("contractNoticePeriod", "mono")} placeholder="1" />
              </Field>
              <Field label="Max Bookings Available" hint="Digits only" error={message("contractMaxBookings")}>
                <input {...input("contractMaxBookings", "mono")} placeholder="200" />
              </Field>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
