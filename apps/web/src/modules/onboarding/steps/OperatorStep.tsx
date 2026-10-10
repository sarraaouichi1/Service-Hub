import { Icon } from "../../../components/Icon";
import { Field } from "../../../components/Field";
import { Toggle } from "../../../components/Toggle";
import { useStepFields } from "./useStepFields";

export function OperatorStep() {
  const { input, toggle, message } = useStepFields();

  return (
    <div className="slide-in">
      <div className="notif-bar">
        <Icon name="zap" size={14} color="var(--color-warning-text)" />
        Fields marked with a red asterisk are required before you can advance to the next step.
      </div>
      <div className="form-grid">
        <Field label="Operator Name" required error={message("opName")}>
          <input {...input("opName")} placeholder="e.g. Medway Hospital NHS Trust" />
        </Field>
        <Field label="Operator ID" hint="Assigned by S&B" error={message("opId")}>
          <input {...input("opId", "mono")} placeholder="e.g. 49666" />
        </Field>
        <Field label="Operator Email" required error={message("opEmail")}>
          <input {...input("opEmail")} type="email" placeholder="name@organisation.com" />
        </Field>
        <Field label="Technical Support Email" error={message("techEmail")}>
          <input {...input("techEmail")} type="email" placeholder="it-support@organisation.com" />
        </Field>
        <Field label="Phone Number" error={message("phone")}>
          <input {...input("phone")} placeholder="+44 1634 833 988" />
        </Field>
        <Field label="Parking System Version" hint="Minimum: V2R5M5" error={message("version")}>
          <input {...input("version", "mono")} placeholder="e.g. V3R0M4" />
        </Field>
        <Field label="Static Public IP Address" required error={message("ip")} hint="External IP of the cell computer">
          <input {...input("ip", "mono")} placeholder="195.171.142.1" />
        </Field>
        <Field label="Communication Port" hint="Standard: 8443" error={message("port")}>
          <input {...input("port", "mono")} placeholder="8443" />
        </Field>
        <Field label="Operator Domain / URL" hint="IP:Port or domain name" span2 error={message("domain")}>
          <input {...input("domain")} placeholder="204.96.89.10 or carpark.organisation.com" />
        </Field>
        <Field label="Operator Address" span2 error={message("address")}>
          <input {...input("address")} placeholder="Street, City, Country" />
        </Field>
      </div>
      <div style={{ marginTop: 18, display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
        <Toggle label="Cell reachable from outside network" sub="Confirm after testing the static IP" {...toggle("reachable")} />
        <Toggle label="Network communication forwarding set" sub="Port forwarding tested and confirmed" {...toggle("forwarding")} />
      </div>
    </div>
  );
}
