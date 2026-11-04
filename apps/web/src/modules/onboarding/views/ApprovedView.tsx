import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { STATUS_MAP } from "../../../data/display";
import { Icon } from "../../../components/Icon";
import { useProjects, useUpdateProject } from "../../../queries";
import { ProjectMeta } from "../components/ProjectMeta";
import { useAuth } from "../../auth/useAuth";
import type { Project, ProjectStatus } from "../../../types";

/** Statuses shown on this screen, in workflow order. */
const APPROVED_STATUSES: ProjectStatus[] = ["approved", "onboarded"];

export function ApprovedView() {
  const navigate = useNavigate();
  const allProjects = useProjects();
  const { user, can } = useAuth();
  const [failure, setFailure] = useState<string | null>(null);

  const canDeploy = can("project:deploy");

  const advance = useUpdateProject({
    onSuccess: () => setFailure(null),
    onError: (error) => setFailure(error.message),
  });

  const openProject = (p: Project) =>
    navigate({ to: "/onboarding/wizard/$step", params: { step: String(p.step) }, search: { project: p.id } });

  if (!canDeploy && !user?.roles?.includes("Admin")) {
    return (
      <div className="fade-in">
        <div className="page-header">
          <div className="page-title">Ready for deployment</div>
          <div className="page-desc">Dedicated to DevOps Team members.</div>
        </div>
        <div className="callout callout-warning">
          <Icon name="shield" size={18} />
          <div>
            <strong>Access Restricted</strong>
            <p style={{ margin: "4px 0 0 0", fontSize: 13 }}>
              This section is dedicated exclusively to the <strong>DevOps Team</strong> for deploying approved customer installations. Project Managers and Sales roles do not have deployment clearance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Ready for deployment</div>
        <div className="page-desc">
          DevOps workspace — Deploy customer installations that have cleared Sales Delivery Confirmation, and monitor live systems.
        </div>
      </div>

      <div className="callout callout-info" style={{ marginBottom: 20 }}>
        <Icon name="info" size={18} />
        <div>
          <strong>DevOps Deployment Workspace</strong>
          <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "var(--gray-700)" }}>
            Projects listed here have completed full sales and delivery validation. The DevOps team performs system provisioning, parameter setup, and marks installations as live and onboarded.
          </p>
        </div>
      </div>

      {failure && <div className="error-msg" role="alert" style={{ marginBottom: 16 }}>⚠ {failure}</div>}

      {APPROVED_STATUSES.map(status => {
        const projects = (allProjects.data ?? []).filter(p => p.status === status);
        const isApproved = status === "approved";
        return (
          <div key={status} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
              {STATUS_MAP[status].label} ({projects.length})
            </div>
            {projects.length === 0 ? (
              <div style={{ background: "white", border: "1px dashed var(--gray-200)", borderRadius: 10, padding: "24px", fontSize: 13, color: "var(--gray-400)", textAlign: "center" }}>
                No projects in this stage yet.
              </div>
            ) : projects.map(p => (
              <div key={p.id} className="project-card" style={{ marginBottom: 12, cursor: "default", borderLeft: `4px solid ${isApproved ? "var(--green)" : "var(--blue)"}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div className="project-name">{p.name}</div>
                    <span className={`badge ${STATUS_MAP[p.status].cls}`}>{STATUS_MAP[p.status].label}</span>
                    <span style={{ fontSize: 11, color: "var(--gray-500)", background: "var(--gray-100)", padding: "2px 8px", borderRadius: 4 }}>
                      Product: {p.product}
                    </span>
                  </div>
                  <ProjectMeta project={p} />
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => openProject(p)}>
                    <Icon name="eye" size={13} /> View Specs
                  </button>
                  {isApproved && (
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: 12, background: "var(--green)", borderColor: "var(--green)" }}
                      disabled={advance.isPending}
                      onClick={() => advance.mutate({ id: p.id, patch: { status: "onboarded" } })}>
                      <Icon name="check" size={13} /> {advance.isPending ? "Deploying…" : "Complete Deployment"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
