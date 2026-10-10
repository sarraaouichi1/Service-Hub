import type { ReactNode } from "react";

export function Eyebrow({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return <div className={`eyebrow${accent ? " accent" : ""}`}>{children}</div>;
}

/** Top of a page: optional eyebrow, the light uppercase title, a description, and actions on the right. */
export function PageHeader({ eyebrow, title, description, actions }: {
  eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <Eyebrow accent>{eyebrow}</Eyebrow>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-desc">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function SectionHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-title">{title}</h2>
        {description && <p className="section-desc">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
