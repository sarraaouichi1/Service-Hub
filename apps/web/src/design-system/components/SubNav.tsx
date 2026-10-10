import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "../../components/Icon";
import type { IconName } from "../../types";

export interface SubNavItem {
  to: string;
  label: string;
  icon?: IconName;
  /** Only highlight on this exact path — for an overview whose children are siblings in the nav. */
  exact?: boolean;
}

/** A module's own pages, sticky under the app header. Each entry is a real route, not an anchor. */
export function SubNav({ title, items, aside }: { title: ReactNode; items: SubNavItem[]; aside?: ReactNode }) {
  return (
    <nav className="subnav" aria-label={typeof title === "string" ? title : "Section"}>
      <div className="subnav-inner">
        <div className="subnav-title">{title}</div>
        <div className="subnav-links">
          {items.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="subnav-link"
              activeProps={{ className: "subnav-link active" }}
              activeOptions={{ exact: item.exact }}
            >
              {item.icon && <Icon name={item.icon} size={14} />}
              {item.label}
            </Link>
          ))}
        </div>
        {aside && <div className="subnav-aside">{aside}</div>}
      </div>
    </nav>
  );
}
