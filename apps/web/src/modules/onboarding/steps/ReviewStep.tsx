import { useWatch } from "react-hook-form";
import type { DeclarationReviewStepProps, OnboardingForm } from "../../../types";
import { Icon } from "../../../components/Icon";
import { useOnboardingSchemas, useProducts, usePsps } from "../../../queries";

export function ReviewStep({ declared, onDeclaredChange }: DeclarationReviewStepProps) {
  const data = useWatch<OnboardingForm>() as OnboardingForm;
  const psps = usePsps();
  const products = useProducts();
  const schemas = useOnboardingSchemas();

  // Split selected products
  const selectedStr = (data.product as string) || "";
  const selectedList = selectedStr ? selectedStr.split(",").filter(Boolean) : [];
  const allProducts = products.data ?? [];

  // Falls back to the stored id rather than "Not selected" while the list loads
  const pspLabel = psps.data?.find(p => p.id === data.psp)?.name ?? data.psp ?? "Not selected";
  const facs = data.facilities || [];
  // Named against the schema, so this can't claim the draft is ready when the
  // submit button disagrees — both ask the same question.
  const issues = schemas.draftIssues(data);

  return (
    <div className="slide-in">
      {issues.length > 0 && (
        <div style={{ background: "var(--color-danger-soft)", border: "1px solid var(--color-danger)", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "var(--color-danger-text)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 600 }}>
            <Icon name="zap" size={14} color="var(--color-danger-text)" />
            {issues.length} {issues.length === 1 ? "item needs" : "items need"} attention before you can submit
          </div>
          <ul style={{ margin: "8px 0 0", paddingLeft: 32, lineHeight: 1.7 }}>
            {issues.map((issue, i) => <li key={i}>{issue}</li>)}
          </ul>
        </div>
      )}

      {/* Selected Products */}
      <div className="review-section">
        <div className="review-section-title"><Icon name="grid" size={14} /> Selected Products ({selectedList.length})</div>
        {selectedList.length === 0 ? (
          <div className="review-row"><div className="review-key">Product</div><div className="review-val">—</div></div>
        ) : (
          selectedList.map((pId, idx) => {
            const pObj = allProducts.find(p => p.id === pId);
            return (
              <div className="review-row" key={pId}>
                <div className="review-key">
                  {idx === 0 ? "⭐ Starting Product" : `Product ${idx + 1}`}
                </div>
                <div className="review-val" style={{ fontWeight: idx === 0 ? 700 : 500, color: idx === 0 ? "var(--blue)" : "inherit" }}>
                  {pObj?.name || pId} {idx === 0 && <span style={{ fontSize: 11, background: "var(--blue-pale)", color: "var(--blue)", padding: "2px 6px", borderRadius: 4, marginLeft: 6 }}>1st</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="review-section">
        <div className="review-section-title"><Icon name="building" size={14} /> Operator & Access (Shared across products)</div>
        {[
          ["Operator Name", data.opName || "—"],
          ["Operator ID", data.opId || "—"],
          ["Email", data.opEmail || "—"],
          ["Phone", data.phone || "—"],
          ["Static IP", data.ip || "—"],
          ["Port", data.port || "—"],
          ["Domain", data.domain || "—"],
          ["Version", data.version || "—"],
        ].map(([k, v], i) => (
          <div className="review-row" key={i}><div className="review-key">{k}</div><div className="review-val">{v}</div></div>
        ))}
      </div>

      <div className="review-section">
        <div className="review-section-title"><Icon name="server" size={14} /> Cell Computer (Shared across products)</div>
        {[
          ["Cell ID", data.cellId || "—"],
          ["Cell Name", data.cellName || "—"],
          ["Country", data.country || "—"],
          ["Language", data.lang || "—"],
          ["Currency", data.currency || "—"],
          ["VAT %", data.vat || "—"],
          ["LPR Enabled", data.lpr ? "Yes" : "No"],
          ["Barcode Enabled", data.barcode ? "Yes" : "No"],
        ].map(([k, v], i) => (
          <div className="review-row" key={i}><div className="review-key">{k}</div><div className="review-val">{v}</div></div>
        ))}
      </div>

      <div className="review-section">
        <div className="review-section-title"><Icon name="mapPin" size={14} /> Facilities ({facs.length})</div>
        {facs.length === 0 ? (
          <div className="review-row"><div className="review-key">No facilities added</div><div className="review-val">—</div></div>
        ) : facs.map((f, i) => (
          <div className="review-row" key={i}><div className="review-key">Facility {i + 1}</div><div className="review-val">{f.id} — {f.name} ({f.city})</div></div>
        ))}
      </div>

      {/* entervo connect section if applicable */}
      {(data.providerId || data.sshPort || data.contactEmail || data.adminEmail) && (
        <div className="review-section">
          <div className="review-section-title"><Icon name="cpu" size={14} /> entervo connect Parameters</div>
          {[
            ["Provider ID", data.providerId || "—"],
            ["SSH Port", data.sshPort || "—"],
            ["Contact Person", [data.contactFirstname, data.contactSurname].filter(Boolean).join(" ") || "—"],
            ["Contact Email", data.contactEmail || "—"],
            ["Technical Admin", [data.adminFirstname, data.adminSurname].filter(Boolean).join(" ") || "—"],
            ["Admin Email", data.adminEmail || "—"],
          ].map(([k, v], i) => (
            <div className="review-row" key={i}><div className="review-key">{k}</div><div className="review-val">{v}</div></div>
          ))}
        </div>
      )}

      {/* entervo smart validation section if applicable */}
      {(data.tenantShortname || data.incidentEmail || data.subtechEmail || data.mediatypes) && (
        <div className="review-section">
          <div className="review-section-title"><Icon name="shield" size={14} /> entervo smart validation</div>
          {[
            ["Tenant Shortname (URL)", data.tenantShortname || "—"],
            ["Tenant Description", data.tenantDescription || "—"],
            ["Subtech Email", data.subtechEmail || "—"],
            ["Incident Email", data.incidentEmail || "—"],
            ["Onboarding Email", data.onboardingEmail || "—"],
            ["Media Types", data.mediatypes || "—"],
          ].map(([k, v], i) => (
            <div className="review-row" key={i}><div className="review-key">{k}</div><div className="review-val">{v}</div></div>
          ))}
        </div>
      )}

      {/* mobility connect section if applicable */}
      {(data.carparkType || data.parkingLots || data.costCenter || data.mobilityProvider) && (
        <div className="review-section">
          <div className="review-section-title"><Icon name="mapPin" size={14} /> mobility CONNECT Parameters</div>
          {[
            ["Garage Type", data.carparkType || "—"],
            ["Total Parking Lots", data.parkingLots || "—"],
            ["EV Charging Stations", data.chargingStations || "—"],
            ["Height Limit", data.heightLimit || "—"],
            ["Cost Center", data.costCenter || "—"],
            ["Daily Max Price", data.dailyMax || "—"],
            ["Mobility Provider", data.mobilityProvider || "—"],
          ].map(([k, v], i) => (
            <div className="review-row" key={i}><div className="review-key">{k}</div><div className="review-val">{v}</div></div>
          ))}
        </div>
      )}

      {/* smart select section if applicable */}
      {(data.portalUrl || data.projectName || data.contractProductName || data.timeCardProductName) && (
        <div className="review-section">
          <div className="review-section-title"><Icon name="externalLink" size={14} /> evopark smart select Portal</div>
          {[
            ["Portal URL Slug", data.portalUrl || "—"],
            ["Project Name", data.projectName || "—"],
            ["Sender Email", data.senderEmail || "—"],
            ["Sender Domain", data.senderDomain || "—"],
            ["Payment Settlement", data.paymentType || "—"],
            ["Contract Product", data.contractProductName || "—"],
            ["Time Card Product", data.timeCardProductName || "—"],
          ].map(([k, v], i) => (
            <div className="review-row" key={i}><div className="review-key">{k}</div><div className="review-val">{v}</div></div>
          ))}
        </div>
      )}

      <div className="review-section">
        <div className="review-section-title"><Icon name="creditCard" size={14} /> Payment Provider & Gateways</div>
        {[
          ["PSP", pspLabel],
          ["Merchant ID", data.pspMid || "—"],
          ["Tariff Class", data.tariff || "0"],
          ["Vouchers", data.vouchers ? "Yes" : "No"],
          ["Prepayment", data.prepay ? "Yes" : "No"],
        ].map(([k, v], i) => (
          <div className="review-row" key={i}><div className="review-key">{k}</div><div className="review-val">{v}</div></div>
        ))}
      </div>

      <div className="review-section">
        <div className="review-section-title"><Icon name="shield" size={14} /> Delivery Check &amp; Contract Validity</div>
        {[
          ["Delivery Readiness", data.salesApproved ? "Confirmed by Sales Team" : "Pending Confirmation"],
          ["Contract Expiration Date", data.contractDate ? `${data.contractDate} (Valid)` : "—"],
          ["Assigned Sales Contact", "Sales Team"],
        ].map(([k, v], i) => (
          <div className="review-row" key={i}><div className="review-key">{k}</div><div className="review-val">{v}</div></div>
        ))}
      </div>

      <div style={{ marginTop: 20, padding: "14px 18px", background: "var(--blue-pale)", border: "1px solid var(--blue-mid)", borderRadius: 8, fontSize: 13, color: "var(--blue)" }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={declared}
            onChange={e => onDeclaredChange(e.target.checked)}
            style={{ marginTop: 2 }}
          />
          <span>I confirm that all information provided is accurate and complete to the best of my knowledge.</span>
        </label>
      </div>
    </div>
  );
}
