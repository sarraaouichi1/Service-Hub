import type { ValidatedStepProps } from "../../../types";
import { Field } from "../../../components/Field";
import { Toggle } from "../../../components/Toggle";
import { createFieldBinder } from "./fieldBinder";

export function CellComputerStep({ data, setData, errors, setErrors, step }: ValidatedStepProps) {
  const { input, select } = createFieldBinder(step, data, setData, errors, setErrors);

  return (
    <div className="slide-in">
      <div className="form-grid">
        <Field label="Cell Computer ID" required hint="Numeric ID from entervo system" error={errors.cellId}>
          <input {...input("cellId", "mono")} placeholder="e.g. 4438" />
        </Field>
        <Field label="Cell Computer Name" hint="Display name shown in the frontend" error={errors.cellName}>
          <input {...input("cellName")} placeholder="e.g. MedwayHZR" />
        </Field>
        <Field label="Language Tag" required hint="ISO 639-1 + country code" error={errors.lang}>
          <select {...select("lang")}>
            <option value="">Select language…</option>
            <option>en-GB</option><option>en-US</option><option>de-DE</option><option>de-AT</option>
            <option>fr-FR</option><option>nl-NL</option><option>nl-BE</option><option>es-ES</option>
          </select>
        </Field>
        <Field label="Country" required error={errors.country}>
          <select {...select("country")}>
            <option value="">Select country…</option>
            <option value="GB">United Kingdom (GB)</option>
            <option value="DE">Germany (DE)</option>
            <option value="FR">France (FR)</option>
            <option value="NL">Netherlands (NL)</option>
            <option value="CH">Switzerland (CH)</option>
            <option value="AT">Austria (AT)</option>
          </select>
        </Field>
        <Field label="Currency Code" hint="ISO 4217" error={errors.currency}>
          <select {...select("currency")}>
            <option value="">Select currency…</option>
            <option>GBP</option><option>EUR</option><option>CHF</option><option>USD</option><option>CAD</option>
          </select>
        </Field>
        <Field label="Decimal Places in Currency" error={errors.decimals}>
          <input {...input("decimals", "mono")} placeholder="2" />
        </Field>
        <Field label="UI User ID" hint="Digits only" error={errors.uiUserId}>
          <input {...input("uiUserId", "mono")} placeholder="e.g. 98" />
        </Field>
        <Field label="UI User Password" hint="Max 9 chars, no @ or spaces" error={errors.uiPassword}>
          <input {...input("uiPassword", "mono")} type="password" placeholder="••••••••" />
        </Field>
        <Field label="Cashier Terminal Device ID" error={errors.deviceId}>
          <input {...input("deviceId", "mono")} placeholder="e.g. 750" />
        </Field>
        <Field label="VAT Percentage" hint="Required for first roll-out in country" error={errors.vat}>
          <input {...input("vat", "mono")} placeholder="e.g. 20" />
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
