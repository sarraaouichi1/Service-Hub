import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "../../../components/Icon";
import { useAuth } from "../../auth/useAuth";
import { createPatchTicket } from "../../../api/resources";

export function PatchTicketCreateView() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    carparkName: "",
    customerAccount: user?.company || user?.partner || "Pollux Grundstücksgesellschaft (m.b.H & Co. Verwaltungs-KG)",
    contactName: user?.name || "Oliver Gollan",
    contactEmail: user?.email || "Oliver.Gollan@ece.com",
    contactPhone: user?.phone || "+49 40 608760",
    cpqOrderNumber: "CPQ-2026-9841",
    contractNumber: "4600017805",
    numberOfDevices: 1,
    entervoVersion: "V2 R5 M8",
    operatingSystem: "Windows Server 2019",
    ipAddress1: "10.50.38.100",
    ipAddress2: "",
    ipAddress3: "",
    remoteAccess: "",
    priority: "3 - Moderate",
    urgency: "2 - Medium",
    category: "Service Request",
    subCategory: "entervo.it.security",
    notes: "Patch rollout and maintenance window request for entervo parking server.",
  });

  const [loading, setLoading] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<{ ticketNumber: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await createPatchTicket({
        ...form,
        numberOfDevices: Number(form.numberOfDevices) || 1,
      });
      setCreatedTicket(res.ticket);
    } catch (err: any) {
      setError(err?.message || "Failed to submit patch request ticket. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 860, margin: "0 auto", paddingBottom: "var(--space-12)" }}>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <div>
          <div className="eyebrow accent">Operations · ServiceNow Integration</div>
          <h1 className="display" style={{ fontSize: 28, margin: "4px 0" }}>New Patch Request Ticket</h1>
          <p className="lead" style={{ fontSize: 14 }}>
            Submit an official customer service case for entervo system patch deployment.
          </p>
        </div>
        <Link to="/patch/dashboard" className="btn btn-secondary">
          <Icon name="arrowLeft" size={14} /> Back to Overview
        </Link>
      </div>

      {createdTicket ? (
        <div className="card" style={{ padding: 40, textAlign: "center", background: "#E8FAF1", border: "1px solid #1AB870" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#1AB870", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Icon name="check" size={32} color="white" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>Ticket Created Successfully</h2>
          <div style={{ fontSize: 16, color: "var(--gray-700)", marginBottom: 16 }}>
            Your case number is <strong style={{ color: "var(--navy)" }}>{createdTicket.ticketNumber}</strong>
          </div>
          <p style={{ maxWidth: 500, margin: "0 auto 24px", color: "var(--gray-600)", fontSize: 14, lineHeight: 1.6 }}>
            The patch request has been registered in the database and assigned to HQ-Patch-Management.
            Our technical support engineers will prepare the staging window accordingly.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link to="/patch/dashboard" className="btn btn-primary">
              Return to Patch Dashboard
            </Link>
            <button className="btn btn-secondary" onClick={() => setCreatedTicket(null)}>
              Create Another Ticket
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="stack" style={{ gap: "var(--space-6)" }}>
          {error && (
            <div className="callout callout-danger" role="alert">
              <Icon name="alert" size={16} />
              <div>{error}</div>
            </div>
          )}

          {/* Section 1: Car Park & Account Identification */}
          <div className="card" style={{ padding: 24, background: "white", borderRadius: 12, border: "1px solid var(--gray-200)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, borderBottom: "1px solid var(--gray-100)", paddingBottom: 12 }}>
              <Icon name="building" size={18} color="var(--sb-sky-500, #00A3E0)" />
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--navy)" }}>1. Car Park &amp; Account Details</div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label className="field-label">My Car Park Name <span style={{ color: "var(--red)" }}>*</span></label>
                <input
                  required
                  className="form-input"
                  placeholder="e.g. Neunkirchen, Saarpark-Center"
                  value={form.carparkName}
                  onChange={e => setForm({ ...form, carparkName: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="field-label">Customer Account</label>
                <input
                  className="form-input"
                  placeholder="Pollux Grundstücksgesellschaft"
                  value={form.customerAccount}
                  onChange={e => setForm({ ...form, customerAccount: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="field-label">CPQ Order Number</label>
                <input
                  className="form-input mono"
                  placeholder="e.g. CPQ-0498327"
                  value={form.cpqOrderNumber}
                  onChange={e => setForm({ ...form, cpqOrderNumber: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="field-label">Contract Number</label>
                <input
                  className="form-input mono"
                  placeholder="e.g. 4600017805"
                  value={form.contractNumber}
                  onChange={e => setForm({ ...form, contractNumber: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="card" style={{ padding: 24, background: "white", borderRadius: 12, border: "1px solid var(--gray-200)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, borderBottom: "1px solid var(--gray-100)", paddingBottom: 12 }}>
              <Icon name="users" size={18} color="var(--sb-sky-500, #00A3E0)" />
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--navy)" }}>2. Contact Information</div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label className="field-label">Contact Name</label>
                <input
                  className="form-input"
                  placeholder="Oliver Gollan"
                  value={form.contactName}
                  onChange={e => setForm({ ...form, contactName: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="field-label">Contact Email Address <span style={{ color: "var(--red)" }}>*</span></label>
                <input
                  required
                  type="email"
                  className="form-input"
                  placeholder="contact@company.com"
                  value={form.contactEmail}
                  onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="field-label">Phone Number</label>
                <input
                  className="form-input"
                  placeholder="+49 ..."
                  value={form.contactPhone}
                  onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="field-label">Number of Devices to be Patched</label>
                <input
                  type="number"
                  min={1}
                  className="form-input mono"
                  value={form.numberOfDevices}
                  onChange={e => setForm({ ...form, numberOfDevices: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Technical Specifications & IP Addresses */}
          <div className="card" style={{ padding: 24, background: "white", borderRadius: 12, border: "1px solid var(--gray-200)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, borderBottom: "1px solid var(--gray-100)", paddingBottom: 12 }}>
              <Icon name="server" size={18} color="var(--sb-sky-500, #00A3E0)" />
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--navy)" }}>3. Technical Details &amp; Network</div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label className="field-label">entervo Software Release <span style={{ color: "var(--red)" }}>*</span></label>
                <input
                  required
                  className="form-input mono"
                  placeholder="e.g. V2 R5 M8 or V3 R0 P0 M5"
                  value={form.entervoVersion}
                  onChange={e => setForm({ ...form, entervoVersion: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="field-label">Server Operating System (OS 1) <span style={{ color: "var(--red)" }}>*</span></label>
                <select
                  className="form-select"
                  value={form.operatingSystem}
                  onChange={e => setForm({ ...form, operatingSystem: e.target.value })}
                >
                  <option>Windows Server 2019</option>
                  <option>Windows Server 2022</option>
                  <option>Windows Server 2016</option>
                  <option>Windows 10 Enterprise LTSC</option>
                  <option>Windows 11 IoT Enterprise</option>
                </select>
              </div>

              <div className="field">
                <label className="field-label">Primary IP Address (IP 1) <span style={{ color: "var(--red)" }}>*</span></label>
                <input
                  required
                  className="form-input mono"
                  placeholder="e.g. 10.50.38.100"
                  value={form.ipAddress1}
                  onChange={e => setForm({ ...form, ipAddress1: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="field-label">Secondary IP Address (IP 2, Optional)</label>
                <input
                  className="form-input mono"
                  placeholder="e.g. 10.50.38.101"
                  value={form.ipAddress2}
                  onChange={e => setForm({ ...form, ipAddress2: e.target.value })}
                />
              </div>

              <div className="field" style={{ gridColumn: "span 2" }}>
                <label className="field-label">Remote Access Details</label>
                <input
                  className="form-input mono"
                  placeholder="e.g. VPN gateway, SSH port 2222, TeamViewer ID, or Bastion Host details"
                  value={form.remoteAccess}
                  onChange={e => setForm({ ...form, remoteAccess: e.target.value })}
                />
              </div>

              <div className="field" style={{ gridColumn: "span 2" }}>
                <label className="field-label">Maintenance Notes &amp; Additional Information</label>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="Specify preferred maintenance windows, local firewall considerations, etc."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link to="/patch/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 180 }}>
              {loading ? "Submitting Ticket…" : <>Submit Patch Request <Icon name="check" size={14} /></>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
