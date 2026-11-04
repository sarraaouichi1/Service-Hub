import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { STATUS_MAP } from "../../../data/display";
import { Icon } from "../../../components/Icon";
import { Can } from "../../auth/Can";
import { AsyncSection } from "../../../components/AsyncSection";
import { useProjects, useUpdateProject } from "../../../queries";
import { useAuth } from "../../auth/useAuth";

export function ReviewQueueView() {
  const navigate = useNavigate();
  const projects = useProjects();
  const { user, can } = useAuth();
  const [failure, setFailure] = useState<string | null>(null);

  const canConfirm = can("payment:confirm");
  const inStatus = (status: string) => (projects.data ?? []).filter(p => p.status === status);

  const awaitingProjects = [
    ...inStatus("sales-approval"),
    ...inStatus("review"),
  ];

  const advance = useUpdateProject({
    onSuccess: () => setFailure(null),
    onError: (error) => setFailure(error.message),
  });

  const openProject = (id: number, step: number) =>
    navigate({ to: "/onboarding/wizard/$step", params: { step: String(step) }, search: { project: id } });

  if (!canConfirm && !user?.roles?.includes("Admin")) {
    return (
      <div className="fade-in">
        <div className="page-header">
          <div className="page-title">Sales Delivery Confirmation</div>
          <div className="page-desc">Dedicated to Sales Team members.</div>
        </div>
        <div className="callout callout-warning">
          <Icon name="shield" size={18} />
          <div>
            <strong>Access Restricted</strong>
            <p style={{ margin: "4px 0 0 0", fontSize: 13 }}>
              This page is dedicated exclusively to the <strong>Sales Team</strong> to verify customer payment and contract validity. Project Managers and other roles cannot confirm delivery.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Sales Delivery Confirmation</div>
        <div className="page-desc">Review customer payment and contract validity before releasing requests for deployment.</div>
      </div>

      {/* Explanatory comment callout for Sales roles */}
      <div className="callout callout-info" style={{ marginBottom: 20 }}>
        <Icon name="info" size={18} />
        <div>
          <strong style={{ fontSize: 14 }}>Awaiting Sales Delivery Confirmation</strong>
          <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "var(--gray-700)", lineHeight: 1.5 }}>
            This page is dedicated only for the <strong>Sales Team</strong>. Before granting delivery confirmation, please verify that the customer has confirmed payment and the contract is active and valid. Once confirmed, the request will immediately pass to the final step of onboarding (<strong>Ready for deployment</strong>) for the DevOps team.
          </p>
        </div>
      </div>

      {failure && <div className="error-msg" role="alert" style={{ marginBottom: 16 }}>⚠ {failure}</div>}

      {/* Awaiting Sales Delivery Confirmation List */}
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
        Pending Sales Delivery Confirmations ({awaitingProjects.length})
      </div>

      {awaitingProjects.map(p => (
        <div key={p.id} className="project-card" style={{ marginBottom: 12, cursor: "default", borderLeft: "4px solid var(--status-sales)" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div className="project-name">{p.name}</div>
              <span className={`badge ${STATUS_MAP[p.status]?.cls || "badge-sales"}`}>
                {p.status === "sales-approval" ? "Awaiting Sales Confirmation" : STATUS_MAP[p.status]?.label}
              </span>
              <span style={{ fontSize: 11, color: "var(--gray-500)", background: "var(--gray-100)", padding: "2px 8px", borderRadius: 4 }}>
                Product: {p.product}
              </span>
            </div>
            <div className="project-meta" style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--gray-600)" }}>
              <span><strong>Partner:</strong> {p.partner}</span>
              <span><strong>Country:</strong> {p.country || "—"}</span>
              <span><strong>PSP:</strong> {p.psp || "—"}</span>
              <span><strong>PM:</strong> {p.pm}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => openProject(p.id, p.step)}>
              <Icon name="eye" size={13} /> View Details
            </button>
            <Can
              permission="payment:confirm"
              fallback={<span style={{ fontSize: 11, color: "var(--gray-400)" }}>Sales role required</span>}>
              <button
                className="btn btn-primary"
                style={{ fontSize: 12, background: "var(--sb-plum-500, #C0185A)", borderColor: "var(--sb-plum-500, #C0185A)" }}
                disabled={advance.isPending}
                onClick={() => advance.mutate({ id: p.id, patch: { status: "approved" } })}>
                <Icon name="check" size={13} /> {advance.isPending ? "Confirming…" : "Confirm Delivery & Pass to DevOps"}
              </button>
            </Can>
          </div>
        </div>
      ))}

      <AsyncSection query={projects} label="sales confirmation queue">
        {(list) => {
          const count = list.filter(p => p.status === "sales-approval" || p.status === "review").length;
          return count > 0 ? <></> : (
            <div className="async-state" style={{ background: "white", borderRadius: 10, padding: 32, textAlign: "center", border: "1px dashed var(--gray-200)" }}>
              <Icon name="check" size={28} color="var(--green)" />
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--navy)", marginTop: 8 }}>All caught up!</div>
              <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 4 }}>
                There are currently no onboarding requests awaiting sales delivery confirmation.
              </div>
            </div>
          );
        }}
      </AsyncSection>
    </div>
  );
}
