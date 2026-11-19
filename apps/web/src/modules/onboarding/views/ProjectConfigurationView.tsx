import { Link, getRouteApi } from "@tanstack/react-router";
import { AsyncSection } from "../../../components/AsyncSection";
import { Icon } from "../../../components/Icon";
import { useProject, useProjectConfiguration } from "../../../queries";
import { STATUS_MAP } from "../../../data/display";
import { ConfigurationView } from "../configuration/ConfigurationView";

const route = getRouteApi("/onboarding/projects/$id/configuration");

/** One page with everything a project was submitted with, ready to copy. */
export function ProjectConfigurationView() {
  const id = Number(route.useParams().id);
  const project = useProject(id).data;
  const configuration = useProjectConfiguration(id);

  return (
    <div className="fade-in">
      <div className="config-page-head">
        <Link to="/onboarding/projects" search={{ status: "all", q: undefined }} className="btn btn-ghost btn-sm">
          <Icon name="chevronLeft" size={14} /> All projects
        </Link>
        {project && (
          <div className="config-page-meta">
            <h2>{project.name}</h2>
            <span className={`badge ${STATUS_MAP[project.status]?.cls ?? ""}`}>{STATUS_MAP[project.status]?.label ?? project.status}</span>
            <span className="text-muted">{project.partner} · {project.country || "—"}</span>
          </div>
        )}
      </div>
      <AsyncSection query={configuration} label="the configuration">
        {(result) => result.configuration ? (
          <ConfigurationView data={result.configuration} title={`Onboarding — ${project?.name ?? `project ${id}`}`} />
        ) : (
          <div className="empty-panel">
            This project was submitted before configurations were stored with projects, so there is no configuration to show.
            New submissions keep theirs.
          </div>
        )}
      </AsyncSection>
    </div>
  );
}
