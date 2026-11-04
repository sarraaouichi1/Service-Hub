import type { CSSProperties } from "react";
import { useNavigate } from "@tanstack/react-router";
import { STATUS_COLOR, STATUS_MAP, countByStatus, progressPct } from "../../../data/display";
import { AsyncSection } from "../../../components/AsyncSection";
import { useProjects } from "../../../queries";
import { ProjectMeta } from "../components/ProjectMeta";
import { Can } from "../../auth/Can";
import { useAuth } from "../../auth/useAuth";
import { clickable } from "../../../components/clickable";
import { useOnboarding } from "../context/onboardingContext";
import { Button, Icon, PageHeader, SectionHeader, StatCard } from "../../../design-system";
import type { Project, ProjectStatus } from "../../../types";

// Step 'review' (Pending Review) is removed per user request.
// 'approved' is renamed to 'Ready for deployment'.
// Clicking any card navigates to the projects view filtered by that status.
const STATUS_CARDS: { status: ProjectStatus; note: string; targetUrl?: string }[] = [
  { status: "progress", note: "Partner still entering data", targetUrl: "/onboarding/projects?status=progress" },
  { status: "sales-approval", note: "Awaiting payment confirmation", targetUrl: "/onboarding/review-queue" },
  { status: "approved", note: "Ready for deployment", targetUrl: "/onboarding/approved" },
  { status: "onboarded", note: "Live on entervo smart", targetUrl: "/onboarding/projects?status=onboarded" },
];

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

export function DashboardView() {
  const navigate = useNavigate();
  const { currentUser, resetDraft } = useOnboarding();
  const projects = useProjects();
  const { can } = useAuth();

  const openProject = (p: Project) =>
    navigate({ to: "/onboarding/wizard/$step", params: { step: String(p.step) }, search: { project: p.id } });

  const startNewOnboarding = () => {
    resetDraft();
    navigate({ to: "/onboarding/wizard/$step", params: { step: "0" }, search: { project: undefined } });
  };

  /**
   * Filter and sort projects based on user context:
   * 1. If user has a company/carpark/country associated, filter to their own car park and country.
   * 2. Sort projects primarily by country so visitors see their country's installations together.
   */
  const filterAndSortProjects = (list: Project[]) => {
    let result = [...list];

    // Country/carpark segregation if customer is scoped
    const isCustomer = currentUser.roles?.some(r => String(r).toLowerCase() === "customer") ?? false;
    const userCompany = (currentUser.company || currentUser.partner || "").trim().toLowerCase();

    if (isCustomer && userCompany) {
      result = result.filter(p => {
        const pName = (p.name || "").toLowerCase();
        const pPartner = (p.partner || "").toLowerCase();
        return pName.includes(userCompany) || pPartner.includes(userCompany) || userCompany.includes(pName);
      });
    }

    // Filter by user's assigned country from Account Settings
    const userCountry = (currentUser.country || "").trim().toUpperCase();
    if (userCountry) {
      const matchCountry = (pCountry: string) => {
        const pC = (pCountry || "").trim().toUpperCase();
        if (!pC) return false;
        if (pC === userCountry) return true;
        if (userCountry === "DE" && (pC === "GERMANY" || pC === "DEUTSCHLAND")) return true;
        if ((userCountry === "GERMANY" || userCountry === "DEUTSCHLAND") && pC === "DE") return true;
        if (userCountry === "UK" && (pC === "GB" || pC === "UNITED KINGDOM")) return true;
        if (userCountry === "GB" && (pC === "UK" || pC === "UNITED KINGDOM")) return true;
        if (userCountry === "FR" && pC === "FRANCE") return true;
        if (userCountry === "FRANCE" && pC === "FR") return true;
        if (userCountry === "US" && (pC === "USA" || pC === "UNITED STATES")) return true;
        if (userCountry === "AT" && pC === "AUSTRIA") return true;
        if (userCountry === "CH" && pC === "SWITZERLAND") return true;
        if (userCountry === "NL" && (pC === "NETHERLANDS" || pC === "HOLLAND")) return true;
        return pC.includes(userCountry) || userCountry.includes(pC);
      };
      result = result.filter(p => matchCountry(p.country));
    }

    // Sort by country, then alphabetically by project name
    result.sort((a, b) => {
      const cA = (a.country || "").toUpperCase();
      const cB = (b.country || "").toUpperCase();
      if (cA !== cB) return cA.localeCompare(cB);
      return a.name.localeCompare(b.name);
    });

    return result;
  };

  return (
    <div className="fade-in">
      <PageHeader
        title={`${greeting()}, ${currentUser.name.split(" ")[0]}`}
        description="Where every onboarding project stands, from first draft to live."
      />
      <AsyncSection query={projects} label="projects">
        {(list) => {
          const displayProjects = filterAndSortProjects(list);

          return (
            <>
              <div className="stat-grid">
                <div
                  {...clickable(() => navigate({ to: "/onboarding/projects", search: { status: "all", q: undefined } }))}
                  style={{ cursor: "pointer", display: "contents" }}
                >
                  <StatCard animated label="Total projects" value={list.length} note={`${countByStatus(list, "draft")} still in draft`} tone="var(--sb-ink)" />
                </div>

                {STATUS_CARDS.map(c => (
                  <div
                    key={c.status}
                    {...clickable(() => {
                      let target = c.targetUrl;
                      if (c.status === "sales-approval" && !can("payment:confirm")) {
                        target = "/onboarding/projects?status=sales-approval";
                      }
                      if (c.status === "approved" && !can("project:deploy")) {
                        target = "/onboarding/projects?status=approved";
                      }
                      if (target?.includes("?")) {
                        const [path, searchStr] = target.split("?");
                        const params = new URLSearchParams(searchStr);
                        const statusVal = params.get("status") as ProjectStatus;
                        navigate({ to: path as any, search: { status: statusVal, q: undefined } as any });
                      } else if (target) {
                        navigate({ to: target as any });
                      } else {
                        navigate({ to: "/onboarding/projects", search: { status: c.status, q: undefined } });
                      }
                    })}
                    style={{ cursor: "pointer", display: "contents" }}
                  >
                    <StatCard
                      animated
                      label={STATUS_MAP[c.status].label}
                      value={countByStatus(list, c.status)}
                      note={c.note}
                      tone={STATUS_COLOR[c.status]}
                    />
                  </div>
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
                {displayProjects.map(p => (
                  <div key={p.id} className="project-card" style={{ "--project-tone": STATUS_COLOR[p.status] } as CSSProperties} {...clickable(() => openProject(p))}>
                    <div>
                      <div className="row" style={{ gap: "var(--space-3)", marginBottom: "var(--space-1)" }}>
                        <div className="project-name">{p.name}</div>
                        <span className={`badge ${STATUS_MAP[p.status].cls}`}>{STATUS_MAP[p.status].label}</span>
                        {p.country && (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "var(--color-surface-muted)", color: "var(--color-text-muted)", marginLeft: "auto" }}>
                            📍 {p.country}
                          </span>
                        )}
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
                {displayProjects.length === 0 && <div className="async-state">No projects yet for your region or car park. Start one with New onboarding.</div>}
              </div>
            </>
          );
        }}
      </AsyncSection>
    </div>
  );
}
