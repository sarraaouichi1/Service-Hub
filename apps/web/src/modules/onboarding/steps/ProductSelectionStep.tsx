import { clickable } from "../../../components/clickable";
import { AsyncSection } from "../../../components/AsyncSection";
import { useProducts, useSaveDraft } from "../../../queries";
import { useStepFields } from "./useStepFields";
import { useFormContext } from "react-hook-form";
import type { OnboardingForm } from "../../../types";

export function ProductSelectionStep() {
  const products = useProducts();
  const { values, choose, message, register } = useStepFields();
  const { getValues } = useFormContext<OnboardingForm>();
  const saveDraft = useSaveDraft();

  const selectedStr = (values.product as string) || "";
  // Split multiple products by comma (e.g. "smart-web-pay,entervo-connect")
  const selectedList = selectedStr ? selectedStr.split(",").filter(Boolean) : [];
  const error = message("product");

  const toggleProduct = (id: string) => {
    let nextList: string[];
    if (selectedList.includes(id)) {
      nextList = selectedList.filter(item => item !== id);
    } else {
      nextList = [...selectedList, id];
    }

    const nextProductVal = nextList.join(",");
    choose("product", nextProductVal);

    // Keep names in sync
    const allProducts = products.data ?? [];
    const nextNames = nextList
      .map(pId => allProducts.find(p => p.id === pId)?.name || pId)
      .join(", ");
    choose("productName", nextNames);

    // Auto-save draft in DB so already filled matching fields are never lost
    saveDraft.mutate(getValues());
  };

  const startingProductObj = (products.data ?? []).find(p => p.id === selectedList[0]);

  return (
    <div className="slide-in">
      <input type="hidden" {...register("product")} />
      <div style={{ marginBottom: 16, padding: "12px 16px", background: "var(--blue-pale)", border: "1px solid var(--blue-mid)", borderRadius: 8, fontSize: 13, color: "var(--blue)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          Select one or more <strong>entervo smart</strong> products you want to onboard. All fields are stored in the database, and matching fields are automatically synchronized so you never fill them twice.
        </div>
        {selectedList.length > 0 && (
          <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: "var(--navy)", color: "white", flexShrink: 0, marginLeft: 12 }}>
            {selectedList.length} Selected
          </span>
        )}
      </div>

      {/* Starting product hint callout */}
      {selectedList.length > 0 && (
        <div style={{
          marginBottom: 20,
          padding: "14px 18px",
          background: "linear-gradient(135deg, #1A6FD40D, #7C3AED0D)",
          border: "1.5px solid var(--blue-mid)",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "var(--navy)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
          }}>
            🎯
          </div>
          <div style={{ flex: 1, fontSize: 13, lineHeight: 1.5 }}>
            <div style={{ color: "var(--navy)", fontWeight: 700, fontSize: 13.5 }}>
              Starting Product: You will begin with <span style={{ color: "var(--blue)", textDecoration: "underline" }}>{startingProductObj?.name || selectedList[0]}</span>
            </div>
            <div style={{ color: "var(--gray-600)", fontSize: 12, marginTop: 2 }}>
              💡 <strong>Smart Data Persistence:</strong> Any information you provide in the next steps (Operator info, Cell Computer, Facilities, Address, Country) will be saved in the database. When you complete this configuration, any shared fields are pre-filled automatically for your other selected products!
            </div>
          </div>
        </div>
      )}

      <AsyncSection query={products} label="products">
        {(list) => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {list.map(p => {
          const isSelected = selectedList.includes(p.id);
          const isStartingProduct = isSelected && selectedList[0] === p.id;
          const selectionOrder = selectedList.indexOf(p.id) + 1;

          return (
            <div key={p.id}
              {...clickable(() => toggleProduct(p.id))}
              style={{
                border: `2px solid ${isSelected ? p.color : "var(--gray-200)"}`,
                borderRadius: 12,
                padding: "20px 22px",
                cursor: "pointer",
                transition: "all 0.15s",
                background: isSelected ? p.bg : "white",
                boxShadow: isSelected ? `0 0 0 4px ${p.color}18` : "var(--shadow-sm)",
                position: "relative",
              }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, border: `1px solid ${p.color}30` }}>
                  {p.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>{p.name}</div>
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      border: `1.5px solid ${isSelected ? p.color : "var(--gray-300)"}`,
                      background: isSelected ? p.color : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: "auto",
                      transition: "all 0.15s"
                    }}>
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </div>
                  </div>

                  {/* Product Order / Starting Hint Tag */}
                  {isSelected && (
                    <div style={{ marginBottom: 8 }}>
                      {isStartingProduct ? (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "var(--navy)", color: "white" }}>
                          ⭐ 1st • Starting Product
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "var(--color-surface-muted)", color: "var(--color-text-muted)" }}>
                          #{selectionOrder} in multi-product batch (Auto-syncs shared data)
                        </span>
                      )}
                    </div>
                  )}

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
          );
        })}
      </div>
        )}
      </AsyncSection>
      {/* Validation state */}
      {error ? (
        <div className="error-msg" role="alert" style={{ marginTop: 20, justifyContent: "center", textAlign: "center" }}>
          ⚠ {error}
        </div>
      ) : selectedList.length === 0 && (
        <div style={{ marginTop: 20, padding: "10px 16px", background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 12, color: "var(--gray-400)", textAlign: "center" }}>
          Please select one or more entervo smart products above to continue
        </div>
      )}
    </div>
  );
}
