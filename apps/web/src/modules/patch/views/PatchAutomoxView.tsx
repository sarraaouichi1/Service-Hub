export function PatchAutomoxView() {
  const PILLARS = [
    { title: "Automated", desc: "Click, set, forget — patches deploy automatically according to schedule.", icon: "⚡" },
    { title: "Cloud-Native", desc: "Zero on-premise server infrastructure required for deployment.", icon: "☁️" },
    { title: "Cross-Platform", desc: "Unified endpoint management across Windows, macOS, and Linux.", icon: "💻" },
    { title: "Real-Time Reporting", desc: "Instant visibility into security posture and compliance metrics.", icon: "📈" }
  ];

  const STAGES = [
    { num: 1, title: "Agent Installation", desc: "Lightweight agent on each endpoint" },
    { num: 2, title: "Cloud Communication", desc: "Encrypted connection to Automox cloud" },
    { num: 3, title: "Policy Deployment", desc: "Central console policy & schedule configuration" },
    { num: 4, title: "Automated Actions", desc: "Automated execution based on policies" },
    { num: 5, title: "Reporting & Audit", desc: "Real-time compliance status & logging" }
  ];

  return (
    <div className="patch-fade">
      <div className="patch-page-header">
        <div>
          <div className="patch-page-title">Automox Cloud-Native Platform</div>
          <div className="patch-page-desc">
            Modern, automated patch management for modern businesses — simple, powerful, and cloud-driven.
          </div>
        </div>
      </div>

      {/* Hero Card */}
      <div className="patch-hero" style={{ background: "linear-gradient(135deg, #0B1F3A 0%, #1E3A8A 55%, #0B1F3A 100%)", border: "1px solid #FFC000" }}>
        <div className="patch-hero-left">
          <div className="patch-hero-live">
            <span className="patch-hero-live-dot" />
            AUTOMOX CLOUD ORCHESTRATION
          </div>
          <h2 className="patch-hero-h2">
            The World’s First <em>Cloud-Native</em> Patch Platform
          </h2>
          <p className="patch-hero-desc">
            Automox delivers automated, cloud-managed patch deployment across all parking endpoints without expensive on-premise infrastructure.
          </p>
        </div>
        <div className="patch-hero-right">
          <div style={{ padding: 20, background: "rgba(255,255,255,0.1)", borderRadius: 14, border: "1px solid rgba(255,192,0,0.4)", textAlign: "center" }}>
            <div style={{ fontSize: 32 }}>☁️</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#FFC000", marginTop: 6 }}>Automox Engine</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>Zero On-Prem Required</div>
          </div>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="patch-benefits-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {PILLARS.map((p, i) => (
          <div key={i} className="patch-benefit-card" style={{ borderTop: "3px solid #FFC000" }}>
            <div className="patch-benefit-icon">{p.icon}</div>
            <div className="patch-benefit-title">{p.title}</div>
            <div className="patch-benefit-desc">{p.desc}</div>
          </div>
        ))}
      </div>

      {/* How Automox Works Architecture */}
      <div className="patch-card">
        <div className="patch-card-title">
          <span>How Automox Works — 5-Stage Architecture</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#FFC000", background: "#0B1F3A", padding: "4px 12px", borderRadius: 20 }}>
            Policy-Driven Flow
          </span>
        </div>

        <div className="patch-automox-grid">
          {STAGES.map(s => (
            <div key={s.num} className="patch-automox-card">
              <div className="patch-automox-badge">{s.num}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0B1F3A", marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 11.5, color: "#64748B", lineHeight: 1.45 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Scripting & Tasks Automation */}
      <div className="patch-card" style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #FFFDF5 100%)", border: "1.5px solid #FFC000" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 24 }}>⚡</span>
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 800, color: "#0B1F3A" }}>
              Custom Scripting & Admin Task Automation
            </h4>
            <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 2 }}>
              Provides automation flexibility beyond standard patching for complete endpoint control.
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
          {[
            { title: "Log Retrieval & Analysis", desc: "Automated retrieval of Windows event logs & entervo system diagnostics" },
            { title: "System Monitoring", desc: "Continuous uptime verification & disk space health checks" },
            { title: "Policy Enforcement & Fixes", desc: "Automatic remediation scripts for non-compliant endpoint configurations" }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: 14, background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0B1F3A", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.4 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
