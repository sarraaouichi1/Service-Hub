import type { ChangeEvent } from "react";
import type { FormTextKey, StepProps } from "../../../types";
import { Field } from "../../../components/Field";
import { Toggle } from "../../../components/Toggle";

export function CellComputerStep({ data, setData }: StepProps) {
  const f = (key: FormTextKey, extra = "") => ({
    value: data[key] || "",
    onChange: (e: ChangeEvent<HTMLInputElement>) => setData({ ...data, [key]: e.target.value }),
    className: `form-input${extra ? " " + extra : ""}${data[key] ? " valid" : ""}`
  });
  return (
    <div className="slide-in">
      <div className="form-grid">
        <Field label="Cell Computer ID" required hint="Numeric ID from entervo system">
          <input {...f("cellId", "mono")} placeholder="e.g. 4438" />
        </Field>
        <Field label="Cell Computer Name" hint="Display name shown in the frontend">
          <input {...f("cellName")} placeholder="e.g. MedwayHZR" />
        </Field>
        <Field label="Language Tag" required hint="ISO 639-1 + country code">
          <select className={`form-select${data.lang ? " valid" : ""}`} value={data.lang || ""} onChange={e => setData({ ...data, lang: e.target.value })}>
            <option value="">Select language…</option>
            <option>en-GB</option><option>en-US</option><option>de-DE</option><option>de-AT</option>
            <option>fr-FR</option><option>nl-NL</option><option>nl-BE</option><option>es-ES</option>
          </select>
        </Field>
        <Field label="Country" required>
          <select className={`form-select${data.country ? " valid" : ""}`} value={data.country || ""} onChange={e => setData({ ...data, country: e.target.value })}>
            <option value="">Select country…</option>
            <option value="GB">United Kingdom (GB)</option>
            <option value="DE">Germany (DE)</option>
            <option value="FR">France (FR)</option>
            <option value="NL">Netherlands (NL)</option>
            <option value="CH">Switzerland (CH)</option>
            <option value="AT">Austria (AT)</option>
          </select>
        </Field>
        <Field label="Currency Code" hint="ISO 4217">
          <select className={`form-select${data.currency ? " valid" : ""}`} value={data.currency || ""} onChange={e => setData({ ...data, currency: e.target.value })}>
            <option value="">Select currency…</option>
            <option>GBP</option><option>EUR</option><option>CHF</option><option>USD</option><option>CAD</option>
          </select>
        </Field>
        <Field label="Decimal Places in Currency">
          <input {...f("decimals", "mono")} placeholder="2" />
        </Field>
        <Field label="UI User ID" hint="Digits only">
          <input {...f("uiUserId", "mono")} placeholder="e.g. 98" />
        </Field>
        <Field label="UI User Password" hint="Max 9 chars, no @ or spaces">
          <input {...f("uiPassword", "mono")} type="password" placeholder="••••••••" />
        </Field>
        <Field label="Cashier Terminal Device ID">
          <input {...f("deviceId", "mono")} placeholder="e.g. 750" />
        </Field>
        <Field label="VAT Percentage" hint="Required for first roll-out in country">
          <input {...f("vat", "mono")} placeholder="e.g. 20" />
        </Field>
      </div>
      <div style={{ marginTop: 18, display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
        <Toggle label="LPR (Licence Plate Recognition)" value={data.lpr} onChange={v => setData({ ...data, lpr: v })} />
        <Toggle label="Barcode" value={data.barcode} onChange={v => setData({ ...data, barcode: v })} />
        <Toggle label="LFK (Long-range remote key fob)" value={data.lfk} onChange={v => setData({ ...data, lfk: v })} />
        <Toggle label="Free-flow system with late payment" value={data.freeflow} onChange={v => setData({ ...data, freeflow: v })} />
      </div>
    </div>
  );
}
