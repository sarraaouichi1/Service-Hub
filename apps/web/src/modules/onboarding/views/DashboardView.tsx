import { useNavigate } from "@tanstack/react-router";
import { STATUS_COLOR, STATUS_MAP, countByStatus, progressPct } from "../../../data/display";
import { Icon } from "../../../components/Icon";
import { AsyncSection } from "../../../components/AsyncSection";
import { useProductLookup, useProjects } from "../../../queries";
import { Can } from "../../auth/Can";
import { clickable } from "../../../components/clickable";
import { useOnboarding } from "../context/onboardingContext";
import type { Project } from "../../../types";

export function DashboardView() {
  const navigate = useNavigate();
  const { currentUser, resetDraft } = useOnboarding();
  const projects = useProjects();
  const productById = useProductLookup();

  const openProject = (p: Project) =>
    navigate({ to: "/onboarding/wizard/$step", params: { step: String(p.step) }, search: { project: p.id } });

  const startNewOnboarding = () => {
    resetDraft();
    navigate({ to: "/onboarding/wizard/$step", params: { step: "0" }, search: { project: undefined } });
  };

  return (
  <div className="fade-in">
    <div className="page-header">
      <div className="page-title">Good morning, {currentUser.name.split(' ')[0]} 👋</div>
      <div className="page-desc">Here's an overview of your onboarding projects.</div>
    </div>
    <AsyncSection query={projects} label="projects">
      {(list) => (<>
    <div className="stat-grid" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
      <div className="stat-card">
        <div className="stat-label">Total Projects</div>
        <div className="stat-value">{list.length}</div>
        <div className="stat-change up">↑ 2 this month</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">In Progress</div>
        <div className="stat-value">{countByStatus(list, "progress")}</div>
        <div className="stat-change pending">Awaiting data</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Pending Review</div>
        <div className="stat-value">{countByStatus(list, "review")}</div>
        <div className="stat-change" style={{ color: "var(--blue)" }}>In S&B queue</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Sales Approval</div>
        <div className="stat-value" style={{ color: "#C0185A" }}>{countByStatus(list, "sales-approval")}</div>
        <div className="stat-change" style={{ color: "#C0185A" }}>Awaiting payment</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Approved</div>
        <div className="stat-value">{countByStatus(list, "approved")}</div>
        <div className="stat-change up">–</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Onboarded</div>
        <div className="stat-value" style={{ color: "#7C3AED" }}>{countByStatus(list, "onboarded")}</div>
        <div className="stat-change" style={{ color: "#7C3AED" }}>↑ 1 this month</div>
      </div>
    </div>
    <div className="section-header">
      <div className="section-title">Recent Projects</div>
      <Can permission="project:create">
        <button className="btn btn-primary" onClick={startNewOnboarding}>
          <Icon name="plus" /> New Onboarding
        </button>
      </Can>
    </div>
    <div className="project-grid">
      {list.map(p => (
        <div key={p.id} className="project-card" {...clickable(() => openProject(p))}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div className="project-name">{p.name}</div>
              <span className={`badge ${STATUS_MAP[p.status].cls}`}>{STATUS_MAP[p.status].label}</span>
            </div>
            <div className="project-meta">
              <span>🏢 {p.partner}</span>
              <span>💳 {p.psp}</span>
              <span>👤 {p.pm}</span>
              <span style={{ fontWeight: 700, color: productById[p.product]?.color }}>{productById[p.product]?.name ?? p.product}</span>
            </div>
            <div className="project-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPct(p)}%`, background: STATUS_COLOR[p.status] }} />
              </div>
              <div className="progress-label">Step {p.step} of {p.total} · {progressPct(p)}% complete</div>
            </div>
          </div>
          <Icon name="chevronRight" color="var(--gray-400)" />
        </div>
      ))}
    </div>
      </>)}
    </AsyncSection>
  </div>
  );
}
