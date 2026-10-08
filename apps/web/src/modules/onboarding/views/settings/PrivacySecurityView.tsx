import { useState } from "react";
import { Icon } from "../../../../components/Icon";
import { Toggle } from "../../../../components/Toggle";
import { useOnboarding } from "../../context/onboardingContext";
import { UserSettingsTabs } from "./UserSettingsTabs";

export function PrivacySecurityView() {
  const { currentUser } = useOnboarding();

  // 2FA state
  const [tfaEnabled, setTfaEnabled] = useState(true);
  const [showSetup2fa, setShowSetup2fa] = useState(false);

  // Security Alerts Toggles
  const [alerts, setAlerts] = useState({
    unrecognizedLogin: true,
    passwordChanged: true,
    tfaChanged: true,
    adminEscalation: true,
    rolePermissionChange: true,
  });

  // Profile Visibility Controls
  const [visibility, setVisibility] = useState<"team" | "public" | "admins">("team");
  const [hideEmail, setHideEmail] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  // Data Privacy Controls
  const [privacy, setPrivacy] = useState({
    analytics: false,
    auditReports: true,
    thirdPartySharing: false,
  });

  // Sessions list
  const [sessions, setSessions] = useState([
    {
      id: "sess_1",
      device: "Chrome 122.0 (Windows 11)",
      ip: "195.171.142.1",
      location: "Mönchengladbach, Germany",
      lastActive: "Current Session",
      current: true,
    },
    {
      id: "sess_2",
      device: "Safari Mobile (iOS 17.4)",
      ip: "82.165.197.42",
      location: "Frankfurt, Germany",
      lastActive: "2 hours ago",
      current: false,
    },
    {
      id: "sess_3",
      device: "Firefox 123.0 (macOS Sonoma)",
      ip: "194.12.17.88",
      location: "London, United Kingdom",
      lastActive: "Yesterday, 16:45",
      current: false,
    },
  ]);

  // Login history
  const loginHistory = [
    {
      id: "log_1",
      timestamp: "Today, 10:14:22",
      status: "Success",
      ip: "195.171.142.1",
      location: "Mönchengladbach, DE",
      method: "Password + 2FA",
      browser: "Chrome / Windows",
    },
    {
      id: "log_2",
      timestamp: "Yesterday, 08:30:11",
      status: "Success",
      ip: "195.171.142.1",
      location: "Mönchengladbach, DE",
      method: "Microsoft Entra SSO",
      browser: "Chrome / Windows",
    },
    {
      id: "log_3",
      timestamp: "Mar 28, 2026 21:05:04",
      status: "Failed",
      ip: "185.220.101.5",
      location: "Tor Exit Node",
      method: "Password attempt",
      browser: "Unknown / Linux",
    },
    {
      id: "log_4",
      timestamp: "Mar 25, 2026 14:12:50",
      status: "Success",
      ip: "82.165.197.42",
      location: "Frankfurt, DE",
      method: "Password + 2FA",
      browser: "Safari / iOS",
    },
  ];

  // Trusted devices list
  const [trustedDevices, setTrustedDevices] = useState([
    {
      id: "dev_1",
      name: "S&B Workstation ThinkPad P1",
      os: "Windows 11 Enterprise",
      added: "Jan 15, 2026",
      lastUsed: "Today",
    },
    {
      id: "dev_2",
      name: "iPhone 15 Pro (Mobile Authenticator)",
      os: "iOS 17.4",
      added: "Feb 02, 2026",
      lastUsed: "2 hours ago",
    },
    {
      id: "dev_3",
      name: "YubiKey 5 NFC Hardware Key",
      os: "FIDO2 / WebAuthn",
      added: "Mar 01, 2026",
      lastUsed: "3 days ago",
    },
  ]);

  const revokeSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const removeTrustedDevice = (id: string) => {
    setTrustedDevices(trustedDevices.filter((d) => d.id !== id));
  };

  const handleDownloadSecurityAudit = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            user: currentUser.email,
            roles: currentUser.roles,
            activeSessions: sessions,
            loginHistory,
            trustedDevices,
            securityAlertsSettings: alerts,
            privacySettings: privacy,
            auditTimestamp: new Date().toISOString(),
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `security-audit-${currentUser.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fade-in">
      <UserSettingsTabs />

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* ROW 1: PASSWORD MANAGEMENT CARD & 2FA CARD */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* PASSWORD MANAGEMENT CARD */}
          <div
            style={{
              background: "white",
              border: "1px solid var(--gray-200)",
              borderRadius: 12,
              padding: 24,
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--blue-pale)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="lock" size={20} color="var(--blue-bright)" />
                </div>
                <span className="badge badge-approved">Compliant</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
                Password Management
              </h3>
              <p style={{ fontSize: 13, color: "var(--gray-600)", lineHeight: 1.4, marginBottom: 16 }}>
                Your password was last updated 14 days ago. Password policy compliance is verified.
              </p>
              <div
                style={{
                  background: "var(--gray-50)",
                  border: "1px solid var(--gray-200)",
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontSize: 12,
                  color: "var(--gray-800)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div>🔒 <strong>Length:</strong> Minimum 8 characters</div>
                <div>🛡️ <strong>Complexity:</strong> Upper, lower, numbers & symbols required</div>
                <div>⏳ <strong>Rotation Policy:</strong> Every 90 days</div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: 20, justifyContent: "center" }}
              onClick={() => (window.location.href = "/onboarding/settings/account")}
            >
              Update Password
            </button>
          </div>

          {/* TWO-FACTOR AUTHENTICATION (2FA) CARD */}
          <div
            style={{
              background: "white",
              border: "1px solid var(--gray-200)",
              borderRadius: 12,
              padding: 24,
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#E8FAF1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="shield" size={20} color="var(--green)" />
                </div>
                <button
                  type="button"
                  className={`badge ${tfaEnabled ? "badge-approved" : "badge-error"}`}
                  style={{ cursor: "pointer", border: "none" }}
                  onClick={() => setTfaEnabled(!tfaEnabled)}
                >
                  {tfaEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
                Two-Factor Authentication (2FA)
              </h3>
              <p style={{ fontSize: 13, color: "var(--gray-600)", lineHeight: 1.4, marginBottom: 16 }}>
                Add an extra layer of protection by requiring a verification code or security key upon login.
              </p>
              <div
                style={{
                  background: "var(--gray-50)",
                  border: "1px solid var(--gray-200)",
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontSize: 12,
                  color: "var(--gray-800)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div>📱 <strong>Authenticator App (TOTP):</strong> Google / Microsoft Auth linked</div>
                <div>🔑 <strong>Security Keys:</strong> 1 FIDO2 / YubiKey registered</div>
                <div>📋 <strong>Backup Codes:</strong> 8 remaining emergency codes</div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: 20, justifyContent: "center" }}
              onClick={() => setShowSetup2fa(true)}
            >
              {tfaEnabled ? "Manage 2FA & Hardware Keys" : "Set Up Two-Factor Auth"}
            </button>
          </div>
        </div>

        {/* ACTIVE SESSIONS TABLE */}
        <div
          style={{
            background: "white",
            border: "1px solid var(--gray-200)",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>Active Sessions</h3>
              <p style={{ fontSize: 12, color: "var(--gray-600)", marginTop: 2 }}>
                Devices currently authenticated into your entervo platform account.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 12, color: "var(--red)" }}
              onClick={() => setSessions(sessions.filter((s) => s.current))}
            >
              Revoke All Other Sessions
            </button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)", fontSize: 11, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                <th style={{ padding: "12px 20px" }}>Device &amp; Browser</th>
                <th style={{ padding: "12px 20px" }}>IP Address</th>
                <th style={{ padding: "12px 20px" }}>Location</th>
                <th style={{ padding: "12px 20px" }}>Last Active</th>
                <th style={{ padding: "12px 20px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 600, color: "var(--navy)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon name="server" size={16} color="var(--blue-bright)" />
                      {s.device}
                      {s.current && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: "#E8FAF1", color: "var(--green)", padding: "2px 8px", borderRadius: 12 }}>
                          This Device
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", fontFamily: "var(--mono)", color: "var(--gray-800)", fontSize: 12 }}>
                    {s.ip}
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--gray-600)" }}>{s.location}</td>
                  <td style={{ padding: "14px 20px", color: "var(--gray-600)" }}>{s.lastActive}</td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    {!s.current && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ fontSize: 11, color: "var(--red)", padding: "4px 8px" }}
                        onClick={() => revokeSession(s.id)}
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* LOGIN HISTORY TABLE */}
        <div
          style={{
            background: "white",
            border: "1px solid var(--gray-200)",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--gray-200)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>Login History Log</h3>
            <p style={{ fontSize: 12, color: "var(--gray-600)", marginTop: 2 }}>
              Recent authentication events for security auditing and compliance.
            </p>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)", fontSize: 11, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                <th style={{ padding: "12px 20px" }}>Date &amp; Time</th>
                <th style={{ padding: "12px 20px" }}>Status</th>
                <th style={{ padding: "12px 20px" }}>IP Address</th>
                <th style={{ padding: "12px 20px" }}>Location</th>
                <th style={{ padding: "12px 20px" }}>Method</th>
              </tr>
            </thead>
            <tbody>
              {loginHistory.map((h) => (
                <tr key={h.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                  <td style={{ padding: "12px 20px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--navy)" }}>
                    {h.timestamp}
                  </td>
                  <td style={{ padding: "12px 20px" }}>
                    <span
                      className={`badge ${h.status === "Success" ? "badge-approved" : "badge-error"}`}
                    >
                      {h.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 20px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--gray-800)" }}>
                    {h.ip}
                  </td>
                  <td style={{ padding: "12px 20px", color: "var(--gray-600)" }}>{h.location}</td>
                  <td style={{ padding: "12px 20px", color: "var(--gray-800)", fontWeight: 500 }}>{h.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TRUSTED DEVICES LIST */}
        <div
          style={{
            background: "white",
            border: "1px solid var(--gray-200)",
            borderRadius: 12,
            padding: 24,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>Trusted Devices List</h3>
              <p style={{ fontSize: 12, color: "var(--gray-600)", marginTop: 2 }}>
                Devices that bypass 2FA prompts for 30 days.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {trustedDevices.map((d) => (
              <div
                key={d.id}
                style={{
                  padding: 16,
                  border: "1px solid var(--gray-200)",
                  borderRadius: 10,
                  background: "var(--gray-50)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 2 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: "var(--gray-400)", fontFamily: "var(--mono)" }}>{d.os}</div>
                  <div style={{ fontSize: 11, color: "var(--gray-600)", marginTop: 8 }}>Added: {d.added}</div>
                  <div style={{ fontSize: 11, color: "var(--gray-600)" }}>Last Used: {d.lastUsed}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: 11, color: "var(--red)", marginTop: 12, padding: "4px 0", justifyContent: "flex-start" }}
                  onClick={() => removeTrustedDevice(d.id)}
                >
                  Revoke Trust
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECURITY ALERTS, PROFILE VISIBILITY & PRIVACY CONTROLS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* SECURITY ALERTS SETTINGS */}
          <div
            style={{
              background: "white",
              border: "1px solid var(--gray-200)",
              borderRadius: 12,
              padding: 24,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
              Security Alerts Settings
            </h3>
            <p style={{ fontSize: 12, color: "var(--gray-600)", marginBottom: 16 }}>
              Configure automatic notifications for account security events.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Toggle
                label="Unrecognized Login Attempts"
                sub="Alert on logins from new IPs or locations"
                value={alerts.unrecognizedLogin}
                onChange={(v) => setAlerts({ ...alerts, unrecognizedLogin: v })}
              />
              <Toggle
                label="Password Changed Alerts"
                sub="Notify whenever your password is modified"
                value={alerts.passwordChanged}
                onChange={(v) => setAlerts({ ...alerts, passwordChanged: v })}
              />
              <Toggle
                label="Two-Factor Auth State Changes"
                sub="Alert when 2FA is added or removed"
                value={alerts.tfaChanged}
                onChange={(v) => setAlerts({ ...alerts, tfaChanged: v })}
              />
              <Toggle
                label="Admin Privilege Escalation"
                sub="Notify on administrative role grants"
                value={alerts.adminEscalation}
                onChange={(v) => setAlerts({ ...alerts, adminEscalation: v })}
              />
              <Toggle
                label="Role & Permission Changes"
                sub="Alert when user RBAC policies change"
                value={alerts.rolePermissionChange}
                onChange={(v) => setAlerts({ ...alerts, rolePermissionChange: v })}
              />
            </div>
          </div>

          {/* PROFILE VISIBILITY & DATA PRIVACY CONTROLS */}
          <div
            style={{
              background: "white",
              border: "1px solid var(--gray-200)",
              borderRadius: 12,
              padding: 24,
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
                Profile Visibility Controls
              </h3>
              <p style={{ fontSize: 12, color: "var(--gray-600)", marginBottom: 12 }}>
                Control who can view your user information across the platform.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {[
                  { id: "team", label: "Internal Team Only (Default)" },
                  { id: "public", label: "Public to Partner Organisations" },
                  { id: "admins", label: "System Administrators Only" },
                ].map((v) => (
                  <label
                    key={v.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 13,
                      color: "var(--navy)",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === v.id}
                      onChange={() => setVisibility(v.id as any)}
                    />
                    {v.label}
                  </label>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Toggle
                  label="Hide Email from Non-Admins"
                  sub="Keep your email address private"
                  value={hideEmail}
                  onChange={setHideEmail}
                />
                <Toggle
                  label="Show Real-Time Online Status"
                  sub="Display green activity dot"
                  value={showOnlineStatus}
                  onChange={setShowOnlineStatus}
                />
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
                Data Privacy Controls
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Toggle
                  label="Allow Anonymous Usage Analytics"
                  sub="Help improve entervo platform features"
                  value={privacy.analytics}
                  onChange={(v) => setPrivacy({ ...privacy, analytics: v })}
                />
                <Toggle
                  label="Include in Security Audit Reports"
                  sub="Log user actions for compliance"
                  value={privacy.auditReports}
                  onChange={(v) => setPrivacy({ ...privacy, auditReports: v })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* DOWNLOAD / DELETE ACCOUNT DATA ACTIONS */}
        <div
          style={{
            background: "white",
            border: "1px solid var(--gray-200)",
            borderRadius: 12,
            padding: 24,
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>
              Download or Delete Account Data
            </h3>
            <p style={{ fontSize: 13, color: "var(--gray-600)", marginTop: 2 }}>
              Export a compliance security audit package or submit an account data deletion request under GDPR.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDownloadSecurityAudit}
            >
              <Icon name="download" size={14} /> Download Security Audit (.JSON)
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: "#DC2626", color: "white" }}
              onClick={() => alert("Permanent Account Data Deletion Request submitted to Privacy Officer.")}
            >
              Request Account Data Deletion
            </button>
          </div>
        </div>
      </div>

      {/* SETUP 2FA MODAL */}
      {showSetup2fa && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(11, 31, 58, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="fade-in"
            style={{
              background: "white",
              borderRadius: 12,
              padding: 28,
              maxWidth: 480,
              width: "90%",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--gray-200)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)", display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="shield" size={20} color="var(--green)" /> Two-Factor Authentication Setup
              </h3>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: 16, padding: "2px 8px" }}
                onClick={() => setShowSetup2fa(false)}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: 13, color: "var(--gray-600)", lineHeight: 1.5, marginBottom: 16 }}>
              Scan this QR code with your authenticator app (Google Authenticator, Microsoft Authenticator, or 1Password) to generate 6-digit codes.
            </p>
            <div
              style={{
                width: 180,
                height: 180,
                background: "var(--gray-50)",
                border: "2px dashed var(--gray-200)",
                borderRadius: 12,
                margin: "0 auto 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 12,
                color: "var(--navy)",
              }}
            >
              <span style={{ fontSize: 48, marginBottom: 8 }}>🏁</span>
              [QR CODE PLACEHOLDER]
            </div>
            <div style={{ fontSize: 12, color: "var(--gray-600)", textAlign: "center", fontFamily: "var(--mono)", background: "var(--gray-50)", padding: 8, borderRadius: 6, marginBottom: 20 }}>
              Secret Key: KAI-SB-2FA-9842-7719
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowSetup2fa(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setTfaEnabled(true);
                  setShowSetup2fa(false);
                }}
              >
                Verify &amp; Activate 2FA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
