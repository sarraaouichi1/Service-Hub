import { useState } from "react";
import { PAYMENT_PRODUCTS, PRODUCT_REQUIRED_FIELDS, needsPaymentProvider, parseProducts } from "@service-hub/shared";
import type { ProductId } from "@service-hub/shared";
import { Icon } from "../../../components/Icon";
import { Field } from "../../../components/Field";
import { Toggle } from "../../../components/Toggle";
import { useStepFields } from "./useStepFields";
import { useProducts } from "../../../queries";
import { ValidationSettings } from "./products/ValidationSettings";
import { WebPaySettings } from "./products/WebPaySettings";
import { ConnectSettings } from "./products/ConnectSettings";

/**
 * Step 04: one tab per selected product, holding what that product's
 * onboarding sheet asks beyond the shared operator, cell computer and facility
 * data. smart validation, smart web pay and entervo connect follow their
 * current sheets (v4.4, v3.1, v3.0); mobility CONNECT and smart select keep
 * their earlier fields until their sheets are mapped.
 */
export function AppPaymentStep() {
  const productsQuery = useProducts();
  const { values, input, toggle, message } = useStepFields();

  const selectedList = parseProducts(values.product);
  const productName = (id: string) => (productsQuery.data ?? []).find(p => p.id === id)?.name ?? id;
  const productNames = (ids: readonly string[]) => ids.map(productName).join(", ");

  // Default to the first selected (starting) product.
  const [activeTab, setActiveTab] = useState<string>(selectedList[0] ?? "");

  // A tab whose required fields are still reporting errors gets a marker, so a
  // problem in a tab the user isn't looking at is not invisible.
  const tabHasError = (id: string) =>
    (PRODUCT_REQUIRED_FIELDS[id as ProductId] ?? []).some(f => message(f.key)) ||
    (id === "smart-web-pay" && Boolean(message("psp") || message("pspConfig")));

  return (
    <div className="slide-in">
      {selectedList.length > 0 && !needsPaymentProvider(selectedList) && (
        <div className="notif-bar info">
          <Icon name="info" size={14} />
          No payment service provider is needed: {productNames(selectedList)} {selectedList.length === 1 ? "does" : "do"} not take payments.
          A PSP is only asked for with {productNames(PAYMENT_PRODUCTS)}.
        </div>
      )}

      {selectedList.length > 1 && (
        <div className="product-tabs" role="tablist" aria-label="Product settings">
          {selectedList.map((prodId, idx) => (
            <button key={prodId} type="button" role="tab" aria-selected={activeTab === prodId}
              className={`product-tab${activeTab === prodId ? " active" : ""}`} onClick={() => setActiveTab(prodId)}>
              {idx === 0 && <span aria-hidden="true">⭐</span>}
              {productName(prodId)}
              {tabHasError(prodId) && <span className="product-tab-dot" aria-label="has missing fields" />}
            </button>
          ))}
        </div>
      )}

      {selectedList.length === 1 && (
        <div className="product-tab-title">{productName(selectedList[0])}</div>
      )}

      {activeTab === "smart-web-pay" && <WebPaySettings />}
      {activeTab === "entervo-connect" && <ConnectSettings />}
      {activeTab === "smart-validation" && <ValidationSettings />}

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
