import { useState } from "react";

interface ProcessStepInfo {
  step: number;
  name: string;
  tagline: string;
  desc: string;
  details: string[];
  schedule: string;
  icon: string;
}

const PROCESS_STEPS: ProcessStepInfo[] = [
  {
    step: 1,
    name: "Assess & Identify",
    tagline: "Monthly Microsoft Patch Tuesday updates reviewed",
    desc: "Systematic identification and vulnerability risk analysis of all newly released Microsoft updates.",
    details: [
      "Monitors Microsoft Patch Tuesday releases every 2nd Tuesday of the month",
      "Evaluates Severity (Critical, High, Medium, Low) and CVE threat intelligence",
      "Correlates updates against active infrastructure component matrix"
    ],
    schedule: "Monthly (2nd Tuesday)",
    icon: "🔍"
  },
  {
    step: 2,
    name: "Acquire & Verify",
    tagline: "Download verified patches from trusted sources",
    desc: "Secure acquisition and digital signature verification of official binaries from Microsoft WSUS.",
    details: [
      "Direct encrypted retrieval from official Microsoft Catalog and WSUS endpoints",
      "SHA-256 hash checksum verification and Microsoft digital signature validation",
      "Staging binaries into isolated repository prior to test bench deployment"
    ],
    schedule: "Post-Assessment",
    icon: "🛡️"
  },
  {
    step: 3,
    name: "Test & Evaluate",
    tagline: "Validate updates in controlled environments",
    desc: "Rigorous testing on staging environments representing real-world production systems.",
    details: [
      "Staged deployment across test lab servers, LCU & SSU compatibility checks",
      "Regression testing for management APIs, database, and device communication",
      "Performance benchmarking and roll-back plan verification"
    ],
    schedule: "7-Day Staging Window",
    icon: "🔬"
  },
  {
    step: 4,
    name: "Deploy",
    tagline: "Automated off-hours deployment",
    desc: "Automated, policy-driven patch installation scheduled during maintenance windows.",
    details: [
      "Scheduled execution during off-peak maintenance hours to prevent operational disruption",
      "Automated policy push via Automox cloud orchestration",
      "Pre-patch snapshot creation and graceful service shutdown protocols"
    ],
    schedule: "Off-Peak Maintenance",
    icon: "🚀"
  },
  {
    step: 5,
    name: "Monitor",
    tagline: "Verify installation and platform stability",
    desc: "Real-time telemetry and post-deployment system health verification.",
    details: [
      "Continuous health monitoring of Windows OS services and application processes",
      "Automated error log inspection and anomaly detection",
      "Immediate alert triggering for any post-patch regression"
    ],
    schedule: "Continuous (Real-time)",
    icon: "📊"
  },
  {
    step: 6,
    name: "Report",
    tagline: "Detailed compliance and deployment reports",
    desc: "Comprehensive executive reporting and compliance documentation.",
    details: [
      "Detailed breakdown of patch compliance rate across all registered endpoints",
      "Audit-ready records for corporate security & IT governance compliance",
      "Documentation of issues resolved, reboot status, and security posture score"
    ],
    schedule: "End of Month",
    icon: "📋"
  }
];

