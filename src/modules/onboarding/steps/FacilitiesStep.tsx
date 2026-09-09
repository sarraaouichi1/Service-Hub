import type { Facility, ValidatedStepProps } from "../../../types";
import { Icon } from "../../../components/Icon";
import { createFieldBinder } from "./fieldBinder";

const EMPTY_ROW: Facility = { id: "", name: "", city: "", inpayEntry: 30, inpayPayment: 30 };

export function FacilitiesStep({ data, setData, errors, setErrors, step }: ValidatedStepProps) {
  const { recheck } = createFieldBinder(step, data, setData, errors, setErrors);
  const facilities: Facility[] = data.facilities || [EMPTY_ROW];

  /** Apply a change to the rows and re-check the one message they share. */
  const commit = (rows: Facility[]) => {
    const next = { ...data, facilities: rows };
    setData(next);
    recheck("facilities", next);
  };

  const update = (i: number, key: keyof Facility, val: string) =>
    commit(facilities.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));
  const addRow = () => commit([...facilities, { ...EMPTY_ROW }]);
  const removeRow = (i: number) => commit(facilities.filter((_, idx) => idx !== i));

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
      {facilities.map((fac, i) => (
        <div className="facility-row" key={i}>
          <input className="facility-input mono" placeholder="4439" value={fac.id} onChange={e => update(i, "id", e.target.value)} />
          <input className="facility-input" placeholder="Car Park A – Public" value={fac.name} onChange={e => update(i, "name", e.target.value)} />
          <input className="facility-input" placeholder="City" value={fac.city} onChange={e => update(i, "city", e.target.value)} />
          <input className="facility-input mono" placeholder="30 min" value={fac.inpayEntry} onChange={e => update(i, "inpayEntry", e.target.value)} />
          <input className="facility-input mono" placeholder="30 min" value={fac.inpayPayment} onChange={e => update(i, "inpayPayment", e.target.value)} />
          <button className="del-btn" onClick={() => removeRow(i)} title="Remove">×</button>
        </div>
      ))}
      {errors.facilities && <div className="error-msg" role="alert" style={{ marginTop: 10 }}>⚠ {errors.facilities}</div>}
      <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={addRow}>
        <Icon name="plus" /> Add Facility
      </button>
      <div style={{ marginTop: 20, background: "var(--blue-pale)", border: "1px solid var(--blue-mid)", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "var(--blue)" }}>
        <strong>Bulk import:</strong> You can also upload a CSV file with all facility data. Each row should contain: Facility ID, Name, Address, City, InPay Entry (min), InPay Payment (min).
        <span style={{ marginLeft: 8, textDecoration: "underline", cursor: "pointer" }}>Upload CSV →</span>
      </div>
    </div>
  );
}
