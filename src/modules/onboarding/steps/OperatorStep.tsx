import type { ValidatedStepProps } from "../../../types";
import { Icon } from "../../../components/Icon";
import { Field } from "../../../components/Field";
import { Toggle } from "../../../components/Toggle";
import { createFieldBinder } from "./fieldBinder";

export function OperatorStep({ data, setData, errors, setErrors, step }: ValidatedStepProps) {
  const { input } = createFieldBinder(step, data, setData, errors, setErrors);

  return (
    <div className="slide-in">
      <div className="notif-bar">
        <Icon name="zap" size={14} color="#B07800" />
        Fields marked with a red asterisk are required before you can advance to the next step.
      </div>
      <div className="form-grid">
        <Field label="Operator Name" required error={errors.opName}>
          <input {...input("opName")} placeholder="e.g. Medway Hospital NHS Trust" />
        </Field>
        <Field label="Operator ID" hint="Assigned by S&B" error={errors.opId}>
          <input {...input("opId", "mono")} placeholder="e.g. 49666" />
        </Field>
        <Field label="Operator Email" required error={errors.opEmail}>
          <input {...input("opEmail")} type="email" placeholder="name@organisation.com" />
        </Field>
        <Field label="Technical Support Email" error={errors.techEmail}>
          <input {...input("techEmail")} type="email" placeholder="it-support@organisation.com" />
        </Field>
        <Field label="Phone Number" error={errors.phone}>
          <input {...input("phone")} placeholder="+44 1634 833 988" />
        </Field>
        <Field label="Parking System Version" hint="Minimum: V2R5M5" error={errors.version}>
          <input {...input("version", "mono")} placeholder="e.g. V3R0M4" />
        </Field>
        <Field label="Static Public IP Address" required error={errors.ip} hint="External IP of the cell computer">
          <input {...input("ip", "mono")} placeholder="195.171.142.1" />
        </Field>
        <Field label="Communication Port" hint="Standard: 8443" error={errors.port}>
          <input {...input("port", "mono")} placeholder="8443" />
        </Field>
        <Field label="Operator Domain / URL" hint="IP:Port or domain name" span2 error={errors.domain}>
          <input {...input("domain")} placeholder="204.96.89.10 or carpark.organisation.com" />
        </Field>
        <Field label="Operator Address" span2 error={errors.address}>
          <input {...input("address")} placeholder="Street, City, Country" />
        </Field>
      </div>
      <div style={{ marginTop: 18, display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
        <Toggle label="Cell reachable from outside network" sub="Confirm after testing the static IP" value={data.reachable} onChange={v => setData({ ...data, reachable: v })} />
        <Toggle label="Network communication forwarding set" sub="Port forwarding tested and confirmed" value={data.forwarding} onChange={v => setData({ ...data, forwarding: v })} />
      </div>
    </div>
  );
}
