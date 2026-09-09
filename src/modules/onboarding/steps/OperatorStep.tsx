import type { ChangeEvent } from "react";
import type { FormTextKey, OperatorStepProps } from "../../../types";
import { Icon } from "../../../components/Icon";
import { Field } from "../../../components/Field";
import { Toggle } from "../../../components/Toggle";

/**
 * Per-field validators. Each returns a message, or undefined when the value is
 * acceptable. Keeping them in a lookup means validating one field can only ever
 * affect that field's error.
 */
const VALIDATORS: Partial<Record<FormTextKey, (val: string) => string | undefined>> = {
  ip: (val) =>
    /^\d{1,3}(\.\d{1,3}){3}$/.test(val) ? undefined : "Must be a valid IPv4 address",
  port: (val) => {
    const port = Number(val);
    return Number.isNaN(port) || port < 1 || port > 65535
      ? "Port must be between 1 and 65535"
      : undefined;
  },
};

export function OperatorStep({ data, setData, errors, setErrors }: OperatorStepProps) {
  /**
   * Validate a single field.
   *
   * The previous version re-ran every rule on every keystroke with an
   * `else delete errs.<other>` fallthrough, so typing in any unrelated field
   * (the operator name, say) wiped an existing IP or port error.
   */
  const validate = (field: FormTextKey, val: string) => {
    const validator = VALIDATORS[field];
    if (!validator) return;
    const message = val ? validator(val) : undefined;
    setErrors((prev) => {
      if (prev[field] === message) return prev;
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };

  const f = (key: FormTextKey) => ({
    value: data[key] || "",
    onChange: (e: ChangeEvent<HTMLInputElement>) => { setData({ ...data, [key]: e.target.value }); validate(key, e.target.value); },
    className: `form-input${errors[key] ? " error" : data[key] ? " valid" : ""}`
  });

  return (
    <div className="slide-in">
      <div className="notif-bar">
        <Icon name="zap" size={14} color="#B07800" />
        Fields marked with a red asterisk are required before you can advance to the next step.
      </div>
      <div className="form-grid">
        <Field label="Operator Name" required><input {...f("opName")} placeholder="e.g. Medway Hospital NHS Trust" /></Field>
        <Field label="Operator ID" hint="Assigned by S&B"><input {...f("opId")} placeholder="e.g. 49666" className={f("opId").className + " mono"} /></Field>
        <Field label="Operator Email" required><input {...f("opEmail")} type="email" placeholder="name@organisation.com" /></Field>
        <Field label="Technical Support Email"><input {...f("techEmail")} type="email" placeholder="it-support@organisation.com" /></Field>
        <Field label="Phone Number"><input {...f("phone")} placeholder="+44 1634 833 988" /></Field>
        <Field label="Parking System Version" hint="Minimum: V2R5M5"><input {...f("version")} placeholder="e.g. V3R0M4" className={f("version").className + " mono"} /></Field>
        <Field label="Static Public IP Address" required error={errors.ip} hint="External IP of the cell computer">
          <input {...f("ip")} placeholder="195.171.142.1" className={`form-input mono${errors.ip ? " error" : data.ip ? " valid" : ""}`} />
        </Field>
        <Field label="Communication Port" hint="Standard: 8443" error={errors.port}>
          <input {...f("port")} placeholder="8443" className={`form-input mono${errors.port ? " error" : data.port ? " valid" : ""}`} />
        </Field>
        <Field label="Operator Domain / URL" hint="IP:Port or domain name" span2>
          <input {...f("domain")} placeholder="204.96.89.10 or carpark.organisation.com" />
        </Field>
        <Field label="Operator Address" span2>
          <input {...f("address")} placeholder="Street, City, Country" />
        </Field>
      </div>
      <div style={{ marginTop: 18, display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
        <Toggle label="Cell reachable from outside network" sub="Confirm after testing the static IP" value={data.reachable} onChange={v => setData({ ...data, reachable: v })} />
        <Toggle label="Network communication forwarding set" sub="Port forwarding tested and confirmed" value={data.forwarding} onChange={v => setData({ ...data, forwarding: v })} />
      </div>
    </div>
  );
}
