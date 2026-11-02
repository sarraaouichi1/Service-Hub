import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { STATUS_COLOR, STATUS_MAP } from "../../../data/display";
import { Icon } from "../../../components/Icon";
import { AsyncSection } from "../../../components/AsyncSection";
import { useProductLookup, useProjects } from "../../../queries";
import { Can } from "../../auth/Can";
import { clickable } from "../../../components/clickable";
import { useOnboarding } from "../context/onboardingContext";
import type { Project, ProjectStatus } from "../../../types";

/** Filter chips. `value` is the `status` search param written to the URL. */
const PROJECT_FILTERS: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "progress", label: "In Progress" },
  { value: "review", label: "Pending Review" },
  { value: "sales-approval", label: "Sales Approval" },
  { value: "approved", label: "Ready for deployment" },
  { value: "onboarded", label: "Onboarded" },
];

const route = getRouteApi("/onboarding/projects");

export function ProjectsView() {
  const navigate = useNavigate();
  const { status, q } = route.useSearch();
  const { resetDraft } = useOnboarding();
  const projects = useProjects();
  const productById = useProductLookup();

  const openProject = (p: Project) =>
    navigate({ to: "/onboarding/wizard/$step", params: { step: String(p.step) }, search: { project: p.id } });

  const startNewOnboarding = () => {
    resetDraft();
    navigate({ to: "/onboarding/wizard/$step", params: { step: "0" }, search: { project: undefined } });
  };

  const needle = (q ?? "").trim().toLowerCase();
  const visible = (projects.data ?? []).filter(p =>
    (status === "all" || p.status === status) &&
    (needle === "" ||
      p.name.toLowerCase().includes(needle) ||
      p.partner.toLowerCase().includes(needle) ||
      p.pm.toLowerCase().includes(needle)),
  );

  return (
  <div className="fade-in">
    <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div className="page-title">All Projects</div>
        <div className="page-desc">Every onboarding project across all partners and products.</div>
      </div>
      <Can permission="project:create">
        <button className="btn btn-primary" onClick={startNewOnboarding}>
          <Icon name="plus" /> New Onboarding
        </button>
      </Can>
    </div>

    {/* Filter bar */}
    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
      {PROJECT_FILTERS.map(f => (
        <button key={f.value} type="button"
          onClick={() => navigate({ to: "/onboarding/projects", search: { status: f.value, q } })}
          style={{ padding: "5px 14px", borderRadius: 20, border: "1px solid", borderColor: status === f.value ? "var(--navy)" : "var(--gray-200)", fontSize: 12, fontWeight: 600, cursor: "pointer", background: status === f.value ? "var(--navy)" : "white", color: status === f.value ? "white" : "var(--gray-600)" }}>
          {f.label}
        </button>
      ))}
      <div style={{ marginLeft: "auto" }}>
        <input placeholder="Search projects…" value={q}
            onChange={e => navigate({ to: "/onboarding/projects", search: { status, q: e.target.value || undefined } })}
            style={{ padding: "6px 14px", border: "1.5px solid var(--gray-200)", borderRadius: 20, fontFamily: "var(--font)", fontSize: 13, outline: "none", width: 220 }} />
      </div>
    </div>

    {/* Table header */}
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 1fr 1.2fr 80px", padding: "10px 18px", background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: "8px 8px 0 0", borderBottom: "none" }}>
      {["Project", "Product", "Partner", "PSP", "Progress", "Status", ""].map((h, i) => (
        <div key={i} style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</div>
      ))}
    </div>
    <div style={{ border: "1px solid var(--gray-200)", borderRadius: "0 0 8px 8px", overflow: "hidden", background: "white" }}>
      <AsyncSection query={projects} label="projects">
        {() => <>
      {visible.map((p, i) => {
        const pc = productById[p.product];
        return (
          <div key={p.id} {...clickable(() => openProject(p))} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 1fr 1.2fr 80px", padding: "14px 18px", borderBottom: i < visible.length - 1 ? "1px solid var(--gray-100)" : "none", alignItems: "center", cursor: "pointer", transition: "background 0.12s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--gray-50)"}
            onMouseLeave={e => e.currentTarget.style.background = "white"}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{p.name}</div>
              <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>PM: {p.pm}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: pc?.bg ?? "var(--gray-100)", color: pc?.color ?? "var(--gray-400)" }}>{pc?.name ?? p.product}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--gray-600)" }}>{p.partner}</div>
            <div style={{ fontSize: 13, color: "var(--gray-600)" }}>{p.psp}</div>
            <div>
              <div style={{ width: "80%", background: "var(--gray-200)", borderRadius: 10, height: 6, overflow: "hidden" }}>
                <div style={{ width: `${Math.round((p.step / p.total) * 100)}%`, background: STATUS_COLOR[p.status], height: "100%", borderRadius: 10 }} />
              </div>
              <div style={{ fontSize: 10.5, color: "var(--gray-400)", marginTop: 4 }}>Step {p.step} of {p.total}</div>
            </div>
            <div>
              <span className={`badge ${STATUS_MAP[p.status].cls}`}>{STATUS_MAP[p.status].label}</span>
            </div>
            <div>
              <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 11 }} onClick={(e) => { e.stopPropagation(); openProject(p); }}>
                Open
              </button>
            </div>
          </div>
        );
      })}
      {visible.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: "var(--gray-400)", fontSize: 13 }}>
          No projects match the current filter.
        </div>
      )}
      </>}
      </AsyncSection>
    </div>
  </div>
  );
}
