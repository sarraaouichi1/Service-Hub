import { useFieldArray, useFormContext } from "react-hook-form";
import { CELL_REQUIREMENTS, EMPTY_CELL_COMPUTER, newCellComputerKey, parseProducts } from "@service-hub/shared";
import type { OnboardingForm } from "../../../types";
import { Icon } from "../../../components/Icon";
import { Field } from "../../../components/Field";
import { Toggle } from "../../../components/Toggle";
import { useSecretsOnFile } from "../../../queries";
import { useStepFields } from "./useStepFields";
import { RowListError } from "./RowListError";

/**
 * An operator can run several cell computers, each with its own address, port
 * and credentials — so this step is a repeatable list rather than one form.
 * Locale lives on the operator (previous step); facilities pick one of these
 * on the next.
 */
export function CellComputerStep() {
  const { control, register, getValues } = useFormContext<OnboardingForm>();
  const { fields, append, remove } = useFieldArray({ control, name: "cellComputers", keyName: "_rowId" });
  const { toggle, values } = useStepFields();
  const secretsOnFile = useSecretsOnFile();
  const products = parseProducts(values.product);
  const hasConnect = products.includes("entervo-connect");
  const hasWebPay = products.includes("smart-web-pay");
  const hasValidation = products.includes("smart-validation");
  // What the selected products' sheets require of each cell computer.
  const wants = (list: readonly string[]) => products.some(p => list.includes(p));
  const needsAddress = wants(CELL_REQUIREMENTS.needsAddress);
  const needsUser = wants(CELL_REQUIREMENTS.needsUser);
  const needsHostName = wants(CELL_REQUIREMENTS.needsHostName);

  const addCellComputer = () => {
    append({
      ...EMPTY_CELL_COMPUTER, key: newCellComputerKey(), name: `CC-${String(fields.length + 1).padStart(2, "0")}`,
      // The validation sheet's default cashier device.
      deviceId: hasValidation ? "799" : "",
    });
  };

  // Removing a cell computer that facilities still point at would orphan them
  // silently; say so instead.
  const linkedFacilities = (key: string) =>
    (getValues("facilities") ?? []).filter((f) => f.cellComputer === key).length;

  const removeCellComputer = (index: number, key: string, name: string) => {
    const linked = linkedFacilities(key);
    if (linked > 0 && !window.confirm(`${name || "This cell computer"} is used by ${linked} ${linked === 1 ? "facility" : "facilities"}. Remove it anyway? You will need to choose another cell computer for ${linked === 1 ? "it" : "them"}.`)) {
      return;
    }
    remove(index);
  };

  const field = (i: number, key: keyof typeof EMPTY_CELL_COMPUTER | "hostName" | "address" | "cashierContractId" | "cashierConsumerId", extra = "") => ({
    ...register(`cellComputers.${i}.${key}` as const),
    className: `form-input${extra ? ` ${extra}` : ""}`,
  });

  return (
    <div className="slide-in">
      <div className="notif-bar info">
        <Icon name="info" size={14} />
        Add every cell computer this operator runs. Each has its own address, port and credentials; you will connect facilities to them on the next step.
      </div>

      {fields.length === 0 && (
        <div className="empty-panel">No cell computers yet. Add the first one to continue.</div>
      )}

      {fields.map((row, i) => {
        const passwordStored = secretsOnFile.includes(`cellComputers.${row.key}.uiPassword`);
        return (
          <section className="row-card" key={row._rowId} aria-label={`Cell computer ${i + 1}`}>
            <div className="row-card-head">
              <div className="row-card-title">
                <Icon name="server" size={15} />
                {values.cellComputers?.[i]?.name || `Cell computer ${i + 1}`}
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeCellComputer(i, row.key, values.cellComputers?.[i]?.name ?? "")} aria-label={`Remove cell computer ${i + 1}`}>
                <Icon name="trash" size={14} /> Remove
              </button>
            </div>
            <div className="form-grid">
              <Field label="Name / identifier" required hint="How people refer to it, e.g. CC-01 or CC-North">
                <input {...field(i, "name")} placeholder="e.g. CC-North" />
              </Field>
              <Field label="Cell Computer ID" required hint="Numeric ID from the entervo system, e.g. 7123">
                <input {...field(i, "cellId", "mono")} placeholder="e.g. 4438" />
              </Field>
              {hasWebPay && (
                <Field label="Host name" required={needsHostName} hint="The facility name shown to customers">
                  <input {...field(i, "hostName")} placeholder="e.g. Central Garage" />
                </Field>
              )}
              <Field label="Public IP address" required={needsAddress} hint="The public cell IP, not the local IP. Give IP and port, or a URL">
                <input {...field(i, "ip", "mono")} placeholder="195.171.142.1" />
              </Field>
              <Field label="Public port" required={needsAddress} hint={hasValidation ? "Preferred 8443, otherwise 8400–8450" : "Standard 8443 (1–65535)"}>
                <input {...field(i, "port", "mono")} placeholder="8443" />
              </Field>
              <Field label="Public URL" hint="Instead of IP and port. Takes priority when filled in">
                <input {...field(i, "url")} placeholder="carpark.organisation.com" />
              </Field>
              <Field label={hasConnect ? "Username / participant ID" : "Username"} required={needsUser}
                hint={hasConnect ? "Digits only. For entervo connect: the participant with the \u201cSuperuser S&B\u201d profile" : "Authorises the S&B server on the cell computer; digits only"}>
                <input {...field(i, "uiUserId", "mono")} placeholder="e.g. 98" />
              </Field>
              <Field label="Password" required={needsUser} hint={passwordStored ? "Stored — type to replace" : "Max 9 characters, no @ or spaces"}>
                <input {...field(i, "uiPassword", "mono")} type="password" autoComplete="off"
                  placeholder={passwordStored ? "•••••••• stored" : "••••••••"} />
              </Field>
              <Field label="Cashier device ID" required={hasValidation} hint={hasValidation ? "smart validation default: 799" : undefined}>
                <input {...field(i, "deviceId", "mono")} placeholder={hasValidation ? "799" : "e.g. 750"} />
              </Field>
              {hasWebPay && (
                <>
                  <Field label="Cell computer address" hint="Physical address, not the network address">
                    <input {...field(i, "address")} placeholder="Street, city" />
                  </Field>
                  <Field label="Cashier contract ID">
                    <input {...field(i, "cashierContractId", "mono")} />
                  </Field>
                  <Field label="Cashier consumer ID">
                    <input {...field(i, "cashierConsumerId", "mono")} />
                  </Field>
                </>
              )}
            </div>
          </section>
        );
      })}

      <RowListError name="cellComputers" />

      <button type="button" className="btn btn-secondary" style={{ marginTop: 4 }} onClick={addCellComputer}>
        <Icon name="plus" /> Add cell computer
      </button>

      <div className="form-section-title" style={{ marginTop: 28 }}>
        Network checks
        <span>Confirm once tested for every cell computer above.</span>
      </div>
      <div className="toggle-grid cols-2">
        <Toggle label="Cell computers reachable from outside network" sub="Confirm after testing each static IP" {...toggle("reachable")} />
        <Toggle label="Network communication forwarding set" sub="Port forwarding tested and confirmed" {...toggle("forwarding")} />
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Peripherals</div>
      <div className="toggle-grid cols-3">
        <Toggle label="LPR (Licence Plate Recognition)" {...toggle("lpr")} />
        <Toggle label="Barcode" {...toggle("barcode")} />
        <Toggle label="LFK (remote key fob)" {...toggle("lfk")} />
      </div>
    </div>
  );
}
