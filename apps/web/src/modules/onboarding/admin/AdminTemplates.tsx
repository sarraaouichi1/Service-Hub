import { useState } from "react";
import type { TemplateDraft, TemplateDraftTextKey } from "../../../types";
import { clickable } from "../../../components/clickable";
import { Icon } from "../../../components/Icon";
import { AsyncSection } from "../../../components/AsyncSection";
import {
  useCreateTemplate, useDeleteTemplate, usePsps, useTemplates, useUpdateTemplate,
} from "../../../queries";

const EMPTY_DRAFT: TemplateDraft = { title: "", country: "", lang: "", currency: "", vat: "", psp: "", status: "draft" };

export function AdminTemplates() {
  const query = useTemplates();
  const templates = query.data ?? [];
  const pspNames = (usePsps().data ?? []).map(p => p.name);
  const [selected, setSelected] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTpl, setNewTpl] = useState<TemplateDraft>(EMPTY_DRAFT);

  // Every write goes to the API and the list refreshes from it, so an edit
  // survives navigating away — which it did not when this was useState.
  const createTemplate = useCreateTemplate({
    onSuccess: () => { setShowNew(false); setNewTpl(EMPTY_DRAFT); },
  });
  const updateTemplate = useUpdateTemplate();
  const removeTemplate = useDeleteTemplate();

  const saveNew = () => {
    if (!newTpl.title) return;
    createTemplate.mutate(newTpl);
  };

  const toggleStatus = (id: number, status: "active" | "draft") =>
    updateTemplate.mutate({ id, patch: { status: status === "active" ? "draft" : "active" } });

  const deleteTemplate = (id: number) => removeTemplate.mutate(id);

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="page-title">Onboarding Templates</div>
          <div className="page-desc">Pre-configured templates that speed up onboarding for common country/PSP combinations.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Template
        </button>
      </div>

      {/* New template form */}
      {showNew && (
        <div className="fade-in" style={{ background: "white", border: "2px solid var(--blue-bright)", borderRadius: 10, padding: 24, marginBottom: 24, boxShadow: "var(--shadow)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 18 }}>New Template</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            {([
              { label: "Template Name", key: "title", placeholder: "e.g. Belgium — Default" },
              { label: "Country Code", key: "country", placeholder: "e.g. BE" },
              { label: "Language Tag", key: "lang", placeholder: "e.g. nl-BE" },
              { label: "Currency (ISO 4217)", key: "currency", placeholder: "e.g. EUR" },
              { label: "VAT %", key: "vat", placeholder: "e.g. 21" },
            ] as { label: string; key: TemplateDraftTextKey; placeholder: string }[]).map(f => (
              <div key={f.key}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-800)", marginBottom: 5 }}>{f.label}</div>
                <input
                  style={{ width: "100%", padding: "8px 12px", border: "1.5px solid var(--gray-200)", borderRadius: 7, fontFamily: "var(--font)", fontSize: 13 }}
                  placeholder={f.placeholder}
                  value={newTpl[f.key]}
                  onChange={e => setNewTpl({ ...newTpl, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-800)", marginBottom: 5 }}>Default PSP</div>
              <select
                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid var(--gray-200)", borderRadius: 7, fontFamily: "var(--font)", fontSize: 13, background: "white" }}
                value={newTpl.psp}
                onChange={e => setNewTpl({ ...newTpl, psp: e.target.value })}
              >
                <option value="">Select PSP…</option>
                {pspNames.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={saveNew}>Save Template</button>
            <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Template list */}
      <AsyncSection query={query} label="templates">
        {() => (
      <div style={{ display: "grid", gap: 10 }}>
        {templates.map(t => (
          <div key={t.id}
            style={{ background: "white", border: `1px solid ${selected === t.id ? "var(--blue-bright)" : "var(--gray-200)"}`, borderRadius: 10, padding: "16px 20px", boxShadow: "var(--shadow-sm)", cursor: "pointer", transition: "all 0.15s" }}
            {...clickable(() => setSelected(selected === t.id ? null : t.id))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--blue-pale)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {t.country === "GB" ? "🇬🇧" : t.country === "DE" ? "🇩🇪" : t.country === "NL" ? "🇳🇱" : t.country === "CH" ? "🇨🇭" : t.country === "FR" ? "🇫🇷" : "🌍"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{t.title}</div>
                  <span className={`badge ${t.status === "active" ? "badge-approved" : "badge-draft"}`}>{t.status === "active" ? "Active" : "Draft"}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 3, display: "flex", gap: 16 }}>
                  <span className="row" style={{ gap: 5 }}><Icon name="globe" size={12} /> {t.lang}</span>
                  <span className="row" style={{ gap: 5 }}><Icon name="creditCard" size={12} /> {t.currency} · VAT {t.vat}% · {t.psp}</span>
                  <span className="row" style={{ gap: 5 }}><Icon name="list" size={12} /> {t.projects} project{t.projects !== 1 ? "s" : ""}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                <button className="btn btn-secondary" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => toggleStatus(t.id, t.status)}>
                  {t.status === "active" ? "Deactivate" : "Activate"}
                </button>
                <button className="btn btn-ghost" style={{ fontSize: 11, padding: "5px 10px", color: "var(--red)" }} onClick={() => deleteTemplate(t.id)}>
                  Delete
                </button>
              </div>
            </div>

            {/* Expanded detail */}
            {selected === t.id && (
              <div className="fade-in" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--gray-100)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  { label: "Country", value: t.country },
                  { label: "Language", value: t.lang },
                  { label: "Currency", value: t.currency },
                  { label: "VAT", value: `${t.vat}%` },
                  { label: "Default PSP", value: t.psp },
                  { label: "Status", value: t.status },
                  { label: "Projects using", value: t.projects },
                  { label: "Vouchers default", value: "Off" },
                ].map((item, i) => (
                  <div key={i} style={{ background: "var(--gray-50)", borderRadius: 7, padding: "10px 14px" }}>
                    <div style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)", marginTop: 4 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
        )}
      </AsyncSection>
    </div>
  );
}
