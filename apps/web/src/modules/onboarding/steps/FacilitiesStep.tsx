import { useFieldArray, useFormContext } from "react-hook-form";
import type { OnboardingForm } from "../../../types";
import { Icon } from "../../../components/Icon";

const EMPTY_ROW = { id: "", name: "", city: "", inpayEntry: 30, inpayPayment: 30 };

export function FacilitiesStep() {
  const { control, register, formState } = useFormContext<OnboardingForm>();
  const { fields, append, remove } = useFieldArray({ control, name: "facilities" });

  // The rows share one message — the schema reports the first offending row,
  // and there is nowhere per-row to render it yet. Zod's issue lands on the
  // array itself; React Hook Form may nest it under `root`.
  const arrayError = formState.errors.facilities as
    | { message?: string; root?: { message?: string } }
    | undefined;
  const error = arrayError?.message ?? arrayError?.root?.message;

  return (
    <div className="slide-in">
      <div className="facility-header">
        <div className="facility-col-label">Facility ID</div>
        <div className="facility-col-label">Facility Name</div>
        <div className="facility-col-label">City</div>
        <div className="facility-col-label">InPay Entry</div>
        <div className="facility-col-label">InPay Pay</div>
        <div />
      </div>
      {fields.map((row, i) => (
        <div className="facility-row" key={row.id}>
          <input className="facility-input mono" placeholder="4439" {...register(`facilities.${i}.id`)} />
          <input className="facility-input" placeholder="Car Park A – Public" {...register(`facilities.${i}.name`)} />
          <input className="facility-input" placeholder="City" {...register(`facilities.${i}.city`)} />
          <input className="facility-input mono" placeholder="30 min" {...register(`facilities.${i}.inpayEntry`)} />
          <input className="facility-input mono" placeholder="30 min" {...register(`facilities.${i}.inpayPayment`)} />
          <button className="del-btn" onClick={() => remove(i)} title="Remove">×</button>
        </div>
      ))}
      {error && <div className="error-msg" role="alert" style={{ marginTop: 10 }}>⚠ {error}</div>}
      <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => append({ ...EMPTY_ROW })}>
        <Icon name="plus" /> Add Facility
      </button>
      <div style={{ marginTop: 20, background: "var(--blue-pale)", border: "1px solid var(--blue-mid)", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "var(--blue)" }}>
        <strong>Bulk import:</strong> You can also upload a CSV file with all facility data. Each row should contain: Facility ID, Name, Address, City, InPay Entry (min), InPay Payment (min).
        <span style={{ marginLeft: 8, textDecoration: "underline", cursor: "pointer" }}>Upload CSV →</span>
      </div>
    </div>
  );
}
