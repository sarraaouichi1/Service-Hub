import { Icon } from "../../../components/Icon";
import { Field } from "../../../components/Field";
import { Toggle } from "../../../components/Toggle";
import { useStepFields } from "./useStepFields";

export function OperatorStep() {
  const { input, toggle, message, values } = useStepFields();
  const selectedStr = (values.product as string) || "";
  const selectedList = selectedStr ? selectedStr.split(",").filter(Boolean) : [];

  return (
    <div className="slide-in">
      <div className="notif-bar">
        <Icon name="zap" size={14} color="var(--color-warning-text)" />
        Fields marked with a red asterisk are required before you can advance to the next step. Numeric fields must contain valid numbers.
      </div>
      <div className="form-grid">
        <Field label="Operator Name" required error={message("opName")} hint="Shared across all products">
          <input {...input("opName")} placeholder="e.g. Medway Hospital NHS Trust" />
        </Field>
        <Field label="Operator ID" hint="Unique numeric ID, e.g. 46722" error={message("opId")}>
          <input {...input("opId", "mono")} placeholder="e.g. 46722" />
        </Field>
        <Field label="Operator Email" required error={message("opEmail")} hint="Shared primary email">
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
        <Field label="Communication Port" hint="Standard: 8443 (1–65535)" error={message("port")}>
          <input {...input("port", "mono")} placeholder="8443" />
        </Field>
        <Field label="Operator Domain / URL" hint="IP:Port or domain name" span2 error={message("domain")}>
          <input {...input("domain")} placeholder="204.96.89.10 or carpark.organisation.com" />
        </Field>
        <Field label="Operator Address" span2 error={message("address")}>
          <input {...input("address")} placeholder="Street, City, Country" />
        </Field>

        {/* Conditional section if entervo connect is selected */}
        {selectedList.includes("entervo-connect") && (
          <div style={{ gridColumn: "span 2", marginTop: 8, padding: "14px 16px", background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🔗 entervo connect — Partner & Contact Person</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--purple)", background: "#EDE9FE", padding: "2px 8px", borderRadius: 4 }}>Product Specific</span>
            </div>
            <div className="form-grid">
              <Field label="Provider ID" hint="Unique number > 100 for car park operator" error={message("providerId")}>
                <input {...input("providerId", "mono")} placeholder="e.g. 101" />
              </Field>
              <Field label="Contact Person Email" error={message("contactEmail")}>
                <input {...input("contactEmail")} type="email" placeholder="contact@organisation.com" />
              </Field>
              <Field label="Contact Phone" error={message("contactPhone")}>
                <input {...input("contactPhone")} placeholder="+49 123 456789" />
              </Field>
            </div>
          </div>
        )}

        {/* Conditional section if smart validation is selected */}
        {selectedList.includes("smart-validation") && (
          <div style={{ gridColumn: "span 2", marginTop: 8, padding: "14px 16px", background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span>✅ entervo smart validation — Tenant Identity</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--green)", background: "#E8FAF1", padding: "2px 8px", borderRadius: 4 }}>Product Specific</span>
            </div>
            <div className="form-grid">
              <Field label="Tenant Shortname" hint="Max 20 chars, small letters/numbers only (URL part)" error={message("tenantShortname")}>
                <input {...input("tenantShortname", "mono")} placeholder="e.g. centralgarage" />
              </Field>
              <Field label="Tenant Description" error={message("tenantDescription")}>
                <input {...input("tenantDescription")} placeholder="e.g. Central Garage Customer Validation" />
              </Field>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 18, display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
        <Toggle label="Cell reachable from outside network" sub="Confirm after testing the static IP" {...toggle("reachable")} />
        <Toggle label="Network communication forwarding set" sub="Port forwarding tested and confirmed" {...toggle("forwarding")} />
      </div>
    </div>
  );
}
