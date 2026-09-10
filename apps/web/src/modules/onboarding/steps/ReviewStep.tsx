import { useWatch } from "react-hook-form";
import type { DeclarationReviewStepProps, OnboardingForm } from "../../../types";
import { Icon } from "../../../components/Icon";
import { useOnboardingSchemas, usePsps } from "../../../queries";

export function ReviewStep({ declared, onDeclaredChange }: DeclarationReviewStepProps) {
  const data = useWatch<OnboardingForm>() as OnboardingForm;
  const psps = usePsps();
  const schemas = useOnboardingSchemas();
  // Falls back to the stored id rather than "Not selected" while the list loads,
  // so a chosen provider never briefly reads as unchosen.
  const pspLabel = psps.data?.find(p => p.id === data.psp)?.name ?? data.psp ?? "Not selected";
  const facs = data.facilities || [];
  // Named against the schema, so this can't claim the draft is ready when the
  // submit button disagrees — both ask the same question.
  const issues = schemas.draftIssues(data);
  return (
    <div className="slide-in">
      {issues.length > 0 && (
        <div style={{ background: "#FEECEC", border: "1px solid #F0AAAA", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#B03030" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 600 }}>
            <Icon name="zap" size={14} color="#B03030" />
            {issues.length} {issues.length === 1 ? "item needs" : "items need"} attention before you can submit
          </div>
          <ul style={{ margin: "8px 0 0", paddingLeft: 32, lineHeight: 1.7 }}>
            {issues.map((issue, i) => <li key={i}>{issue}</li>)}
          </ul>
        </div>
      )}
      <div className="review-section">
        <div className="review-section-title"><Icon name="building" size={14} /> Operator & Access</div>
        {[["Operator Name", data.opName || "—"],["Operator ID", data.opId || "—"],["Email", data.opEmail || "—"],["Phone", data.phone || "—"],["Static IP", data.ip || "—"],["Port", data.port || "—"],["Domain", data.domain || "—"],["Version", data.version || "—"]].map(([k,v], i) => (
          <div className="review-row" key={i}><div className="review-key">{k}</div><div className="review-val">{v}</div></div>
        ))}
      </div>
      <div className="review-section">
        <div className="review-section-title"><Icon name="server" size={14} /> Cell Computer</div>
        {[["Cell ID", data.cellId || "—"],["Cell Name", data.cellName || "—"],["Language", data.lang || "—"],["Country", data.country || "—"],["Currency", data.currency || "—"],["VAT %", data.vat || "—"],["LPR", data.lpr ? "Yes" : "No"],["Barcode", data.barcode ? "Yes" : "No"]].map(([k,v], i) => (
          <div className="review-row" key={i}><div className="review-key">{k}</div><div className="review-val">{v}</div></div>
        ))}
      </div>
      <div className="review-section">
        <div className="review-section-title"><Icon name="mapPin" size={14} /> Facilities ({facs.length})</div>
        {facs.length === 0 ? (
          <div className="review-row"><div className="review-key">No facilities added</div><div className="review-val">—</div></div>
        ) : facs.map((f, i) => (
          <div className="review-row" key={i}><div className="review-key">Facility {i+1}</div><div className="review-val">{f.id} — {f.name} ({f.city})</div></div>
        ))}
      </div>
      <div className="review-section">
        <div className="review-section-title"><Icon name="creditCard" size={14} /> Payment Provider</div>
        {[["PSP", pspLabel],["Merchant ID", data.pspMid || "—"],["Tariff Class", data.tariff || "0"],["Vouchers", data.vouchers ? "Yes" : "No"],["Prepayment", data.prepay ? "Yes" : "No"]].map(([k,v], i) => (
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
