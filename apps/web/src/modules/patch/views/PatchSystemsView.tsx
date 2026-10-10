export function PatchSystemsView() {
  const SERVER_VERSIONS = [
    { name: "Windows Server 2025", desc: "Latest LCU & SSU monthly support", badge: "Supported" },
    { name: "Windows Server 2022", desc: "Full cumulative update coverage", badge: "Supported" },
    { name: "Windows Server 2019", desc: "Active patch deployment & monitoring", badge: "Supported" },
    { name: "Windows Server 2016", desc: "Servicing stack & security patches", badge: "Supported" }
  ];

  const CLIENT_VERSIONS = [
    { name: "Windows 10 v21H2", desc: "Client OS patch management", badge: "Supported" },
    { name: "Windows 10 v1809", desc: "LTSC / Enterprise servicing", badge: "Supported" },
    { name: "Windows 10 v1607", desc: "LTSC / Embedded support", badge: "Supported" },
    { name: "Windows 10 v1507", desc: "Legacy LTSC support", badge: "Supported" }
  ];

  return (
    <div className="patch-fade">
      <div className="patch-page-header">
        <div>
          <div className="patch-page-title">Supported Systems & Update Types</div>
          <div className="patch-page-desc">
            Official scope of supported Microsoft Windows Server and Client operating systems and patch packages.
          </div>
        </div>
      </div>

      {/* Update Types Grid */}
      <div className="patch-systems-grid">
        {/* LCU */}
        <div className="patch-system-card" style={{ borderTop: "4px solid #2563EB" }}>
          <div className="patch-system-tag">UPDATE TYPE 01</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0B1F3A", marginBottom: 8 }}>
            LCU — Latest Cumulative Update
          </h3>
          <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, marginBottom: 16 }}>
            Released monthly on Patch Tuesday. Bundles all security patches, bug fixes, and feature improvements for Windows OS components.
          </p>
          <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0B1F3A", textTransform: "uppercase", letterSpacing: 0.8 }}>
              Key Feature:
            </div>
            <div style={{ fontSize: 12.5, color: "#334155", marginTop: 4 }}>
              Comprehensive single-package update containing every vulnerability patch released to date.
            </div>
          </div>
        </div>

        {/* SSU */}
        <div className="patch-system-card" style={{ borderTop: "4px solid #FFC000" }}>
          <div className="patch-system-tag">UPDATE TYPE 02</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0B1F3A", marginBottom: 8 }}>
            SSU — Servicing Stack Update
          </h3>
          <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, marginBottom: 16 }}>
            Updates the Windows servicing stack — the component responsible for installing updates. Ensures the update process itself is reliable and secure.
          </p>
          <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0B1F3A", textTransform: "uppercase", letterSpacing: 0.8 }}>
              Key Feature:
            </div>
            <div style={{ fontSize: 12.5, color: "#334155", marginTop: 4 }}>
              Prevents update installation failures and guarantees integrity of the Windows Update engine.
            </div>
          </div>
        </div>
      </div>

      {/* Supported Operating Systems Section */}
      <div className="patch-card">
        <div className="patch-card-title">
          <span>Supported Windows Operating System Versions</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#FFC000", background: "#0B1F3A", padding: "4px 12px", borderRadius: 20 }}>
            Server & Client Matrix
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 16 }}>
          {/* Windows Server Column */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1F3A", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563EB" }} />
              Windows Server Platforms
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SERVER_VERSIONS.map((sys, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1F3A" }}>{sys.name}</div>
                    <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{sys.desc}</div>
                  </div>
                  <span style={{ padding: "3px 10px", background: "#ECFDF5", color: "#059669", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                    {sys.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Windows 10 Column */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1F3A", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFC000" }} />
              Windows 10 Workstation Platforms
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CLIENT_VERSIONS.map((sys, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1F3A" }}>{sys.name}</div>
                    <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{sys.desc}</div>
                  </div>
                  <span style={{ padding: "3px 10px", background: "#ECFDF5", color: "#059669", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                    {sys.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, padding: 14, background: "#FFFDF5", border: "1px solid #FFC000", borderRadius: 8, fontSize: 12.5, color: "#0B1F3A", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
          <span>ℹ️</span>
          <span><strong>Note:</strong> Patch bulletins and patch deployment exclusively cover our officially supported systems and update types.</span>
        </div>
      </div>
    </div>
  );
}