export function PatchDashboardView() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const selectedStep = PROCESS_STEPS.find(s => s.step === activeStep) || PROCESS_STEPS[0];

  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState({ name: "", company: "", email: "", message: "" });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setFormSubmitted(true);
    }
  };

  const handleScrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const WHY_CARDS = [
    { title: "Security", desc: "Protect systems against vulnerabilities and cyber threats.", icon: "🛡️" },
    { title: "Compliance", desc: "Meet regulatory and internal security requirements.", icon: "📜" },
    { title: "Stability", desc: "Reduce system crashes and software issues.", icon: "⚙️" },
    { title: "Performance", desc: "Keep systems optimized and running efficiently.", icon: "🚀" },
    { title: "Cost Efficiency", desc: "Reduce downtime and support costs.", icon: "💡" },
    { title: "User Confidence", desc: "Deliver reliable and secure IT services.", icon: "🤝" }
  ];

  const SUPPORTED_OS = [
    { name: "Windows Server 2025", type: "Server OS", badge: "Latest Release" },
    { name: "Windows Server 2022", type: "Server OS", badge: "Standard" },
    { name: "Windows Server 2019", type: "Server OS", badge: "Active" },
    { name: "Windows Server 2016", type: "Server OS", badge: "Supported" },
    { name: "Windows 10 v21H2", type: "Client OS", badge: "Enterprise" },
    { name: "Windows 10 v1809", type: "Client OS", badge: "LTSB / LTSC" },
    { name: "Windows 10 v1607", type: "Client OS", badge: "LTSB" },
    { name: "Windows 10 v1507", type: "Client OS", badge: "LTSB" }
  ];

  return (
    <div className="patch-fade">
      {/* 1. HERO SECTION */}
      <section id="hero" className="cyber-hero-section" style={{ scrollMarginTop: 100 }}>
        <div className="cyber-hero-left">
          <div className="cyber-badge">
            <span className="cyber-badge-dot" />
            AUTOMATED PATCH ORCHESTRATION · CLOUD NATIVE
          </div>
          <h1 className="cyber-hero-title">
            Protect Your IT Infrastructure with <span>Automated Patch Management</span>
          </h1>
          <p className="cyber-hero-sub">
            Stay secure, compliant, and optimized through proactive patch deployment and continuous telemetry monitoring. Engineered for high-availability enterprise environments.
          </p>
          <div className="cyber-hero-actions">
            <button className="cyber-btn-primary" onClick={() => handleScrollTo("#contact")}>
              ⚡ Request Demo
            </button>
            <button className="cyber-btn-secondary" onClick={() => handleScrollTo("#contact")}>
              ✉️ Contact Us
            </button>
          </div>
        </div>

        <div className="cyber-hero-right">
          <div className="cyber-hero-gfx">
            <img src="/cyber_dashboard.png" alt="3D Cybersecurity Dashboard Illustration" />
          </div>
        </div>
      </section>

      {/* 2. WHY PATCH MANAGEMENT */}
      <section id="why" style={{ scrollMarginTop: 100, marginBottom: 56 }}>
        <div className="cyber-section-header">
          <h2 className="cyber-section-title">Why Patch Management Matters</h2>
          <p className="cyber-section-sub">
            Proactive cyber hygiene built to safeguard critical enterprise assets and minimize exposure.
          </p>
        </div>

        <div className="cyber-grid-3">
          {WHY_CARDS.map((c, i) => (
            <div key={i} className="cyber-card">
              <div className="cyber-icon-box">{c.icon}</div>
              <div className="cyber-card-title">{c.title}</div>
              <div className="cyber-card-desc">{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. OUR PATCH MANAGEMENT PROCESS */}
      <section id="process" style={{ scrollMarginTop: 100, marginBottom: 56 }}>
        <div className="cyber-section-header">
          <h2 className="cyber-section-title">Our Patch Management Process</h2>
          <p className="cyber-section-sub">
            Structured 6-stage operational pipeline guaranteeing zero-downtime security.
          </p>
        </div>

        <div className="cyber-timeline">
          {PROCESS_STEPS.map(s => (
            <div
              key={s.step}
              className={`cyber-timeline-step${activeStep === s.step ? " active" : ""}`}
              onClick={() => setActiveStep(s.step)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="cyber-step-num">{s.step}</div>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
              </div>
              <div className="cyber-step-title">{s.name}</div>
              <div className="cyber-step-desc">{s.tagline}</div>
            </div>
          ))}
        </div>

        {/* Selected Step Inspector Box */}
        <div style={{ marginTop: 24, background: "#111827", border: "2px solid #FFC200", borderRadius: 20, padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", borderLeft: "6px solid #FFC200" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255, 194, 0, 0.15)", color: "#FFC200", border: "1px solid #FFC200", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
              {selectedStep.icon}
            </div>
            <div>
              <div style={{ fontFamily: "Outfit", fontSize: 12, fontWeight: 800, color: "#FFC200", textTransform: "uppercase", letterSpacing: 1.2 }}>
                Stage {selectedStep.step} of 6 Process Pipeline
              </div>
              <h3 style={{ fontFamily: "Outfit", fontSize: 24, fontWeight: 900, color: "#FFFFFF", margin: "2px 0 4px" }}>
                {selectedStep.name}
              </h3>
              <p style={{ fontSize: 14.5, fontWeight: 600, color: "#CBD5E1" }}>
                {selectedStep.tagline}
              </p>
            </div>
          </div>

          <p style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.6, marginBottom: 20 }}>
            {selectedStep.desc}
          </p>

          <div style={{ background: "#0A1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontFamily: "Outfit", fontSize: 12, fontWeight: 800, color: "#FFC200", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Key Execution Deliverables &amp; Safeguards:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {selectedStep.details.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13.5, color: "#FFFFFF", fontWeight: 500 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#FFC200", color: "#0A1120", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 }}>
                    ✓
                  </span>
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SUPPORTED SYSTEMS */}
      <section id="systems" style={{ scrollMarginTop: 100, marginBottom: 56 }}>
        <div className="cyber-section-header">
          <h2 className="cyber-section-title">Supported Systems &amp; Update Types</h2>
          <p className="cyber-section-sub">
            Validated support across Windows Server, Windows Client OS, and Microsoft Servicing Stack updates.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 28 }}>
          {SUPPORTED_OS.map((os, i) => (
            <div key={i} className="cyber-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>🪟</span>
                <span style={{ fontFamily: "Outfit", fontSize: 10.5, fontWeight: 800, background: "rgba(255, 194, 0, 0.15)", color: "#FFC200", border: "1px solid rgba(255, 194, 0, 0.3)", padding: "2px 8px", borderRadius: 10 }}>
                  {os.badge}
                </span>
              </div>
              <div style={{ fontFamily: "Outfit", fontSize: 15, fontWeight: 800, color: "#FFFFFF" }}>{os.name}</div>
              <div style={{ fontSize: 12, color: "#CBD5E1", marginTop: 4 }}>{os.type}</div>
            </div>
          ))}
        </div>

        {/* LCU & SSU Update Type Cards */}
        <div className="cyber-grid-2">
          <div className="cyber-card" style={{ borderTop: "4px solid #FFC200" }}>
            <div className="cyber-icon-box">📦</div>
            <div style={{ fontFamily: "Outfit", fontSize: 20, fontWeight: 900, color: "#FFFFFF", marginBottom: 6 }}>
              LCU (Latest Cumulative Updates)
            </div>
            <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.6 }}>
              Monthly cumulative updates consolidating security patches, performance improvements, and bug fixes into a single reliable installation package.
            </div>
          </div>

          <div className="cyber-card" style={{ borderTop: "4px solid #FFC200" }}>
            <div className="cyber-icon-box" style={{ background: "#FFC200", color: "#0A1120" }}>⚙️</div>
            <div style={{ fontFamily: "Outfit", fontSize: 20, fontWeight: 900, color: "#FFFFFF", marginBottom: 6 }}>
              SSU (Servicing Stack Updates)
            </div>
            <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.6 }}>
              Servicing stack updates providing critical fixes to the core update installer component, ensuring seamless LCU installation and zero deployment failures.
            </div>
          </div>
        </div>
      </section>

      {/* 5. AUTOMOX PLATFORM */}
      <section id="automox" style={{ scrollMarginTop: 100, marginBottom: 56 }}>
        <div className="automox-section-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div className="cyber-section-header" style={{ marginBottom: 0 }}>
              <div style={{ fontFamily: "Outfit", fontSize: 12, fontWeight: 800, color: "#FFC200", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>
                CLOUD-NATIVE AUTOMATION ENGINE
              </div>
              <h2 className="cyber-section-title">Powered by Automox</h2>
              <p className="cyber-section-sub">
                The world's first cloud-native patch management platform delivering zero-touch automation and real-time posture enforcement.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", color: "#10B981", padding: "6px 14px", borderRadius: 20, fontFamily: "Outfit", fontSize: 11.5, fontWeight: 800 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
                AUTOMOX CLOUD ONLINE
              </span>
            </div>
          </div>

          {/* Automox Live Platform Picture */}
          <div style={{ borderRadius: 20, overflow: "hidden", border: "2px solid #FFC200", marginBottom: 32, boxShadow: "0 16px 40px rgba(0, 0, 0, 0.6)" }}>
            <img src="/automox_live_platform.png" alt="Modern Automox Cloud Platform Visualization" style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

          {/* Features Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 32 }}>
            {[
              { title: "Automated Deployment", desc: "Policy-driven background patch installation." },
              { title: "Cloud-Native Architecture", desc: "Zero on-prem infrastructure required." },
              { title: "Cross-Platform Support", desc: "Unified coverage for Windows Server & Desktop." },
              { title: "Real-Time Compliance", desc: "Instant visibility into system health telemetry." }
            ].map((f, i) => (
              <div key={i} style={{ background: "#0A1120", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
                <div style={{ fontFamily: "Outfit", fontSize: 14.5, fontWeight: 800, color: "#FFC200", marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 12.5, color: "#CBD5E1", lineHeight: 1.45 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Terminal / Worklet Code Inspector */}
          <div style={{ background: "#0A1120", color: "#F8FAFC", borderRadius: 16, padding: 24, fontFamily: "monospace", fontSize: 13, lineHeight: 1.6, border: "1px solid rgba(255,194,0,0.4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.12)", paddingBottom: 12, marginBottom: 14, fontFamily: "Outfit", fontSize: 12, fontWeight: 800, color: "#FFC200" }}>
              <span>⚡ AUTOMOX CLOUD WORKLET ORCHESTRATION</span>
              <span>LIVE TELEMETRY: 4,280 NODES SYNCED</span>
            </div>
            <div style={{ color: "#38BDF8" }}># Automated Policy Enforcement: Monthly Security Rollup</div>
            <div>Get-Service -Name "EntervoService" | Stop-Service -Force</div>
            <div style={{ color: "#34D399" }}>Write-Output "[SUCCESS] Gracefully frozen local application endpoints"</div>
            <div>Invoke-AutomoxPatchPolicy -PolicyId "POL-2026-AUTOMATED-LCU"</div>
            <div style={{ color: "#FFC200" }}>Write-Output "[STATUS] 100% Patch verification passed. Re-enabling operational services..."</div>
          </div>

          {/* Architecture Diagram */}
          <div style={{ fontFamily: "Outfit", fontSize: 15, fontWeight: 800, color: "#FFFFFF", margin: "28px 0 12px" }}>
            Automox Architecture &amp; Data Flow:
          </div>
          <div className="automox-diagram-flow">
            <div className="automox-node">
              <div style={{ fontSize: 24, marginBottom: 4 }}>💻</div>
              <div className="automox-node-title">Endpoint Devices</div>
            </div>
            <div className="automox-node-arrow">→</div>

            <div className="automox-node">
              <div style={{ fontSize: 24, marginBottom: 4 }}>🤖</div>
              <div className="automox-node-title">Automox Agent</div>
            </div>
            <div className="automox-node-arrow">→</div>

            <div className="automox-node" style={{ borderColor: "#FFC200", background: "rgba(255, 194, 0, 0.12)" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>☁️</div>
              <div className="automox-node-title">Cloud Management Platform</div>
            </div>
            <div className="automox-node-arrow">→</div>

            <div className="automox-node">
              <div style={{ fontSize: 24, marginBottom: 4 }}>⚡</div>
              <div className="automox-node-title">Automated Policies</div>
            </div>
            <div className="automox-node-arrow">→</div>

            <div className="automox-node">
              <div style={{ fontSize: 24, marginBottom: 4 }}>📊</div>
              <div className="automox-node-title">Reporting &amp; Compliance</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SERVICE TIERS */}
      <section id="tiers" style={{ scrollMarginTop: 100, marginBottom: 56 }}>
        <div className="cyber-section-header">
          <h2 className="cyber-section-title">Service Tiers &amp; Plans</h2>
          <p className="cyber-section-sub">
            Enterprise service packages tailored to customer IT governance requirements.
          </p>
        </div>

        <div className="cyber-grid-2">
          <div className="tier-card">
            <div className="tier-title">Information &amp; Awareness</div>
            <div className="tier-desc">
              Essential threat intelligence and patch release notification service empowering internal IT teams.
            </div>
            <div style={{ flex: 1 }}>
              {[
                "Monthly Patch Bulletins",
                "Critical Security Notifications",
                "Email Support",
                "Compliance Documentation"
              ].map((f, i) => (
                <div key={i} className="tier-feature">
                  <div className="tier-check">✓</div>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <button className="cyber-btn-secondary" style={{ marginTop: 24, justifyContent: "center" }} onClick={() => handleScrollTo("#contact")}>
              Select Information Tier
            </button>
          </div>

          <div className="tier-card recommended">
            <span className="tier-badge">RECOMMENDED</span>
            <div className="tier-title" style={{ color: "#FFC200" }}>Managed Patch Service</div>
            <div className="tier-desc">
              Comprehensive end-to-end patch orchestration, lab testing, off-hours deployment, and continuous monitoring.
            </div>
            <div style={{ flex: 1 }}>
              {[
                "Everything in Information & Awareness",
                "Full Patch Deployment",
                "Automox Integration",
                "24/7 Priority Support",
                "Monthly Reporting",
                "Proactive Monitoring"
              ].map((f, i) => (
                <div key={i} className="tier-feature">
                  <div className="tier-check">✓</div>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <button className="cyber-btn-primary" style={{ marginTop: 24, justifyContent: "center" }} onClick={() => handleScrollTo("#contact")}>
              Get Started with Managed Service
            </button>
          </div>
        </div>
      </section>

      {/* 8. FUTURE ROADMAP */}
      <section id="roadmap" style={{ scrollMarginTop: 100, marginBottom: 56 }}>
        <div className="cyber-section-header">
          <h2 className="cyber-section-title">Next Steps &amp; Future Roadmap</h2>
          <p className="cyber-section-sub">
            Next-generation platform capabilities currently in active engineering.
          </p>
        </div>

        <div className="cyber-grid-2">
          <div className="cyber-card" style={{ borderLeft: "4px solid #FFC200" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>⚡</span>
              <span style={{ fontFamily: "Outfit", fontSize: 11, fontWeight: 800, background: "rgba(255, 194, 0, 0.15)", color: "#FFC200", padding: "3px 10px", borderRadius: 12 }}>
                In Development
              </span>
            </div>
            <div style={{ fontFamily: "Outfit", fontSize: 20, fontWeight: 900, color: "#FFFFFF", marginBottom: 8 }}>
              .NET Framework Support
            </div>
            <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.6 }}>
              Expanded automated policy orchestration for standalone .NET Framework cumulative security rollups across application servers.
            </div>
          </div>

          <div className="cyber-card" style={{ borderLeft: "4px solid #FFC200" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>🚀</span>
              <span style={{ fontFamily: "Outfit", fontSize: 11, fontWeight: 800, background: "rgba(255, 194, 0, 0.15)", color: "#FFC200", padding: "3px 10px", borderRadius: 12 }}>
                Coming Q1 2027
              </span>
            </div>
            <div style={{ fontFamily: "Outfit", fontSize: 20, fontWeight: 900, color: "#FFFFFF", marginBottom: 8 }}>
              Windows 11 Support
            </div>
            <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.6 }}>
              Native compatibility verification and feature update servicing for Windows 11 Enterprise (22H2 / 23H2 / 24H2) desktop fleets.
            </div>
          </div>
        </div>
      </section>

      {/* 9. CONTACT SECTION */}
      <section id="contact" className="contact-section-box" style={{ scrollMarginTop: 100 }}>
        <div>
          <div style={{ fontFamily: "Outfit", fontSize: 12, fontWeight: 800, color: "#FFC200", textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 8 }}>
            SCHEIDT &amp; BACHMANN CYBERSECURITY TEAM
          </div>
          <h2 style={{ fontFamily: "Outfit", fontSize: 32, fontWeight: 900, color: "#FFFFFF", margin: "0 0 16px" }}>
            Talk With Our Security Experts
          </h2>
          <p style={{ fontSize: 15, color: "#CBD5E1", lineHeight: 1.65, marginBottom: 32 }}>
            Schedule a consultation with our senior security architects to evaluate your infrastructure patch readiness.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#0A1120", padding: 16, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255, 194, 0, 0.15)", color: "#FFC200", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📞</div>
              <div>
                <div style={{ fontSize: 12, color: "#CBD5E1" }}>Direct Phone Support</div>
                <div style={{ fontFamily: "Outfit", fontSize: 16, fontWeight: 800, color: "#FFFFFF" }}>+49 2166 266-0</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#0A1120", padding: 16, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255, 194, 0, 0.15)", color: "#FFC200", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✉️</div>
              <div>
                <div style={{ fontSize: 12, color: "#CBD5E1" }}>Email Consultation Desk</div>
                <div style={{ fontFamily: "Outfit", fontSize: 16, fontWeight: 800, color: "#FFFFFF" }}>customer@scheidt-bachmann.de</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          {formSubmitted ? (
            <div style={{ background: "#0A1120", border: "2px solid #FFC200", borderRadius: 18, padding: 36, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <h3 style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 900, color: "#FFC200", marginBottom: 8 }}>
                Request Submitted Successfully!
              </h3>
              <p style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.6 }}>
                Thank you for contacting Scheidt &amp; Bachmann IT Security. Our patch specialist team will reach out to <strong>{formData.email}</strong> within 24 hours.
              </p>
              <button
                className="cyber-btn-secondary"
                style={{ marginTop: 20 }}
                onClick={() => { setFormSubmitted(false); setFormData({ name: "", company: "", email: "", message: "" }); }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#CBD5E1", marginBottom: 6 }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marc Delvaux"
                  className="contact-input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#CBD5E1", marginBottom: 6 }}>Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Scheidt & Bachmann Maghreb"
                  className="contact-input"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#CBD5E1", marginBottom: 6 }}>Business Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. customer@scheidt-bachmann.de"
                  className="contact-input"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#CBD5E1", marginBottom: 6 }}>Message / Infrastructure Requirements</label>
                <textarea
                  rows={4}
                  placeholder="Describe your Windows Server and workstation endpoint count..."
                  className="contact-input"
                  style={{ resize: "vertical" }}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="cyber-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                ⚡ Send Request
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
