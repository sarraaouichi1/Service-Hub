import type { ChangeEvent } from "react";
import type { FormTextKey, StepProps } from "../../../types";
import { PSP_LIST } from "../../../data/psps";
import { Field } from "../../../components/Field";
import { Toggle } from "../../../components/Toggle";
import { clickable } from "../../../components/clickable";

export function AppPaymentStep({ data, setData }: StepProps) {
  const f = (key: FormTextKey, extra = "") => ({
    value: data[key] || "",
    onChange: (e: ChangeEvent<HTMLInputElement>) => setData({ ...data, [key]: e.target.value }),
    className: `form-input${extra ? " " + extra : ""}${data[key] ? " valid" : ""}`
  });
  return (
    <div className="slide-in">
      <div className="form-grid" style={{ marginBottom: 20 }}>
        <Field label="Financial Information" hint="Printed on the payment receipt" span2>
          <input {...f("financialInfo", "mono")} placeholder="e.g. 654929496" />
        </Field>
        <Field label="Terms & Conditions URL">
          <input {...f("tocUrl")} placeholder="https://…" />
        </Field>
        <Field label="Tariff Class ID" hint="0 = standard tariff">
          <input {...f("tariff", "mono")} placeholder="0" />
        </Field>
      </div>
      <div style={{ marginBottom: 18, display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <Toggle label="Vouchers" value={data.vouchers} onChange={v => setData({ ...data, vouchers: v })} />
        <Toggle label="Prepayment" value={data.prepay} onChange={v => setData({ ...data, prepay: v })} />
        <Toggle label="Top-up" value={data.topup} onChange={v => setData({ ...data, topup: v })} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <div className="form-label" style={{ marginBottom: 10 }}>Payment Service Provider <span style={{ color: "var(--red)" }}>*</span></div>
        <div className="psp-grid">
          {PSP_LIST.map(p => (
            <div key={p.id} className={`psp-card${data.psp === p.id ? " selected" : ""}`} {...clickable(() => setData({ ...data, psp: p.id }))}>
              <div className="psp-name">{p.name}</div>
              <div className="psp-tag">{p.tag}</div>
            </div>
          ))}
        </div>
      </div>
      {data.psp && (
        <div className="slide-in" style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 8, padding: "18px 20px", marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 14 }}>
            {PSP_LIST.find(p => p.id === data.psp)?.name} — Configuration
          </div>
          <div className="form-grid">
            <Field label="Merchant ID" required><input {...f("pspMid", "mono")} placeholder="MID-xxxxx" /></Field>
            <Field label="Terminal ID"><input {...f("pspTid", "mono")} placeholder="TID-xxxxx" /></Field>
            <Field label="API Key / Client ID"><input {...f("pspKey", "mono")} placeholder="••••••••••••" type="password" /></Field>
            <Field label="API Secret"><input {...f("pspSecret", "mono")} placeholder="••••••••••••" type="password" /></Field>
          </div>
          <div style={{ marginTop: 14, display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr" }}>
            {["Visa", "Mastercard", "Apple Pay", "Google Pay", "PayPal", "SEPA"].map(pm => (
              <Toggle key={pm} label={pm} value={data[`pm_${pm}`]} onChange={v => setData({ ...data, [`pm_${pm}`]: v })} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
