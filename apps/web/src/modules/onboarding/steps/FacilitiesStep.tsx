import { useFieldArray, useFormContext } from "react-hook-form";
import { parseProducts } from "@service-hub/shared";
import type { OnboardingForm, ProductId } from "../../../types";
import { Icon } from "../../../components/Icon";
import { Field } from "../../../components/Field";
import { Toggle } from "../../../components/Toggle";
import { useProducts } from "../../../queries";
import { useStepFields } from "./useStepFields";
import { RowListError } from "./RowListError";

export function FacilitiesStep() {
  const { control, register, setValue, trigger, formState } = useFormContext<OnboardingForm>();
  const { fields, append, remove } = useFieldArray({ control, name: "facilities", keyName: "_rowId" });
  const { input, toggle, message, values } = useStepFields();
  const products = useProducts().data ?? [];

  const selectedList = parseProducts(values.product);
  const cellComputers = values.cellComputers ?? [];
  const productName = (id: string) => products.find(p => p.id === id)?.name ?? id;

  // A new facility starts on the only cell computer when there is one, and with
  // no services ticked: which services run where is exactly what this step asks.
  const addFacility = () => append({
    id: "", name: "", city: "", inpayEntry: "", inpayPayment: "",
    cellComputer: cellComputers.length === 1 ? cellComputers[0].key : "",
    services: selectedList.length === 1 ? [...selectedList] : [],
  });

  const toggleService = (index: number, product: ProductId) => {
    const current = values.facilities?.[index]?.services ?? [];
    const next = current.includes(product) ? current.filter(p => p !== product) : [...current, product];
    setValue(`facilities.${index}.services`, next, { shouldDirty: true });
    // Re-check only once the list has spoken up, matching the form's onTouched feel.
    if (formState.errors.facilities) void trigger("facilities");
  };

  return (
    <div className="slide-in">
      <div className="notif-bar info">
        <Icon name="info" size={14} />
        Add each physical car park. Connect it to the cell computer that runs it, then select only the specific digital services actively enabled at this physical location.
      </div>

      {cellComputers.length === 0 && (
        <div className="notif-bar">
          <Icon name="zap" size={14} color="var(--color-warning-text)" />
          Add a cell computer on the previous step first — every facility has to be connected to one.
        </div>
      )}

      {fields.map((row, i) => {
        const services = values.facilities?.[i]?.services ?? [];
        return (
          <section className="row-card" key={row._rowId} aria-label={`Facility ${i + 1}`}>
            <div className="row-card-head">
              <div className="row-card-title">
                <Icon name="mapPin" size={15} />
                {values.facilities?.[i]?.name || `Facility ${i + 1}`}
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(i)} aria-label={`Remove facility ${i + 1}`}>
                <Icon name="trash" size={14} /> Remove
              </button>
            </div>
            <div className="facility-grid">
              <Field label="Facility ID" required hint="Digits only">
                <input className="form-input mono" placeholder="e.g. 1338" {...register(`facilities.${i}.id`)} />
              </Field>
              <Field label="Facility name" required>
                <input className="form-input" placeholder="e.g. Parking Area 1" {...register(`facilities.${i}.name`)} />
              </Field>
              <Field label="City">
                <input className="form-input" placeholder="e.g. London" {...register(`facilities.${i}.city`)} />
              </Field>
              <Field label="InPay entry (min)">
                <input className="form-input mono" placeholder="e.g. 15" {...register(`facilities.${i}.inpayEntry`)} />
              </Field>
              <Field label="InPay payment (min)">
                <input className="form-input mono" placeholder="e.g. 15" {...register(`facilities.${i}.inpayPayment`)} />
              </Field>
              <Field label="Cell computer" required hint="The one this facility is connected to">
                <select className="form-select" {...register(`facilities.${i}.cellComputer`)}>
                  <option value="">Select cell computer…</option>
                  {cellComputers.map((c, n) => (
                    <option key={c.key} value={c.key}>
                      {c.name || `Cell computer ${n + 1}`}{c.ip ? ` — ${c.ip}` : ""}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="service-picker" role="group" aria-label={`Services at facility ${i + 1}`}>
              <div className="service-picker-label">Services enabled at this location <span className="req">*</span></div>
              <div className="service-picker-options">
                {selectedList.map(p => (
                  <label key={p} className={`service-chip${services.includes(p) ? " selected" : ""}`}>
                    <input type="checkbox" checked={services.includes(p)} onChange={() => toggleService(i, p)} />
                    {productName(p)}
                  </label>
                ))}
                {selectedList.length === 0 && <span className="text-muted">Select products on Step 00 first.</span>}
              </div>
            </div>
          </section>
        );
      })}

      <RowListError name="facilities" />

      <button type="button" className="btn btn-secondary" style={{ marginTop: 4 }} onClick={addFacility}>
        <Icon name="plus" /> Add facility
      </button>

      {/* Additional Facility & Parking specifications for Mobility Connect / Smart Select */}
      {(selectedList.includes("mobility-connect") || selectedList.includes("smart-select")) && (
        <div className="product-panel" style={{ marginTop: 24 }}>
          <div className="product-panel-title">
            <span>🚗 Extended Facility & Car Park Parameters (Parkhausinformationen)</span>
            <span className="product-panel-tag">Mobility &amp; Portal</span>
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

          <div className="toggle-grid cols-2" style={{ marginTop: 14 }}>
            <Toggle label="Open 24/7" sub="Accessible round-the-clock" {...toggle("open247")} />
            <Toggle label="Access Outside Opening Hours" sub="Permits entry/exit for registered patrons" {...toggle("accessOutsideHours")} />
          </div>
        </div>
      )}
    </div>
  );
}
