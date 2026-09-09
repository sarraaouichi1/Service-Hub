import { useNavigate } from "@tanstack/react-router";
import { PATCH_SERVICE_TIERS, PATCH_STAGES } from "../../../data/patch";
import type { PatchServiceTier } from "../../../types";

const CheckIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="2,6 5,9 10,3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/**
 * Dashboard and the two service-tier screens share one component: the tier
 * routes pass a `tier`, which hides the hero/stats and narrows the tier list.
 */
export function PatchDashboardView({ tier }: { tier?: PatchServiceTier["id"] }) {
  const navigate = useNavigate();
  const isDashboard = tier === undefined;

  return (
  <div className="patch-fade">

    {isDashboard && <>
    {/* Hero Banner */}
    <div className="patch-hero">
      <div className="patch-hero-left">
        <div className="patch-hero-live">
          <span className="patch-hero-live-dot" />
          WSUS CONNECTED · LIVE
        </div>
        <div className="patch-hero-h1">Proactive Patch Management</div>
        <div className="patch-hero-h2">Secure. Stable.<br /><em>Compliant.</em></div>
        <div className="patch-hero-desc">Protecting your infrastructure from evolving cybersecurity threats through a systematic, multi-stage approach.</div>
        <button className="patch-hero-btn" onClick={() => navigate({ to: "/patch/bulletins" })}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1F3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Explore Services
        </button>
      </div>
      <div className="patch-hero-right">
        <div className="patch-hero-shield">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9,12 11,14 15,10" stroke="#1AB870" strokeWidth="2.5"/>
          </svg>
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className="patch-stat-grid">
      <div className="patch-stat-card">
        <div className="patch-stat-label">Patches Applied</div>
        <div className="patch-stat-value">247</div>
        <div className="patch-stat-sub" style={{ color: "#1AB870" }}>&#8593; 18 this month</div>
      </div>
      <div className="patch-stat-card">
        <div className="patch-stat-label">Critical Pending</div>
        <div className="patch-stat-value" style={{ color: "#E84040" }}>2</div>
        <div className="patch-stat-sub" style={{ color: "#E84040" }}>&#9888; Immediate action</div>
      </div>
      <div className="patch-stat-card">
        <div className="patch-stat-label">Systems Covered</div>
        <div className="patch-stat-value">34</div>
        <div className="patch-stat-sub" style={{ color: "#95A3B8" }}>Across 6 sites</div>
      </div>
      <div className="patch-stat-card">
        <div className="patch-stat-label">Compliance Score</div>
        <div className="patch-stat-value" style={{ color: "#1AB870" }}>94%</div>
        <div className="patch-stat-sub" style={{ color: "#1AB870" }}>&#8593; 3% vs last cycle</div>
      </div>
    </div>

    </>}

    {/* Service Tiers — the dashboard lists both, the tier views show one */}
    <div className="patch-section-title">
      {isDashboard ? "Our Service Tiers" : PATCH_SERVICE_TIERS.find(t => t.id === tier)?.name}
    </div>
    <div className="patch-service-grid" style={isDashboard ? undefined : { gridTemplateColumns: "minmax(0, 520px)" }}>
      {PATCH_SERVICE_TIERS.filter(t => isDashboard || t.id === tier).map(t => (
        <div key={t.id} className={`patch-service-card${t.popular ? " popular" : ""}`}>
          {t.popular && <div className="patch-popular-badge">MOST POPULAR</div>}
          <div className="patch-service-title">{t.name}</div>
          {t.features.map(f => (
            <div key={f} className="patch-check-row">
              <div className="patch-check-icon"><CheckIcon /></div>
              {f}
            </div>
          ))}
          <button className={`patch-service-btn ${t.id}`}>Learn More</button>
        </div>
      ))}
    </div>

    {/* 5-Stage Process */}
    <div className="patch-process-wrap">
      <div className="patch-process-title">The entervo 5-Stage Patching Process</div>
      <div className="patch-stages" style={{ position: "relative" }}>
        <div className="patch-stages-line" />
        {PATCH_STAGES.map(s => (
          <div key={s.num} className="patch-stage">
            <div style={{ position: "relative" }}>
              <div className="patch-stage-circle" style={{ background: s.color }} dangerouslySetInnerHTML={{ __html: s.icon }} />
              <div className="patch-stage-num">{s.num}</div>
            </div>
            <div className="patch-stage-name">{s.name}</div>
            <div className="patch-stage-desc">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>

  </div>
  );
}
