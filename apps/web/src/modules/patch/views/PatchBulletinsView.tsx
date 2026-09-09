import { PATCH_BULLETINS } from "../../../data/patch";

export function PatchBulletinsView() {
  return (
  <div className="patch-fade">
    <div className="patch-page-header">
      <div>
        <div className="patch-page-title">Patch Bulletins</div>
        <div className="patch-page-desc">Microsoft security updates sourced via WSUS — reviewed and staged for deployment.</div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="p-btn p-btn-secondary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Sync WSUS
        </button>
        <button className="p-btn p-btn-primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Deploy Selected
        </button>
      </div>
    </div>
    <div className="patch-table-card">
      <div className="patch-table-head">
        {["Bulletin / Name", "Severity", "Released", "Systems", "Status", "Action"].map(h => (
          <div key={h} className="patch-th">{h}</div>
        ))}
      </div>
      {PATCH_BULLETINS.map(b => (
        <div key={b.id} className="patch-table-row">
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0B1F3A" }}>{b.name}</div>
            <div style={{ fontSize: 11, color: "#95A3B8", fontFamily: "monospace", marginTop: 2 }}>{b.id} · {b.risk}</div>
          </div>
          <div><span className={"patch-sev sev-" + b.severity.toLowerCase()}>{b.severity}</span></div>
          <div style={{ fontSize: 13, color: "#5A6880" }}>{b.released}</div>
          <div style={{ fontSize: 13, color: "#0B1F3A", fontWeight: 600 }}>{b.systems} endpoints</div>
          <div><span className={"patch-pill pp-" + b.status}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span></div>
          <div>
            <button className="p-btn p-btn-secondary p-btn-sm">
              {b.status === "pending" ? "Deploy" : b.status === "testing" ? "Approve" : "View"}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
  );
}
