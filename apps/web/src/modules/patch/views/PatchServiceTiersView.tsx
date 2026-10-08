export function PatchServiceTiersView() {
  return (
    <div className="patch-fade">
      <div className="patch-page-header">
        <div>
          <div className="patch-page-title">Service Tiers Overview</div>
          <div className="patch-page-desc">
            Tailored patch management service packages designed for entervo parking infrastructure.
          </div>
        </div>
      </div>

      <div className="patch-tiers-grid">
        {/* Tier 1 */}
        <div className="patch-tier-card">
          <div className="patch-tier-name">Information & Awareness</div>
          <p className="patch-tier-desc">
            Essential vulnerability advisories and monthly security bulletin intelligence for self-managed IT teams.
          </p>

          <div className="patch-feature-list">
            {[
              "Monthly Patch Bulletins",
              "Critical security update notifications",
              "Email support (business hours)",
              "Basic compliance documentation"
            ].map((f, i) => (
              <div key={i} className="patch-feature-item">
                <div className="patch-feature-check">✓</div>
                <span>{f}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: 14, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 12, color: "#64748B", textAlign: "center" }}>
            Included with Standard Maintenance
          </div>
        </div>

        {/* Tier 2 */}
        <div className="patch-tier-card recommended">
          <div className="patch-tier-badge">RECOMMENDED</div>
          <div className="patch-tier-name">Full Managed Patching Service</div>
          <p className="patch-tier-desc">
            End-to-end automated patch deployment, 24/7 monitoring, and full compliance reporting via Automox.
          </p>

          <div className="patch-feature-list">
            {[
              "Information & Awareness features included",
              "Full Patch Deployment via Automox cloud platform",
              "Priority 24/7 technical support",
              "Detailed Monthly Compliance Reports",
              "Proactive system health & reboot monitoring"
            ].map((f, i) => (
              <div key={i} className="patch-feature-item">
                <div className="patch-feature-check" style={{ background: "#FFC000", color: "#0B1F3A" }}>✓</div>
                <span style={{ fontWeight: 600, color: "#0B1F3A" }}>{f}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: 14, background: "#0B1F3A", color: "#FFC000", borderRadius: 10, fontSize: 12, fontWeight: 700, textAlign: "center" }}>
            Full Operational Peace of Mind
          </div>
        </div>
      </div>

      <div style={{ padding: 16, background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 13, color: "#334155", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 18 }}>📌</span>
        <div>
          <strong>Scope Notice:</strong> For both patch bulletins and patch deployment, coverage applies exclusively to supported systems and update types (LCU & SSU for Windows Server and Windows 10 versions).
        </div>
      </div>
    </div>
  );
}
