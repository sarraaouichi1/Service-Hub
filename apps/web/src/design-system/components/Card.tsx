import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "../../components/Icon";
import type { IconName } from "../../types";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** `muted` is the flat grey panel; `accent`/`ink` add a top rule. */
  variant?: "default" | "muted" | "accent" | "ink";
  interactive?: boolean;
}

export function Card({ variant = "default", interactive, className, children, ...rest }: CardProps) {
  const cls = ["card", variant !== "default" && `card-${variant}`, interactive && "card-interactive", className].filter(Boolean).join(" ");
  return <div className={cls} {...rest}>{children}</div>;
}

export function IconTile({ name, tone = "accent", size = 20 }: { name: IconName; tone?: "accent" | "ink"; size?: number }) {
  return (
    <div className={`icon-tile${tone === "ink" ? " ink" : ""}`} aria-hidden="true">
      <Icon name={name} size={size} />
    </div>
  );
}

/** Icon, title and one line of copy — the repeated unit of a feature grid. */
export function FeatureCard({ icon, title, children, variant = "default" }: {
  icon?: IconName; title: ReactNode; children?: ReactNode; variant?: CardProps["variant"];
}) {
  return (
    <Card variant={variant}>
      {icon && <div style={{ marginBottom: "var(--space-4)" }}><IconTile name={icon} /></div>}
      <div className="card-title">{title}</div>
      {children && <div className="card-desc">{children}</div>}
    </Card>
  );
}
