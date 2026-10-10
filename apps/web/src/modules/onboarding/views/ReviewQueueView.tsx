import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { STATUS_MAP } from "../../../data/display";
import { Icon } from "../../../components/Icon";
import { Can } from "../../auth/Can";
import { AsyncSection } from "../../../components/AsyncSection";
import { useProjects, useUpdateProject } from "../../../queries";

export function ReviewQueueView() {
  const navigate = useNavigate();
  const projects = useProjects();
  const [failure, setFailure] = useState<string | null>(null);
  const inStatus = (status: string) => (projects.data ?? []).filter(p => p.status === status);

  /**
   * Advancing a submission is a status change, and the API decides who may make
   * one: approving needs `project:approve`, confirming payment needs
   * `payment:confirm`. The buttons are hidden from anyone without them, and the
   * server refuses regardless.
   */
  const advance = useUpdateProject({
    onSuccess: () => setFailure(null),
    onError: (error) => setFailure(error.message),
  });

  const openProject = (id: number, step: number) =>
    navigate({ to: "/onboarding/wizard/$step", params: { step: String(step) }, search: { project: id } });

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
    {inStatus("review").map(p => (
      <div key={p.id} className="project-card" style={{ marginBottom: 10, cursor: "default" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div className="project-name">{p.name}</div>
            <span className={`badge ${STATUS_MAP[p.status].cls}`}>{STATUS_MAP[p.status].label}</span>
          </div>
          <div className="project-meta"><span>Partner: {p.partner}</span><span>PSP: {p.psp}</span></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => openProject(p.id, p.step)}>
            <Icon name="eye" size={12} /> Review
          </button>
          <Can permission="project:approve">
            <button
              className="btn btn-primary"
              style={{ fontSize: 12, background: "var(--green)" }}
              disabled={advance.isPending}
              onClick={() => advance.mutate({ id: p.id, patch: { status: "approved" } })}>
              <Icon name="check" size={12} /> {advance.isPending ? "Approving…" : "Approve"}
            </button>
          </Can>
        </div>
      </div>
    ))}

    {/* Sales Payment Approval */}
    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, marginTop: 20 }}>
      Awaiting Sales Payment Confirmation
    </div>
    {inStatus("sales-approval").map(p => (
      <div key={p.id} className="project-card" style={{ marginBottom: 10, cursor: "default", borderLeft: "3px solid var(--status-sales)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div className="project-name">{p.name}</div>
            <span className={`badge ${STATUS_MAP[p.status].cls}`}>{STATUS_MAP[p.status].label}</span>
          </div>
          <div className="project-meta"><span>Partner: {p.partner}</span><span>PSP: {p.psp}</span><span>Assigned to: Sales Test (Sales)</span></div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="row" style={{ gap: 5, fontSize: 11, color: "var(--color-text-subtle)" }}><Icon name="clock" size={12} /> Waiting for payment confirmation</span>
          <Can
            permission="payment:confirm"
            fallback={<span style={{ fontSize: 11, color: "var(--gray-400)" }}>Sales confirms this</span>}>
            <button
              className="btn btn-primary btn-sm"
              disabled={advance.isPending}
              onClick={() => advance.mutate({ id: p.id, patch: { status: "review" } })}>
              <Icon name="creditCard" /> {advance.isPending ? "Confirming…" : "Confirm payment"}
            </button>
          </Can>
        </div>
      </div>
    ))}

    {failure && <div className="error-msg" role="alert" style={{ marginTop: 12 }}>⚠ {failure}</div>}

    <AsyncSection query={projects} label="the queue">
      {(list) => (
        list.some(p => p.status === "review" || p.status === "sales-approval")
          ? <></>
          : <div className="async-state">Nothing is waiting for review.</div>
      )}
    </AsyncSection>
  </div>
  );
}
