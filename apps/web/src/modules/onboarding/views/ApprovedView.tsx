import { useNavigate } from "@tanstack/react-router";
import { STATUS_MAP } from "../../../data/display";
import { Icon } from "../../../components/Icon";
import { useProjects } from "../../../queries";
import { ProjectMeta } from "../components/ProjectMeta";
import { clickable } from "../../../components/clickable";
import type { Project, ProjectStatus } from "../../../types";

/** Statuses shown on this screen, in workflow order. */
const APPROVED_STATUSES: ProjectStatus[] = ["approved", "onboarded"];

export function ApprovedView() {
  const navigate = useNavigate();
  const allProjects = useProjects();
  const openProject = (p: Project) =>
    navigate({ to: "/onboarding/wizard/$step", params: { step: String(p.step) }, search: { project: p.id } });

  return (
  <div className="fade-in">
    <div className="page-header">
      <div className="page-title">Approved &amp; Onboarded</div>
      <div className="page-desc">Projects that have cleared S&amp;B review, and those already live.</div>
    </div>
    {APPROVED_STATUSES.map(status => {
      const projects = (allProjects.data ?? []).filter(p => p.status === status);
      return (
        <div key={status} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
            {STATUS_MAP[status].label} ({projects.length})
          </div>
          {projects.length === 0 ? (
            <div style={{ background: "white", border: "1px dashed var(--gray-200)", borderRadius: 10, padding: "20px", fontSize: 13, color: "var(--gray-400)", textAlign: "center" }}>
              No projects with this status yet.
            </div>
          ) : projects.map(p => (
            <div key={p.id} className="project-card" style={{ marginBottom: 10 }} {...clickable(() => openProject(p))}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div className="project-name">{p.name}</div>
                  <span className={`badge ${STATUS_MAP[p.status].cls}`}>{STATUS_MAP[p.status].label}</span>
                </div>
                <ProjectMeta project={p} />
              </div>
              <Icon name="chevronRight" color="var(--color-text-subtle)" />
            </div>
          ))}
        </div>
      );
    })}
  </div>
  );
}
