import { useState } from "react";

export interface ProcessStepInfo {
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
    tagline: "Monthly Microsoft roll-up security patches evaluated every 2nd Tuesday",
    desc: "Systematic identification and vulnerability risk analysis of all newly released Microsoft updates.",
    details: [
      "Monitors Microsoft Patch Tuesday releases every 2nd Tuesday of the month",
      "Evaluates Severity (Critical, High, Medium, Low) and CVE threat intelligence",
      "Correlates updates against active entervo infrastructure component matrix"
    ],
    schedule: "Monthly (2nd Tuesday)",
    icon: "🔍"
  },
  {
    step: 2,
    name: "Acquire & Verify",
    tagline: "Download verified patches from trusted sources (Microsoft)",
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
    tagline: "Evaluate patches in controlled lab environment",
    desc: "Rigorous testing on staging environments representing real-world entervo parking systems.",
    details: [
      "Staged deployment across test lab servers, LCU & SSU compatibility checks",
      "Regression testing for parking management APIs, database, and device communication",
      "Performance benchmarking and roll-back plan verification"
    ],
    schedule: "7-Day Staging Window",
    icon: "🔬"
  },
  {
    step: 4,
    name: "Deploy",
    tagline: "Scheduled rollouts during off-peak hours using automated tools",
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
    tagline: "Verify successful installation and system stability",
    desc: "Real-time telemetry and post-deployment system health verification.",
    details: [
      "Continuous health monitoring of Windows OS services and entervo processes",
      "Automated error log inspection and anomaly detection",
      "Immediate alert triggering for any post-patch regression"
    ],
    schedule: "Continuous (Real-time)",
    icon: "📊"
  },
  {
    step: 6,
    name: "Report",
    tagline: "Detailed monthly reports on patch status, issues & resolutions",
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

export function PatchProcessView() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const selected = PROCESS_STEPS.find(s => s.step === activeStep) || PROCESS_STEPS[0];

  return (
    <div className="patch-fade">
      <div className="patch-page-header">
        <div>
          <div className="patch-page-title">The 6-Step Patching Process</div>
          <div className="patch-page-desc">
            A systematic, end-to-end operational framework ensuring zero-downtime security and compliance.
          </div>
        </div>
      </div>

      {/* 6-Step Horizontal Progress Selector */}
      <div className="patch-card">
        <div className="patch-card-title">
          <span>Patching Lifecycle Overview</span>
          <span style={{ fontFamily: "Outfit", fontSize: 11, fontWeight: 800, color: "#001E42", background: "#FFC200", padding: "4px 12px", borderRadius: 20 }}>
            Structured 6-Stage Pipeline
          </span>
        </div>

        <div className="patch-process-timeline">
          {PROCESS_STEPS.map(s => (
            <div
              key={s.step}
              className={`patch-process-step${activeStep === s.step ? " active" : ""}`}
              onClick={() => setActiveStep(s.step)}
              style={{ cursor: "pointer" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="patch-step-num">{s.step}</div>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
              </div>
              <div className="patch-step-title">{s.name}</div>
              <div className="patch-step-desc">{s.schedule}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Step Detailed Card */}
      <div className="patch-card" style={{ borderLeft: "5px solid #FFC200" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#001E42", color: "#FFC200", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, boxShadow: "0 4px 14px rgba(0, 30, 66, 0.15)" }}>
            {selected.icon}
          </div>
          <div>
            <div style={{ fontFamily: "Outfit", fontSize: 11.5, fontWeight: 800, color: "#0066CC", textTransform: "uppercase", letterSpacing: 1.2 }}>
              Stage {selected.step} of 6
            </div>
            <h3 style={{ fontFamily: "Outfit", fontSize: 24, fontWeight: 800, color: "#001E42", margin: "2px 0 4px" }}>
              {selected.name}
            </h3>
            <p style={{ fontSize: 14.5, fontWeight: 600, color: "#334155" }}>
              {selected.tagline}
            </p>
          </div>
        </div>

        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65, marginBottom: 22 }}>
          {selected.desc}
        </p>

        <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: 22 }}>
          <div style={{ fontFamily: "Outfit", fontSize: 12, fontWeight: 800, color: "#001E42", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
            Key Operational Deliverables &amp; Safeguards:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {selected.details.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13.5, color: "#1E293B", fontWeight: 500 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#001E42", color: "#FFC200", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                  ✓
                </span>
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
