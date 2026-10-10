import type { CSSProperties } from "react";
import { useNavigate } from "@tanstack/react-router";
import { STATUS_COLOR, STATUS_MAP, countByStatus, progressPct } from "../../../data/display";
import { AsyncSection } from "../../../components/AsyncSection";
import { useProjects } from "../../../queries";
import { ProjectMeta } from "../components/ProjectMeta";
import { Can } from "../../auth/Can";
import { clickable } from "../../../components/clickable";
import { useOnboarding } from "../context/onboardingContext";
import { Button, Icon, PageHeader, SectionHeader, StatCard } from "../../../design-system";
import type { Project, ProjectStatus } from "../../../types";

// Projects carry no dates, so the cards describe each status rather than
// inventing a trend the data can't support.
const STATUS_CARDS: { status: ProjectStatus; note: string }[] = [
  { status: "progress", note: "Partner still entering data" },
  { status: "review", note: "In the S&B review queue" },
  { status: "sales-approval", note: "Awaiting payment confirmation" },
  { status: "approved", note: "Ready for DevOps setup" },
  { status: "onboarded", note: "Live on entervo smart" },
];

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

export function DashboardView() {
  const navigate = useNavigate();
  const { currentUser, resetDraft } = useOnboarding();
  const projects = useProjects();

  const openProject = (p: Project) =>
    navigate({ to: "/onboarding/wizard/$step", params: { step: String(p.step) }, search: { project: p.id } });

  const startNewOnboarding = () => {
    resetDraft();
    navigate({ to: "/onboarding/wizard/$step", params: { step: "0" }, search: { project: undefined } });
  };

  return (
    <div className="fade-in">
      <PageHeader
        title={`${greeting()}, ${currentUser.name.split(" ")[0]}`}
        description="Where every onboarding project stands, from first draft to live."
      />
      <AsyncSection query={projects} label="projects">
        {(list) => (
          <>
            <div className="stat-grid">
              <StatCard label="Total projects" value={list.length} note={`${countByStatus(list, "draft")} still in draft`} tone="var(--sb-ink)" />
              {STATUS_CARDS.map(c => (
                <StatCard key={c.status} label={STATUS_MAP[c.status].label} value={countByStatus(list, c.status)} note={c.note} tone={STATUS_COLOR[c.status]} />
              ))}
            </div>
            <SectionHeader
              title="Recent projects"
              actions={
                <Can permission="project:create">
                  <Button icon="plus" onClick={startNewOnboarding}>New onboarding</Button>
                </Can>
              }
            />
            <div className="project-grid">
              {list.map(p => (
                <div key={p.id} className="project-card" style={{ "--project-tone": STATUS_COLOR[p.status] } as CSSProperties} {...clickable(() => openProject(p))}>
                  <div>
                    <div className="row" style={{ gap: "var(--space-3)", marginBottom: "var(--space-1)" }}>
                      <div className="project-name">{p.name}</div>
                      <span className={`badge ${STATUS_MAP[p.status].cls}`}>{STATUS_MAP[p.status].label}</span>
                    </div>
                    <ProjectMeta project={p} />
                    <div className="project-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progressPct(p)}%`, background: STATUS_COLOR[p.status] }} />
                      </div>
                      <div className="progress-label">Step {p.step} of {p.total} · {progressPct(p)}% complete</div>
                    </div>
                  </div>
                  <Icon name="chevronRight" color="var(--color-text-subtle)" />
                </div>
              ))}
              {list.length === 0 && <div className="async-state">No projects yet. Start one with New onboarding.</div>}
            </div>
          </>
        )}
      </AsyncSection>
    </div>
  );
}
