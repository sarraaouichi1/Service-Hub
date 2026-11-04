import { useState } from "react";
import type { PlatformConfig, PlatformConfigBoolKey, PlatformConfigTextKey } from "../../../types";
import { AsyncSection } from "../../../components/AsyncSection";
import { useAuditLog, useSettings, useUpdateSettings } from "../../../queries";

export function AdminSettings() {
  const query = useSettings();
  return (
    <AsyncSection query={query} label="settings">
      {(settings) => <SettingsForm settings={settings} />}
    </AsyncSection>
  );
}

/**
 * Loaded settings are server state; the edits in progress are not. The saved
 * values come from the query, a local draft holds unsaved changes, and saving
 * clears the draft so the form falls back to whatever the server confirmed.
 */
function SettingsForm({ settings }: { settings: PlatformConfig }) {
  const [draft, setDraft] = useState<PlatformConfig | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const auditLog = useAuditLog();
  const cfg = draft ?? settings;

  const save = useUpdateSettings({
    onSuccess: () => { setDraft(null); setFailure(null); },
    onError: (error) => setFailure(error.message),
  });

  const setCfg = (next: PlatformConfig) => setDraft(next);
  const handleSave = () => save.mutate(cfg);
  const saved = save.isSuccess && draft === null;
  const dirty = draft !== null;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Platform Settings</div>
        <div className="page-desc">Global configuration for the onboarding platform.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* General */}
        <div style={{ background: "white", border: "1px solid var(--gray-200)", borderRadius: 10, padding: 24, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid var(--gray-100)" }}>General</div>
          {([
            { label: "Platform Name", key: "platformName" },
            { label: "Support Email", key: "supportEmail" },
            { label: "Default Project Manager", key: "defaultPM" },
            { label: "Session Timeout (minutes)", key: "sessionTimeout" },
          ] as { label: string; key: PlatformConfigTextKey }[]).map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-800)", marginBottom: 5 }}>{f.label}</div>
              <input
                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid var(--gray-200)", borderRadius: 7, fontFamily: "var(--font)", fontSize: 13 }}
                value={cfg[f.key] ?? ""}
                onChange={e => setCfg({ ...cfg, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-800)", marginBottom: 5 }}>Default Export Format</div>
            <select
              style={{ width: "100%", padding: "8px 12px", border: "1.5px solid var(--gray-200)", borderRadius: 7, fontFamily: "var(--font)", fontSize: 13, background: "white" }}
              value={cfg.exportFormat}
              onChange={e => setCfg({ ...cfg, exportFormat: e.target.value })}
            >
              <option value="json">JSON (API ingestion)</option>
              <option value="excel">Excel (legacy)</option>
              <option value="pdf">PDF summary</option>
            </select>
          </div>
        </div>

        {/* Workflow & Notifications */}
        <div style={{ background: "white", border: "1px solid var(--gray-200)", borderRadius: 10, padding: 24, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid var(--gray-100)" }}>Workflow & Notifications</div>
          {([
            { label: "Notify reviewer on new submission", key: "notifyOnSubmit", sub: "Email sent to assigned reviewer" },
            { label: "Notify submitter on approval", key: "notifyOnApprove", sub: "Confirmation email to customer/partner" },
            { label: "Notify submitter on rejection", key: "notifyOnReject", sub: "Email with reviewer comments" },
            { label: "Require dual approval", key: "requireDualApproval", sub: "Two S&B reviewers must approve" },
            { label: "Auto-export on approval", key: "autoExportOnApprove", sub: "Automatically export JSON on approval" },
          ] as { label: string; key: PlatformConfigBoolKey; sub: string }[]).map(s => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--gray-50)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--navy)" }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "var(--gray-400)" }}>{s.sub}</div>
              </div>
              <button
                style={{ width: 38, height: 22, borderRadius: 11, border: "none", background: cfg[s.key] ? "var(--blue-bright)" : "var(--gray-200)", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
                onClick={() => setCfg({ ...cfg, [s.key]: !cfg[s.key] })}
              >
                <div style={{ position: "absolute", top: 3, left: cfg[s.key] ? 19 : 3, width: 16, height: 16, background: "white", borderRadius: "50%", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </button>
            </div>
          ))}
        </div>

        {/* Audit Log */}
        <div style={{ background: "white", border: "1px solid var(--gray-200)", borderRadius: 10, padding: 24, boxShadow: "var(--shadow-sm)", gridColumn: "span 2" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid var(--gray-100)" }}>Recent Audit Log</div>
          <div style={{ display: "grid", gap: 8 }}>
            {(auditLog.data ?? []).map((log, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "130px 160px 160px 1fr", gap: 12, padding: "8px 12px", background: "var(--gray-50)", borderRadius: 7, alignItems: "center" }}>
                <div style={{ fontSize: 11, color: "var(--gray-400)", fontFamily: "var(--mono)" }}>{log.time}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--navy)" }}>{log.user}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: log.color }}>{log.action}</div>
                <div style={{ fontSize: 12, color: "var(--gray-600)" }}>{log.target}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={!dirty || save.isPending}>
          {save.isPending ? "Saving…" : "Save Changes"}
        </button>
        <button className="btn btn-secondary" onClick={() => setDraft(null)} disabled={!dirty}>
          Discard changes
        </button>
        {saved && <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 600 }}>✓ Settings saved</span>}
        {dirty && !save.isPending && <span style={{ fontSize: 13, color: "var(--gray-400)" }}>Unsaved changes</span>}
        {failure && <span className="error-msg" role="alert">⚠ {failure}</span>}
      </div>
    </div>
  );
}
