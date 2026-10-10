import { useStepFields } from "./useStepFields";

/** Wizard step 05 — Sales confirms payment before the submission is reviewed. */
export function SalesApprovalStep() {
  const { values, choose, message } = useStepFields();
  const approved = values.salesApproved ?? false;
  const setApproved = (value: boolean) => choose("salesApproved", value);
  return (
    <div className="slide-in">
      <div style={{ marginBottom: 20, padding: "12px 16px", background: "#FFF0F6", border: "1px solid #F5A7C7", borderRadius: 8, fontSize: 13, color: "#C0185A" }}>
        <strong>Sales Approval Required</strong> — Before submitting for technical review, the Sales team must confirm that the customer payment has been received.
      </div>
      <div style={{ background: "white", border: "1.5px solid var(--gray-200)", borderRadius: 12, padding: "24px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FFF0F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>💳</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>Payment Confirmation</div>
            <div style={{ fontSize: 12, color: "var(--gray-600)", marginTop: 2 }}>Assigned to: <strong>Sales Team</strong> · Status: {approved ? <span style={{ color: "var(--green)", fontWeight: 700 }}>✓ Confirmed</span> : <span style={{ color: "var(--amber)", fontWeight: 700 }}>⏳ Pending</span>}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          <div style={{ background: "var(--gray-50)", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", marginBottom: 4 }}>Customer</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{values.siteName || "Medway Hospital"}</div>
          </div>
          <div style={{ background: "var(--gray-50)", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", marginBottom: 4 }}>Product</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{values.productName || "smart web pay"}</div>
          </div>
          <div style={{ background: "var(--gray-50)", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", marginBottom: 4 }}>PSP</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{values.psp || "Fiserv"}</div>
          </div>
          <div style={{ background: "var(--gray-50)", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", marginBottom: 4 }}>Sales Contact</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>Sales Test</div>
          </div>
        </div>
        {!approved ? (
          <div style={{ padding: "14px 16px", background: "#FFF9EC", border: "1px solid #F4D78A", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, color: "#7A5000" }}>⏳ Waiting for Sales team to confirm payment receipt. An email notification has been sent to Sales Test.</div>
            <button onClick={() => setApproved(true)} style={{ marginLeft: 16, padding: "7px 16px", background: "#C0185A", color: "white", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font)" }}>
              Simulate Approval
            </button>
          </div>
        ) : (
          <div style={{ padding: "14px 16px", background: "#E8FAF1", border: "1px solid #A0E0C0", borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F7A40" }}>Payment confirmed by Sales</div>
              <div style={{ fontSize: 11, color: "var(--gray-600)", marginTop: 2 }}>Sales Test confirmed payment received · Just now</div>
            </div>
          </div>
        )}
      </div>
      {message("salesApproved") && (
        <div className="error-msg" role="alert">⚠ {message("salesApproved")}</div>
      )}
    </div>
  );
}
