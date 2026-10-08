import { useEffect, useState } from "react";
import { Link, Outlet, getRouteApi, useMatches, useNavigate } from "@tanstack/react-router";
import { countByStatus } from "../../data/display";
import { useProjects } from "../../queries";
import { Icon } from "../../components/Icon";
import { clickable } from "../../components/clickable";
import { OnboardingProvider } from "./context/OnboardingProvider";
import { useOnboarding } from "./context/onboardingContext";
import { signOut } from "../../api";
import { useAuth } from "../auth/useAuth";
import type { Permission } from "@service-hub/shared";
import type { IconName, RouteStaticData } from "../../types";
import "../../styles/onboarding.css";

const route = getRouteApi("/onboarding");

interface NavLink {
  to: string;
  icon: IconName;
  label: string;
  badge?: string;
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
  const { currentUser, notifs, markAllRead, resetDraft } = useOnboarding();
  const projects = useProjects().data ?? [];
  const { can } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    await navigate({ to: "/login" });
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const el = e.target as Element | null;
      if (!el?.closest('.topbar-dropdown') && !el?.closest('.profile-dropdown') && !el?.closest('.btn-ghost') && !el?.closest('.avatar')) {
        setShowNotifs(false);
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // The deepest matched route carries the page title, so the topbar stays in
  // sync with the URL without a parallel view enum.
  const active = [...matches].reverse().find(m => (m.staticData as RouteStaticData)?.title);
  const staticData = active?.staticData as RouteStaticData | undefined;
  const onWizard = matches.some(m => m.routeId.toString().includes("/wizard"));

  const mainNav: NavLink[] = [
    { to: "/onboarding/dashboard", icon: "grid", label: "Dashboard" },
    { to: "/onboarding/projects", icon: "list", label: "All Projects", badge: String(projects.length) },
  ];
  const reviewNav: NavLink[] = [
    { to: "/onboarding/review-queue", icon: "eye", label: "Review Queue", badge: String(countByStatus(projects, "review") + countByStatus(projects, "sales-approval")), permission: "project:review" },
    { to: "/onboarding/approved", icon: "shield", label: "Approved", permission: "project:read" },
  ];
  const adminNav: NavLink[] = [
    { to: "/onboarding/admin/templates", icon: "list", label: "Countries", permission: "template:read" },
    { to: "/onboarding/admin/rules", icon: "shield", label: "Validation Rules", permission: "rule:read" },
    { to: "/onboarding/admin/users", icon: "users", label: "User Management", permission: "user:read" },
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
      {item.badge && <span className="nav-badge">{item.badge}</span>}
    </Link>
  ));

  const startNewOnboarding = () => {
    resetDraft();
    navigate({ to: "/onboarding/wizard/$step", params: { step: "0" }, search: { project: undefined } });
  };

  return (
    <div className="app">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/sb-logo.svg" alt="Scheidt &amp; Bachmann" className="brand-wordmark" />
          <div className="logo-mark">
            <div>
              <div className="logo-sub">Onboarding Platform</div>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Main</div>
          {renderNav(mainNav)}
          {can("project:create") && (
            <button type="button" className={`nav-item${onWizard ? " active" : ""}`} onClick={startNewOnboarding}>
              <Icon name="plus" />
              New Onboarding
            </button>
          )}
        </div>
        {allowed(reviewNav).length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-section-label">Review</div>
            {renderNav(allowed(reviewNav))}
          </div>
        )}
        <div className="sidebar-section" style={{ marginTop: "auto" }}>
          {allowed(adminNav).length > 0 && (
            <>
              <div className="sidebar-section-label">Admin</div>
              {renderNav(allowed(adminNav))}
            </>
          )}
          <Link to="/" className="nav-item" style={{ marginTop: 12, color: "rgba(255,255,255,0.4)" }}>
            <Icon name="chevronLeft" /> Back to Hub
          </Link>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main">
        {/* Topbar */}
        <div className="topbar">
          {onWizard && (
            <Link to="/onboarding/dashboard" className="btn btn-ghost" style={{ marginRight: 4 }}>
              <Icon name="chevronLeft" /> Back
            </Link>
          )}
          <div>
            <div className="topbar-title">{staticData?.title ?? "Onboarding"}</div>
          </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          {/* ── NOTIFICATIONS BELL ── */}
          <div style={{ position: "relative" }}>
            <button className="btn btn-ghost" style={{ position: "relative" }} onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}>
              <Icon name="bell" />
              {notifs.filter(n => !n.read).length > 0 && (
                <span className="bell-badge">{notifs.filter(n => !n.read).length}</span>
              )}
            </button>
            {showNotifs && (
              <div className="topbar-dropdown fade-in">
                <div className="dropdown-header">
                  <div className="dropdown-header-title">Notifications</div>
                  <button className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 8px" }} onClick={markAllRead}>Mark all read</button>
                </div>
                <div style={{ maxHeight: 380, overflowY: "auto" }}>
                  {notifs.map(n => (
                    <div key={n.id} className={`notif-item${n.read ? "" : " unread"}`} >
                      <div className="notif-icon" style={{ background: n.color }}>
                        {n.type === "submit" && <Icon name="plus" size={16} color={n.iconColor} />}
                        {n.type === "approve" && <Icon name="check" size={16} color={n.iconColor} />}
                        {n.type === "reject" && <Icon name="zap" size={16} color={n.iconColor} />}
                        {n.type === "info" && <Icon name="settings" size={16} color={n.iconColor} />}
                      </div>
                      <div className="notif-body">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-desc">{n.desc}</div>
                        <div className="notif-time">{n.time}</div>
                      </div>
                      {!n.read && <div className="notif-dot" />}
                    </div>
                  ))}
                </div>
                <div style={{ padding: "10px 18px", borderTop: "1px solid var(--gray-100)", textAlign: "center" }}>
                  <button className="btn btn-ghost" style={{ fontSize: 12, width: "100%" }}>View all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* ── PROFILE ── */}
          <div style={{ position: "relative" }}>
            <div className="avatar" style={{ cursor: "pointer", background: currentUser.color + "33", color: currentUser.color, border: "2px solid " + currentUser.color + "55" }}
              onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}>
              {currentUser.initials}
            </div>
            {showProfile && (
              <div className="profile-dropdown fade-in">
                <div className="profile-header">
                  <div className="profile-avatar-lg" style={{ background: currentUser.color + "44", color: currentUser.color }}>{currentUser.initials}</div>
                  <div className="profile-name">{currentUser.name}</div>
                  <div className="profile-role">{currentUser.roles.join(" · ")}</div>
                  <div className="profile-email">{currentUser.email}</div>
                </div>
                <div>
                  <Link to="/onboarding/settings/account" className="profile-menu-item" onClick={() => setShowProfile(false)}><Icon name="users" size={15} /> Account Settings</Link>
                  <Link to="/onboarding/settings/privacy" className="profile-menu-item" onClick={() => setShowProfile(false)}><Icon name="shield" size={15} /> Privacy & Security</Link>
                  <Link to="/onboarding/settings/notifications" className="profile-menu-item" onClick={() => setShowProfile(false)}><Icon name="bell" size={15} /> Notification Preferences</Link>
                  <div className="profile-menu-item" style={{ color: "var(--red)" }} {...clickable(() => void handleSignOut())}><Icon name="zap" size={15} color="var(--red)" /> Sign Out</div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Content */}
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
