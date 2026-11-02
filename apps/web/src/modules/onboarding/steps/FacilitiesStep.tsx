import { useFieldArray, useFormContext } from "react-hook-form";
import type { OnboardingForm } from "../../../types";
import { Icon } from "../../../components/Icon";
import { Field } from "../../../components/Field";
import { Toggle } from "../../../components/Toggle";
import { useStepFields } from "./useStepFields";

const EMPTY_ROW = { id: "", name: "", city: "", inpayEntry: "", inpayPayment: "" };

export function FacilitiesStep() {
  const { control, register, formState } = useFormContext<OnboardingForm>();
  const { fields, append, remove } = useFieldArray({ control, name: "facilities" });
  const { input, toggle, message, values } = useStepFields();

  const selectedStr = (values.product as string) || "";
  const selectedList = selectedStr ? selectedStr.split(",").filter(Boolean) : [];

  // The rows share one message — the schema reports the first offending row,
  // and there is nowhere per-row to render it yet. Zod's issue lands on the
  // array itself; React Hook Form may nest it under `root`.
  const arrayError = formState.errors.facilities as
    | { message?: string; root?: { message?: string } }
    | undefined;
  const error = arrayError?.message ?? arrayError?.root?.message;

  return (
    <div className="slide-in">
      <div style={{ marginBottom: 14, fontSize: 13, color: "var(--gray-600)" }}>
        Add connection points and parking facilities served by this deployment. IDs must be numeric digits only.
      </div>

      <div className="facility-header">
        <div className="facility-col-label">Facility ID *</div>
        <div className="facility-col-label">Facility Name *</div>
        <div className="facility-col-label">City</div>
        <div className="facility-col-label">InPay Entry (min)</div>
        <div className="facility-col-label">InPay Pay (min)</div>
        <div />
      </div>

      {fields.map((row, i) => (
        <div className="facility-row" key={row.id}>
          <input className="facility-input mono" placeholder="e.g. 1338" {...register(`facilities.${i}.id`)} />
          <input className="facility-input" placeholder="e.g. Parking Area 1" {...register(`facilities.${i}.name`)} />
          <input className="facility-input" placeholder="e.g. London" {...register(`facilities.${i}.city`)} />
          <input className="facility-input mono" placeholder="e.g. 15" {...register(`facilities.${i}.inpayEntry`)} />
          <input className="facility-input mono" placeholder="e.g. 15" {...register(`facilities.${i}.inpayPayment`)} />
          <button className="del-btn" onClick={() => remove(i)} title="Remove">×</button>
        </div>
      ))}

      {error && <div className="error-msg" role="alert" style={{ marginTop: 10 }}>⚠ {error}</div>}

      <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => append({ ...EMPTY_ROW })}>
        <Icon name="plus" /> Add Facility
      </button>

      {/* Additional Facility & Parking specifications for Mobility Connect / Smart Select */}
      {(selectedList.includes("mobility-connect") || selectedList.includes("smart-select")) && (
        <div style={{ marginTop: 24, padding: "16px 18px", background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 10 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--navy)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🚗 Extended Facility & Car Park Parameters (Parkhausinformationen)</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--blue)", background: "var(--blue-pale)", padding: "2px 8px", borderRadius: 4 }}>
              Mobility &amp; Portal
            </span>
          </div>

          <div className="form-grid">
            <Field label="Carpark Type" hint="MSCP (Multi Storey), UGCP (Underground), PA (Park Area)" error={message("carparkType")}>
              <select className="form-select" {...register("carparkType")}>
                <option value="MSCP">Multi Storey Car Park (MSCP)</option>
                <option value="UGCP">Underground Car Park (UGCP)</option>
                <option value="PA">Park Area (PA)</option>
              </select>
            </Field>

            <Field label="Height Limit (m)" hint="e.g. 2.10 (numbers only)" error={message("heightLimit")}>
              <input {...input("heightLimit", "mono")} placeholder="e.g. 2.10" />
            </Field>

            <Field label="Total Parking Lots" hint="Digits only" error={message("parkingLots")}>
              <input {...input("parkingLots", "mono")} placeholder="e.g. 450" />
            </Field>

            <Field label="Electric Charging Stations" hint="Digits only" error={message("chargingStations")}>
              <input {...input("chargingStations", "mono")} placeholder="e.g. 12" />
            </Field>

            <Field label="Number of Entry Lanes" hint="Digits only" error={message("entryLanes")}>
              <input {...input("entryLanes", "mono")} placeholder="e.g. 2" />
            </Field>

            <Field label="Number of Exit Lanes" hint="Digits only" error={message("exitLanes")}>
              <input {...input("exitLanes", "mono")} placeholder="e.g. 2" />
            </Field>
          </div>

          <div style={{ marginTop: 14, display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
            <Toggle label="Open 24/7" sub="Accessible round-the-clock" {...toggle("open247")} />
            <Toggle label="Access Outside Opening Hours" sub="Permits entry/exit for registered patrons" {...toggle("accessOutsideHours")} />
          </div>
        </div>
      )}

      <div style={{ marginTop: 20, background: "var(--blue-pale)", border: "1px solid var(--blue-mid)", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "var(--blue)" }}>
        <strong>Data Synchronization Active:</strong> Facility IDs and connection points entered here are saved to the database and automatically linked to all your active entervo smart services.
      </div>
    </div>
  );
}
