import { PROJECTS, STATUS_MAP } from "../../../data/projects";
import { Icon } from "../../../components/Icon";

export function ReviewQueueView() {
  return (
  <div className="fade-in">
    <div className="page-header">
      <div className="page-title">Review Queue</div>
      <div className="page-desc">Submissions awaiting review or Sales payment confirmation.</div>
    </div>

    {/* S&B Technical Review */}
    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, marginTop: 4 }}>
      S&amp;B Technical Review
    </div>
    {PROJECTS.filter(p => p.status === "review").map(p => (
      <div key={p.id} className="project-card" style={{ marginBottom: 10, cursor: "default" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div className="project-name">{p.name}</div>
            <span className={`badge ${STATUS_MAP[p.status].cls}`}>{STATUS_MAP[p.status].label}</span>
          </div>
          <div className="project-meta"><span>Partner: {p.partner}</span><span>PSP: {p.psp}</span></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" style={{ fontSize: 12 }}><Icon name="eye" size={12} /> Review</button>
          <button className="btn btn-primary" style={{ fontSize: 12, background: "var(--green)" }}><Icon name="check" size={12} /> Approve</button>
        </div>
      </div>
    ))}

    {/* Sales Payment Approval */}
    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, marginTop: 20 }}>
      Awaiting Sales Payment Confirmation
    </div>
    {PROJECTS.filter(p => p.status === "sales-approval").map(p => (
      <div key={p.id} className="project-card" style={{ marginBottom: 10, cursor: "default", borderLeft: "3px solid #C0185A" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div className="project-name">{p.name}</div>
            <span className={`badge ${STATUS_MAP[p.status].cls}`}>{STATUS_MAP[p.status].label}</span>
          </div>
          <div className="project-meta"><span>Partner: {p.partner}</span><span>PSP: {p.psp}</span><span>Assigned to: Anna Krüger (Sales)</span></div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--gray-400)" }}>⏳ Waiting for payment confirmation</span>
          <button className="btn btn-primary" style={{ fontSize: 12, background: "#C0185A", border: "none" }}>
            💳 Confirm Payment
          </button>
        </div>
      </div>
    ))}
  </div>
  );
}
