import { useNavigate } from "@tanstack/react-router";
import { clickable } from "../../components/clickable";
import "../../styles/landing.css";

export function LandingHub() {
  const navigate = useNavigate();
  return (
    <div className="hub-root">
      <div className="hub-bg-glow" />
      <div className="hub-grid-bg" />

      <div className="hub-inner">
        {/* Logo */}
        <div className="hub-logo">
          <img src="/sb-logo.svg" alt="Scheidt &amp; Bachmann" className="brand-wordmark hub-wordmark" />
          <div className="hub-logo-divider" />
          <div>
            <div className="hub-logo-sub">IT Security Platform</div>
          </div>
        </div>

        {/* Status pill */}
        <div className="hub-pill">
          <span className="hub-pill-dot" />
          Platform v2.4 · All systems operational
        </div>

        {/* Headline */}
        <div className="hub-headline">Welcome to the<br />Platform Hub</div>
        <div className="hub-sub">Choose a module below to get started with your workflow.</div>

        {/* Cards */}
        <div className="hub-cards">
          {/* Onboarding */}
          <div className="hub-card onboarding" {...clickable(() => navigate({ to: "/onboarding" }))}>
            <div className="hub-card-header">
              <div className="hub-card-icon blue">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span className="hub-module-badge blue">Module 01</span>
            </div>
            <div className="hub-card-title">Onboarding</div>
            <div className="hub-card-desc">Manage the full lifecycle of partner onboarding — from product selection through S&B review and approval.</div>
            <div className="hub-divider" />
            <div className="hub-card-features">
              {["Multi-step wizard workflow", "Review queue & approvals", "Partner & PSP management"].map(f => (
                <div key={f} className="hub-card-feat">
                  <div className="hub-feat-check blue">✓</div>
                  {f}
                </div>
              ))}
            </div>
            <button className="hub-card-btn blue" onClick={(e) => { e.stopPropagation(); navigate({ to: "/onboarding" }); }}>
              Open Onboarding <span className="hub-card-arrow-icon">→</span>
            </button>
          </div>

          {/* Patch */}
          <div className="hub-card patch" {...clickable(() => navigate({ to: "/patch" }))}>
            <div className="hub-card-header">
              <div className="hub-card-icon green">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span className="hub-module-badge green">Module 02</span>
            </div>
            <div className="hub-card-title">Patch Management</div>
            <div className="hub-card-desc">Proactive patch management for entervo systems — secure, stable, and compliant through a 5-stage process.</div>
            <div className="hub-divider" />
            <div className="hub-card-features">
              {["5-stage patching pipeline", "WSUS-based acquisition", "Automated deployment & monitoring"].map(f => (
                <div key={f} className="hub-card-feat">
                  <div className="hub-feat-check green">✓</div>
                  {f}
                </div>
              ))}
            </div>
            <button className="hub-card-btn green" onClick={(e) => { e.stopPropagation(); navigate({ to: "/patch" }); }}>
              Open Patch Management <span className="hub-card-arrow-icon">→</span>
            </button>
          </div>
        </div>

        <div className="hub-footer">© 2025 Scheidt & Bachmann GmbH · entervo IT Security</div>
      </div>
    </div>
  );
}
