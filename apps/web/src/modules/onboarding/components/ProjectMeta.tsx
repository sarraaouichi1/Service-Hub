import { useProductLookup } from "../../../queries";
import { Icon } from "../../../design-system";
import type { Project } from "../../../types";

/** Partner, PSP, project manager and product — the line under every project's name. */
export function ProjectMeta({ project }: { project: Project }) {
  const productById = useProductLookup();
  return (
    <div className="project-meta">
      <span><Icon name="building" /> {project.partner}</span>
      <span><Icon name="creditCard" /> {project.psp}</span>
      <span><Icon name="user" /> {project.pm}</span>
      <span className="badge badge-outline plain">{productById[project.product]?.name ?? project.product}</span>
    </div>
  );
}
