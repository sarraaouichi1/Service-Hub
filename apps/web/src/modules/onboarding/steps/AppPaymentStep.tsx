import { Field } from "../../../components/Field";
import { Toggle } from "../../../components/Toggle";
import { clickable } from "../../../components/clickable";
import { useStepFields } from "./useStepFields";
import { AsyncSection } from "../../../components/AsyncSection";
import { usePsps } from "../../../queries";

export function AppPaymentStep() {
  const psps = usePsps();
  const { values, input, toggle, choose, message } = useStepFields();
  const psp = values.psp;

  return (
    <div className="slide-in">
      <div className="form-grid" style={{ marginBottom: 20 }}>
        <Field label="Financial Information" hint="Printed on the payment receipt" span2 error={message("financialInfo")}>
          <input {...input("financialInfo", "mono")} placeholder="e.g. 654929496" />
        </Field>
        <Field label="Terms & Conditions URL" error={message("tocUrl")}>
          <input {...input("tocUrl")} placeholder="https://…" />
        </Field>
        <Field label="Tariff Class ID" hint="0 = standard tariff" error={message("tariff")}>
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
            {psps.data?.find(p => p.id === psp)?.name ?? psp} — Configuration
          </div>
          <div className="form-grid">
            <Field label="Merchant ID" required error={message("pspMid")}><input {...input("pspMid", "mono")} placeholder="MID-xxxxx" /></Field>
            <Field label="Terminal ID" error={message("pspTid")}><input {...input("pspTid", "mono")} placeholder="TID-xxxxx" /></Field>
            <Field label="API Key / Client ID"><input {...input("pspKey", "mono")} placeholder="••••••••••••" type="password" /></Field>
            <Field label="API Secret"><input {...input("pspSecret", "mono")} placeholder="••••••••••••" type="password" /></Field>
          </div>
          <div style={{ marginTop: 14, display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr" }}>
            {["Visa", "Mastercard", "Apple Pay", "Google Pay", "PayPal", "SEPA"].map(pm => (
              <Toggle key={pm} label={pm} {...toggle(`pm_${pm}`)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
