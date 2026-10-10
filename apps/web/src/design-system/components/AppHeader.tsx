import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { HUB_MODULES } from "../../data/modules";
import { useAuth } from "../../modules/auth/useAuth";
import { Icon } from "../../components/Icon";

/**
 * The white bar across the top of every signed-in page: wordmark, the module
 * switcher, and whatever actions the page puts on the right. `contained`
 * centres it to the content width for scrolling pages; the app shell runs it
 * edge to edge above its sidebar.
 */
export function AppHeader({ actions, contained }: { actions?: ReactNode; contained?: boolean }) {
  const { can } = useAuth();
  const modules = HUB_MODULES.filter(m => can(m.permission));

  return (
    <header className={`app-header${contained ? " contained" : ""}`}>
      <div className="app-header-inner">
        <Link to="/" className="app-brand" aria-label="Service Hub home">
          <img src="/sb-logo.svg" alt="Scheidt &amp; Bachmann" />
          <span className="app-brand-divider" aria-hidden="true" />
          <span className="app-brand-product">entervo<br />Service Hub</span>
        </Link>
        <nav className="app-modules" aria-label="Modules">
          {modules.map(m => (
            <Link key={m.to} to={m.to} className="app-module-link" activeProps={{ className: "app-module-link active" }}>
              <Icon name={m.icon} size={15} />
              {m.label}
            </Link>
          ))}
        </nav>
        <div className="app-header-actions">{actions}</div>
      </div>
    </header>
  );
}
