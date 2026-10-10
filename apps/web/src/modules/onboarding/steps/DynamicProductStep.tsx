import { Field } from "../../../components/Field";
import { Icon } from "../../../components/Icon";
import { Toggle } from "../../../components/Toggle";
import { PRODUCT_FORM_SCHEMAS } from "../data/productFormSchemas";
import { useStepFields } from "./useStepFields";
import type { ProductFieldSchema } from "../data/productFormSchemas";

interface Props {
  stepIndex: number; // 1 = Step 2, 2 = Step 3, 3 = Step 4, 4 = Step 5
}

export function DynamicProductStep({ stepIndex }: Props) {
  const { values, input, toggle, message } = useStepFields();

  const selectedProductId = values.product || "smart-web-pay";
  const schema = PRODUCT_FORM_SCHEMAS[selectedProductId] || PRODUCT_FORM_SCHEMAS["smart-web-pay"];
  
  // Find step schema corresponding to current wizard step index (0-indexed within schema.steps)
  const schemaStepIdx = Math.min(stepIndex - 1, schema.steps.length - 1);
  const stepSchema = schema.steps[schemaStepIdx];

  if (!stepSchema) {
    return null;
  }

  const renderField = (f: ProductFieldSchema) => {
    const errorMsg = message(f.id as any);

    if (f.type === "boolean") {
      return (
        <Toggle
          key={f.id}
          label={f.label}
          sub={f.hint || `Enable or disable ${f.label}`}
          {...toggle(f.id as any)}
        />
      );
    }

    const inputProps = input(f.id as any);

    return (
      <Field key={f.id} label={f.label} required={f.required} hint={f.hint} error={errorMsg}>
        {f.type === "select" ? (
          <select {...inputProps}>
            <option value="">-- Select {f.label} --</option>
            {f.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : f.type === "textarea" ? (
          <textarea
            rows={3}
            {...inputProps}
            placeholder={f.placeholder}
          />
        ) : (
          <input
            type={f.type === "password" ? "password" : f.type === "email" ? "email" : f.type === "number" ? "number" : "text"}
            {...inputProps}
            className={`form-input${f.type === "password" || f.id.toLowerCase().includes("id") || f.id.toLowerCase().includes("ip") ? " mono" : ""}`}
            placeholder={f.placeholder}
          />
        )}
      </Field>
    );
  };

  const textFields = stepSchema.fields.filter((f) => f.type !== "boolean");
  const boolFields = stepSchema.fields.filter((f) => f.type === "boolean");

  return (
    <div className="slide-in">
      {/* Product & Excel Source Header Tag */}
      <div
        style={{
          marginBottom: 20,
          padding: "12px 16px",
          background: "var(--blue-pale)",
          border: "1px solid var(--blue-mid)",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 13,
          color: "var(--navy)",
        }}
      >
        <div>
          <span style={{ fontWeight: 700, color: "var(--blue-bright)" }}>
            📦 Product: {schema.productName}
          </span>
          <span style={{ marginLeft: 8, color: "var(--gray-600)" }}>
            — {stepSchema.title}: {stepSchema.description}
          </span>
        </div>
        <div style={{ fontSize: 11, background: "white", padding: "3px 8px", borderRadius: 4, border: "1px solid var(--gray-200)", color: "var(--gray-600)" }}>
          Source: {schema.excelSource}
        </div>
      </div>

      <div className="notif-bar">
        <Icon name="zap" size={14} color="#B07800" />
        Fields marked with a red asterisk are required for <strong>{schema.productName}</strong> before you can advance.
      </div>

      {/* Main Text / Select Form Fields */}
      <div className="form-grid">
        {textFields.map(renderField)}
      </div>

      {/* Boolean Toggles Section */}
      {boolFields.length > 0 && (
        <div style={{ marginTop: 20, display: "grid", gap: 12, gridTemplateColumns: boolFields.length > 1 ? "1fr 1fr" : "1fr" }}>
          {boolFields.map(renderField)}
        </div>
      )}
    </div>
  );
}
