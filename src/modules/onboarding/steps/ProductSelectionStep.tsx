import type { ValidatedStepProps } from "../../../types";
import { PRODUCTS } from "../../../data/products";
import { clickable } from "../../../components/clickable";
import { createFieldBinder } from "./fieldBinder";

export function ProductSelectionStep({ data, setData, errors, setErrors, step }: ValidatedStepProps) {
  const { clear } = createFieldBinder(step, data, setData, errors, setErrors);

  const selectProduct = (id: string, name: string) => {
    setData({ ...data, product: id, productName: name });
    clear("product");
  };

  return (
    <div className="slide-in">
      <div style={{ marginBottom: 20, padding: "12px 16px", background: "var(--blue-pale)", border: "1px solid var(--blue-mid)", borderRadius: 8, fontSize: 13, color: "var(--blue)" }}>
        Select the <strong>entervo smart</strong> product you want to onboard. The wizard steps will adapt based on your selection.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {PRODUCTS.map(p => (
          <div key={p.id}
            {...clickable(() => selectProduct(p.id, p.name))}
            style={{
              border: `2px solid ${data.product === p.id ? p.color : "var(--gray-200)"}`,
              borderRadius: 12,
              padding: "20px 22px",
              cursor: "pointer",
              transition: "all 0.15s",
              background: data.product === p.id ? p.bg : "white",
              boxShadow: data.product === p.id ? `0 0 0 4px ${p.color}18` : "var(--shadow-sm)",
            }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, border: `1px solid ${p.color}30` }}>
                {p.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>{p.name}</div>
                  {data.product === p.id && (
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--gray-600)", lineHeight: 1.5, marginBottom: 12 }}>{p.desc}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {p.fields.map((f, i) => (
                    <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: p.bg, color: p.color, border: `1px solid ${p.color}30` }}>
                      {i + 1}. {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* One slot: a neutral prompt until the user tries to advance without choosing. */}
      {errors.product ? (
        <div className="error-msg" role="alert" style={{ marginTop: 20, justifyContent: "center", textAlign: "center" }}>
          ⚠ {errors.product}
        </div>
      ) : !data.product && (
        <div style={{ marginTop: 20, padding: "10px 16px", background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 12, color: "var(--gray-400)", textAlign: "center" }}>
          Please select a product above to continue
        </div>
      )}
    </div>
  );
}
