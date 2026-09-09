import { Link, Outlet, useMatches } from "@tanstack/react-router";
import type { RouteStaticData } from "../../types";
import "../../styles/patch.css";

interface PatchNavLink {
  to: string;
  label: string;
  badge?: string;
}

const OVERVIEW_NAV: PatchNavLink[] = [
  { to: "/patch/dashboard", label: "Dashboard" },
  { to: "/patch/bulletins", label: "Patch Bulletins", badge: "2" },
  { to: "/patch/schedule", label: "Schedule" },
];

const SERVICE_NAV: PatchNavLink[] = [
  { to: "/patch/services/basic", label: "Basic Service" },
  { to: "/patch/services/premium", label: "Premium Service" },
];

export function PatchLayout() {
  const matches = useMatches();
  const active = [...matches].reverse().find(m => (m.staticData as RouteStaticData)?.title);
  const title = (active?.staticData as RouteStaticData | undefined)?.title ?? "Patch Management";

  const renderNav = (items: PatchNavLink[]) => items.map(item => (
    <Link key={item.to} to={item.to} className="patch-nav-item"
      activeProps={{ className: "patch-nav-item active" }}>
      <span className="patch-nav-dot" />
      {item.label}
      {item.badge && <span className="patch-nav-badge">{item.badge}</span>}
    </Link>
  ));

  return (
    <div className="patch-app patch-fade">
      {/* Sidebar */}
      <aside className="patch-sidebar">
        <div className="patch-sidebar-logo">
          <img src="/sb-logo.svg" alt="Scheidt &amp; Bachmann" className="brand-wordmark" />
          <div>
            <div className="patch-sidebar-brand">entervo</div>
            <div className="patch-sidebar-sub">Patch Management</div>
          </div>
        </div>

        <div className="patch-nav-section">
          <div className="patch-nav-label">Overview</div>
          {renderNav(OVERVIEW_NAV)}
        </div>

        <div className="patch-nav-section">
          <div className="patch-nav-label">Services</div>
          {renderNav(SERVICE_NAV)}
        </div>

        <div className="patch-nav-section" style={{ marginTop: "auto" }}>
          <Link to="/" className="patch-nav-item" style={{ color: "rgba(255,255,255,0.38)", marginTop: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            Back to Hub
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="patch-main">
        <div className="patch-topbar">
          <div className="patch-topbar-title">{title}</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="p-btn p-btn-secondary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              Alerts
            </button>
            <button className="p-btn p-btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Run Patch Cycle
            </button>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#E8FAF1", color: "#1AB870", border: "2px solid #1AB870", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>KH</div>
          </div>
        </div>

        <div className="patch-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
