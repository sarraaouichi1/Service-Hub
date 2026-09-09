import { PATCH_BULLETINS } from "../../../data/patch";

/** Bulletins staged for a maintenance window but not yet deployed. */
const SCHEDULED_BULLETINS = PATCH_BULLETINS.filter(
  b => b.status === "scheduled" || b.status === "pending",
);

export function PatchScheduleView() {
  return (
  <div className="patch-fade">
    <div className="patch-page-header">
      <div>
        <div className="patch-page-title">Patch Schedule</div>
        <div className="patch-page-desc">Updates staged for an upcoming maintenance window.</div>
      </div>
    </div>
    <div className="patch-table-card">
      <div className="patch-table-head" style={{ gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr 90px" }}>
        {["Bulletin / Name", "Severity", "Released", "Systems", "Stage", "Action"].map(h => (
          <div key={h} className="patch-th">{h}</div>
        ))}
      </div>
      {SCHEDULED_BULLETINS.map(b => (
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
            <button className="p-btn p-btn-secondary p-btn-sm">Reschedule</button>
          </div>
        </div>
      ))}
      {SCHEDULED_BULLETINS.length === 0 && (
        <div style={{ padding: "28px 20px", textAlign: "center", fontSize: 13, color: "#95A3B8" }}>
          Nothing scheduled — every bulletin is deployed or in testing.
        </div>
      )}
    </div>
  </div>
  );
}
