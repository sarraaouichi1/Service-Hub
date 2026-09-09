import { useState } from "react";
import type { ValidationRule } from "../../../types";
import { INITIAL_RULES, RULE_CATEGORY_BG, RULE_CATEGORY_FG } from "../../../data/validationRules";

export function AdminRules() {
  const [rules, setRules] = useState<ValidationRule[]>(INITIAL_RULES);

  const [editing, setEditing] = useState<number | null>(null);

  const toggleActive = (id: number) => setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  const toggleSeverity = (id: number) => setRules(rules.map(r => r.id === id ? { ...r, severity: r.severity === "error" ? "warning" : "error" } : r));


  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="page-title">Validation Rules</div>
          <div className="page-desc">Configure field-level rules enforced during onboarding. Changes take effect immediately.</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ padding: "8px 14px", background: "#FEECEC", borderRadius: 7, fontSize: 12, color: "var(--red)", fontWeight: 600 }}>
            {rules.filter(r => r.severity === "error" && r.active).length} Hard rules
          </div>
          <div style={{ padding: "8px 14px", background: "#FEF9EC", borderRadius: 7, fontSize: 12, color: "#B07800", fontWeight: 600 }}>
            {rules.filter(r => r.severity === "warning" && r.active).length} Soft warnings
          </div>
        </div>
      </div>

      {/* Rules table */}
      <div style={{ background: "white", border: "1px solid var(--gray-200)", borderRadius: 10, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr 100px 90px 60px", padding: "10px 18px", background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
          {["Field", "Category", "Type", "Rule / Pattern", "Severity", "Status", ""].map((h, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</div>
          ))}
        </div>
        {rules.map((r, i) => (
          <div key={r.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr 100px 90px 60px", padding: "13px 18px", borderBottom: i < rules.length - 1 ? "1px solid var(--gray-100)" : "none", alignItems: "center", opacity: r.active ? 1 : 0.5, transition: "opacity 0.2s" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{r.field}</div>
              <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>{r.description}</div>
            </div>
            <div>
              <span style={{ background: RULE_CATEGORY_BG[r.category], color: RULE_CATEGORY_FG[r.category], fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>{r.category}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--gray-600)" }}>{r.type}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--gray-600)", background: "var(--gray-50)", padding: "3px 8px", borderRadius: 5 }}>{r.pattern}</div>
            <div>
              <span
                style={{ cursor: "pointer", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: r.severity === "error" ? "#FEECEC" : "#FEF9EC", color: r.severity === "error" ? "var(--red)" : "#B07800" }}
                onClick={() => toggleSeverity(r.id)}
                title="Click to toggle severity"
              >
                {r.severity === "error" ? "⛔ Hard" : "⚠ Soft"}
              </span>
            </div>
            <div>
              <button
                style={{ background: r.active ? "#E8FAF1" : "var(--gray-100)", color: r.active ? "var(--green)" : "var(--gray-400)", border: "none", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                onClick={() => toggleActive(r.id)}
              >
                {r.active ? "● Active" : "○ Off"}
              </button>
            </div>
            <div>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", fontSize: 16, lineHeight: 1 }} title="Edit" onClick={() => setEditing(r.id === editing ? null : r.id)}>✏</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--blue-pale)", borderRadius: 8, fontSize: 12, color: "var(--blue)" }}>
        <strong>Tip:</strong> Hard rules block submission until fixed. Soft warnings allow the user to proceed with a confirmation. Click the severity badge to toggle between them.
      </div>
    </div>
  );
}
