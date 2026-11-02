import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AccountMenu, AppFooter, AppHeader, Icon, SubNav, buttonClass, type SubNavItem } from "../../design-system";
import "../../styles/patch.css";

// Every entry is a route of its own, so each page has an address that can be
// bookmarked and shared — the overview links into them rather than replacing them.
const PATCH_NAV: SubNavItem[] = [
  { to: "/patch/dashboard", label: "Overview", icon: "grid" },
  { to: "/patch/tickets/new", label: "New Patch Ticket", icon: "plus" },
  { to: "/patch/bulletins", label: "Bulletins", icon: "alert" },
  { to: "/patch/schedule", label: "Schedule", icon: "calendar" },
  { to: "/patch/process", label: "Process", icon: "refresh" },
  { to: "/patch/systems", label: "Systems", icon: "server" },
  { to: "/patch/automox", label: "Automox", icon: "cloud" },
  { to: "/patch/tiers", label: "Service tiers", icon: "layers" },
];

export function PatchLayout() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const isOverview = pathname === "/patch" || pathname === "/patch/dashboard";

  return (
    <div className="page-shell">
      <AppHeader contained actions={<AccountMenu />} />
      <SubNav
        title="Patch Management"
        items={PATCH_NAV}
        aside={
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/patch/tickets/new" className={buttonClass("primary", "sm")}>
              <Icon name="plus" /> New Patch Ticket
            </Link>
            <Link to="/patch/dashboard" hash="contact" className={buttonClass("secondary", "sm")}>
              <Icon name="mail" /> Contact experts
            </Link>
          </div>
        }
      />
      <main className="page-body patch fade-in">
        <Outlet />
      </main>

      {!isOverview && (
        <Link to="/patch/dashboard" className="patch-floating-back" aria-label="Back to Overview">
          <Icon name="arrowLeft" size={16} />
          <span>Back to Overview</span>
        </Link>
      )}

      <AppFooter />
    </div>
  );
}
