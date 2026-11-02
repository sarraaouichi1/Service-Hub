import { useCallback, useRef, useState } from "react";
import { Link, Outlet, getRouteApi, useMatches, useNavigate } from "@tanstack/react-router";
import { NOTIFICATION_STYLE, countByStatus } from "../../data/display";
import { useProjects } from "../../queries";
import { clickable } from "../../components/clickable";
import { AccountMenu, AppHeader, Button, Icon, useDismiss } from "../../design-system";
import { OnboardingProvider } from "./context/OnboardingProvider";
import { useOnboarding } from "./context/onboardingContext";
import { useAuth } from "../auth/useAuth";
import type { Permission } from "@service-hub/shared";
import type { IconName, RouteStaticData } from "../../types";
import "../../styles/onboarding.css";

const route = getRouteApi("/onboarding");

interface NavLink {
  to: string;
  icon: IconName;
  label: string;
  badge?: number;
  /** Also highlight this entry while a descendant route is active. */
  fuzzy?: boolean;
  /** Hidden from anyone who lacks this. The API enforces the same rule. */
  permission?: Permission;
}

export function OnboardingLayout() {
  const { session } = route.useRouteContext();
  return (
    <OnboardingProvider currentUser={session.user}>
      <OnboardingShell />
    </OnboardingProvider>
  );
}

function OnboardingShell() {
  const navigate = useNavigate();
  const matches = useMatches();
  const { resetDraft } = useOnboarding();
  const projects = useProjects().data ?? [];
  const { can } = useAuth();

  // The deepest matched route carries the page title, so the page bar stays in
  // sync with the URL without a parallel view enum. "Admin — Countries" splits
  // into a breadcrumb section and a title.
  const active = [...matches].reverse().find(m => (m.staticData as RouteStaticData)?.title);
  const fullTitle = (active?.staticData as RouteStaticData | undefined)?.title ?? "Onboarding";
  const [section, title] = fullTitle.includes(" — ") ? fullTitle.split(" — ") : [null, fullTitle];
  const onWizard = matches.some(m => m.routeId.toString().includes("/wizard"));

  const mainNav: NavLink[] = [
    { to: "/onboarding/dashboard", icon: "grid", label: "Dashboard" },
    { to: "/onboarding/projects", icon: "list", label: "All projects", badge: projects.length },
  ];
  const reviewNav: NavLink[] = [
    { to: "/onboarding/review-queue", icon: "eye", label: "Review List", badge: countByStatus(projects, "review") + countByStatus(projects, "sales-approval"), permission: "project:review" },
    { to: "/onboarding/approved", icon: "check", label: "Ready for deployment", permission: "project:read" },
  ];
  const adminNav: NavLink[] = [
    { to: "/onboarding/admin/templates", icon: "globe", label: "Countries", permission: "template:read" },
    { to: "/onboarding/admin/rules", icon: "shield", label: "Validation rules", permission: "rule:read" },
    { to: "/onboarding/admin/users", icon: "users", label: "User management", permission: "user:read" },
    { to: "/onboarding/admin/settings", icon: "settings", label: "Settings", permission: "settings:read" },
  ];

  // A section with nothing the user may reach shouldn't leave a heading behind.
  const allowed = (items: NavLink[]) => items.filter(item => !item.permission || can(item.permission));

  const renderNav = (items: NavLink[]) => items.map(item => (
    <Link key={item.to} to={item.to} className="nav-item"
      activeProps={{ className: "nav-item active" }}
      activeOptions={{ exact: !item.fuzzy }}>
      <Icon name={item.icon} />
      {item.label}
      {item.badge !== undefined && <span className="count-badge nav-badge">{item.badge}</span>}
    </Link>
  ));

  const startNewOnboarding = () => {
    resetDraft();
    navigate({ to: "/onboarding/wizard/$step", params: { step: "0" }, search: { project: undefined } });
  };

  return (
    <div className="app-frame">
      <AppHeader actions={<><NotificationsMenu /><AccountMenu /></>} />
      <div className="app">
        <aside className="sidebar" aria-label="Onboarding navigation">
          <div className="sidebar-module">
            <div className="eyebrow accent">Module</div>
            <div className="sidebar-module-name">Onboarding</div>
          </div>
          {can("project:create") && (
            <div className="sidebar-cta">
              <Button block icon="plus" onClick={startNewOnboarding} aria-current={onWizard ? "page" : undefined}>
                New onboarding
              </Button>
            </div>
          )}
          <div className="sidebar-section">
            <div className="sidebar-section-label">Projects</div>
            {renderNav(mainNav)}
          </div>
          {allowed(reviewNav).length > 0 && (
            <div className="sidebar-section">
              <div className="sidebar-section-label">Review</div>
              {renderNav(allowed(reviewNav))}
            </div>
          )}
          {allowed(adminNav).length > 0 && (
            <div className="sidebar-section">
              <div className="sidebar-section-label">Administration</div>
              {renderNav(allowed(adminNav))}
            </div>
          )}
          <div className="sidebar-section" style={{ marginTop: "auto" }}>
            <Link to="/" className="nav-item subtle"><Icon name="chevronLeft" /> Back to hub</Link>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            {onWizard && (
              <Link to="/onboarding/dashboard" className="btn btn-ghost btn-icon" aria-label="Back to dashboard">
                <Icon name="chevronLeft" />
              </Link>
            )}
            <div>
              <nav className="breadcrumb" aria-label="Breadcrumb">
                <Link to="/onboarding/dashboard">Onboarding</Link>
                {section && <><Icon name="chevronRight" /><span>{section}</span></>}
              </nav>
              <h1 className="topbar-title">{title}</h1>
            </div>
          </div>
          <div className="content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function NotificationsMenu() {
  const { notifs, markAllRead, markRead } = useOnboarding();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);
  const unread = notifs.filter(n => !n.read).length;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className="icon-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        onClick={() => setOpen(o => !o)}
      >
        <Icon name="bell" size={18} />
        {unread > 0 && <span className="icon-button-badge">{unread}</span>}
      </button>
      {open && (
        <div className="menu menu-wide fade-in" role="menu">
          <div className="menu-header">
            <div className="menu-title">Notifications</div>
            <button type="button" className="link-arrow" onClick={markAllRead} disabled={!unread}>Mark all read</button>
          </div>
          <div className="notif-list">
            {notifs.length === 0 && <div className="data-table-empty">You're all caught up.</div>}
            {notifs.map(n => {
              const style = NOTIFICATION_STYLE[n.type];
              return (
                <div key={n.id} className={`notif-item${n.read ? "" : " unread"}`} {...clickable(() => { if (!n.read) markRead(n.id); })}>
                  <div className="notif-icon" style={{ background: style.bg, color: style.color }}>
                    <Icon name={style.icon} size={16} />
                  </div>
                  <div className="notif-body">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-desc">{n.desc}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                  {!n.read && <div className="notif-dot" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
