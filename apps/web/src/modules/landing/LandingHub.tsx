import { Link } from "@tanstack/react-router";
import { countByStatus } from "../../data/display";
import { HUB_MODULES } from "../../data/modules";
import { useBulletins, useProjects } from "../../queries";
import { useAuth } from "../auth/useAuth";
import {
  AccountMenu, AppFooter, AppHeader, CheckList, Icon, StatBand, Tile, TileArt, buttonClass,
} from "../../design-system";
import "../../styles/landing.css";

export function LandingHub() {
  const { user, can } = useAuth();
  const modules = HUB_MODULES.filter(m => can(m.permission));
  const canPatch = can("patch:read");
  const projects = useProjects().data;
  const bulletins = useBulletins(canPatch).data;
  const firstName = user?.name.split(" ")[0];

  // Every figure is counted from live data, and only from data this user may read.
  const figures = [
    projects && { value: projects.length, label: "Onboarding projects" },
    projects && { value: countByStatus(projects, "review") + countByStatus(projects, "sales-approval"), label: "Awaiting review" },
    projects && { value: countByStatus(projects, "onboarded"), label: "Customers onboarded" },
    canPatch && bulletins && { value: bulletins.filter(b => b.status !== "deployed").length, label: "Open patch bulletins" },
  ].filter(Boolean) as { value: number; label: string }[];

  return (
    <div className="page-shell">
      <AppHeader contained actions={<AccountMenu />} />

      <main className="hub">
        <section className="hub-hero fade-in">
          <div className="eyebrow accent">entervo smart · Service Hub</div>
          <h1 className="display display-xl hub-headline">
            Welcome back{firstName ? `, ${firstName}` : ""}.<br />
            <span className="hub-headline-sub">Where are we working today?</span>
          </h1>
          <p className="lead">
            The Service Hub is where Scheidt &amp; Bachmann staff and partners bring customers onto
            entervo smart and keep their installations secure. Pick a module below, or switch at any
            time from the header.
          </p>
        </section>

        {figures.length > 0 && (
          <section className="hub-band" aria-label="At a glance">
            <StatBand items={figures} />
          </section>
        )}

        <section className="hub-modules" aria-label="Modules">
          {modules.map((m, i) => (
            <Tile key={m.to} reverse={i % 2 === 1} media={<TileArt icon={m.icon} label={`Module 0${i + 1} · ${m.kicker}`} />}>
              <div className="eyebrow">{m.kicker}</div>
              <h2 className="display">{m.label}</h2>
              <p className="lead">{m.description}</p>
              <CheckList items={m.highlights} />
              <Link to={m.to} className={buttonClass("primary", "lg")}>
                Open {m.label} <Icon name="arrowRight" />
              </Link>
            </Tile>
          ))}
          {modules.length === 0 && (
            <div className="callout callout-neutral">
              <Icon name="info" size={16} />
              <div>Your account doesn't have access to a module yet. Ask a Service Hub administrator to assign you a role.</div>
            </div>
          )}
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
