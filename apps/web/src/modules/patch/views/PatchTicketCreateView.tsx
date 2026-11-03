import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "../../../components/Icon";
import { useAuth } from "../../auth/useAuth";
import { createPatchTicket } from "../../../api/resources";

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const DIGITS_ONLY_REGEX = /^\d+$/;

export function PatchTicketCreateView() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    carparkName: "",
    customerAccount: user?.company || user?.partner || "",
    contactName: user?.name || "",
    contactEmail: user?.email || "",
    contactPhone: user?.phone || "",
    cpqOrderNumber: "",
    contractNumber: "",
    numberOfDevices: 1,
    entervoVersion: "",
    operatingSystem: "Windows Server 2019",
    ipAddress1: "",
    ipAddress2: "",
    ipAddress3: "",
    remoteAccess: "",
    priority: "3 - Moderate",
    urgency: "2 - Medium",
    category: "Service Request",
    subCategory: "entervo.it.security",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<{ ticketNumber: string } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Section 1
    if (!form.carparkName.trim()) {
      newErrors.carparkName = "Car park name is required";
    }
    if (!form.cpqOrderNumber.trim()) {
      newErrors.cpqOrderNumber = "CPQ Order Number is mandatory";
    }
    if (!form.contractNumber.trim()) {
      newErrors.contractNumber = "Contract Number is mandatory";
    } else if (!DIGITS_ONLY_REGEX.test(form.contractNumber.trim())) {
      newErrors.contractNumber = "Contract Number must contain only digits (numbers)";
    }

    // Section 2
    if (!form.contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) {
      newErrors.contactEmail = "Please enter a valid email address (e.g. name@company.com)";
    }
    if (form.numberOfDevices < 1 || isNaN(form.numberOfDevices)) {
      newErrors.numberOfDevices = "Number of devices must be at least 1";
    }

    // Section 3
    if (!form.entervoVersion.trim()) {
      newErrors.entervoVersion = "entervo Software Release is mandatory";
    }
    if (!form.operatingSystem.trim()) {
      newErrors.operatingSystem = "Server Operating System is required";
    }
    if (!form.ipAddress1.trim()) {
      newErrors.ipAddress1 = "Primary IP Address (IP 1) is mandatory";
    } else if (!IPV4_REGEX.test(form.ipAddress1.trim())) {
      newErrors.ipAddress1 = "Primary IP Address must be a valid IPv4 address (e.g. 10.50.38.100)";
    }

    if (form.ipAddress2.trim() && !IPV4_REGEX.test(form.ipAddress2.trim())) {
      newErrors.ipAddress2 = "Secondary IP Address must be a valid IPv4 address (e.g. 10.50.38.101)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const res = await createPatchTicket({
        ...form,
        numberOfDevices: Number(form.numberOfDevices) || 1,
      });
      setCreatedTicket(res.ticket);
    } catch (err: any) {
      if (err?.fieldErrors) {
        setErrors(err.fieldErrors);
      }
      setServerError(err?.message || "Failed to submit patch request ticket. Please verify your inputs.");
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
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#1AB870", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white", marginBottom: 16 }}>
            <Icon name="check" size={32} />
          </div>
          <h2 style={{ fontSize: 22, color: "var(--navy)", marginBottom: 8 }}>Patch Request Submitted Successfully</h2>
          <div style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 16 }}>
            Your patch deployment request has been logged in the Scheidt &amp; Bachmann Service System.
          </div>
          <div style={{ display: "inline-block", background: "white", padding: "10px 24px", borderRadius: 8, border: "1px solid var(--gray-200)", fontSize: 18, fontWeight: 700, color: "var(--navy)", marginBottom: 24 }}>
            Ticket Number: {createdTicket.ticketNumber}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link to="/patch/dashboard" className="btn btn-primary">
              Return to Patch Dashboard
            </Link>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setCreatedTicket(null);
                setForm(prev => ({
                  ...prev,
                  carparkName: "",
                  cpqOrderNumber: "",
                  contractNumber: "",
                  entervoVersion: "",
                  ipAddress1: "",
                  ipAddress2: "",
                  remoteAccess: "",
                  notes: "",
                }));
                setErrors({});
              }}
            >
              Submit Another Ticket
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="stack" style={{ gap: "var(--space-6)" }}>
          {serverError && (
            <div className="callout callout-danger" style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Icon name="alert" size={18} />
              <div>{serverError}</div>
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
                  className={`form-input${errors.carparkName ? " input-error" : ""}`}
                  placeholder="e.g. Neunkirchen, Saarpark-Center"
                  value={form.carparkName}
                  onChange={e => {
                    setForm({ ...form, carparkName: e.target.value });
                    if (errors.carparkName) setErrors({ ...errors, carparkName: "" });
                  }}
                />
                {errors.carparkName && <div className="field-error" style={{ color: "var(--red)", fontSize: 12, marginTop: 4 }}>⚠ {errors.carparkName}</div>}
              </div>

              <div className="field">
                <label className="field-label">Customer Account</label>
                <input
                  className="form-input"
                  placeholder="e.g. Pollux Grundstücksgesellschaft"
                  value={form.customerAccount}
                  onChange={e => setForm({ ...form, customerAccount: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="field-label">CPQ Order Number <span style={{ color: "var(--red)" }}>*</span></label>
                <input
                  required
                  className={`form-input mono${errors.cpqOrderNumber ? " input-error" : ""}`}
                  placeholder="e.g. CPQ-0498327"
                  value={form.cpqOrderNumber}
                  onChange={e => {
                    setForm({ ...form, cpqOrderNumber: e.target.value });
                    if (errors.cpqOrderNumber) setErrors({ ...errors, cpqOrderNumber: "" });
                  }}
                />
                {errors.cpqOrderNumber && <div className="field-error" style={{ color: "var(--red)", fontSize: 12, marginTop: 4 }}>⚠ {errors.cpqOrderNumber}</div>}
              </div>

              <div className="field">
                <label className="field-label">Contract Number <span style={{ color: "var(--red)" }}>*</span></label>
                <input
                  required
                  className={`form-input mono${errors.contractNumber ? " input-error" : ""}`}
                  placeholder="e.g. 4600017805 (digits only)"
                  value={form.contractNumber}
                  onChange={e => {
                    setForm({ ...form, contractNumber: e.target.value });
                    if (errors.contractNumber) setErrors({ ...errors, contractNumber: "" });
                  }}
                />
                {errors.contractNumber && <div className="field-error" style={{ color: "var(--red)", fontSize: 12, marginTop: 4 }}>⚠ {errors.contractNumber}</div>}
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
                  placeholder="e.g. Oliver Gollan"
                  value={form.contactName}
                  onChange={e => setForm({ ...form, contactName: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="field-label">Contact Email Address <span style={{ color: "var(--red)" }}>*</span></label>
                <input
                  required
                  type="email"
                  className={`form-input${errors.contactEmail ? " input-error" : ""}`}
                  placeholder="contact@company.com"
                  value={form.contactEmail}
                  onChange={e => {
                    setForm({ ...form, contactEmail: e.target.value });
                    if (errors.contactEmail) setErrors({ ...errors, contactEmail: "" });
                  }}
                />
                {errors.contactEmail && <div className="field-error" style={{ color: "var(--red)", fontSize: 12, marginTop: 4 }}>⚠ {errors.contactEmail}</div>}
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
                <label className="field-label">Number of Devices to be Patched <span style={{ color: "var(--red)" }}>*</span></label>
                <input
                  type="number"
                  min={1}
                  className={`form-input mono${errors.numberOfDevices ? " input-error" : ""}`}
                  value={form.numberOfDevices}
                  onChange={e => {
                    setForm({ ...form, numberOfDevices: parseInt(e.target.value, 10) || 0 });
                    if (errors.numberOfDevices) setErrors({ ...errors, numberOfDevices: "" });
                  }}
                />
                {errors.numberOfDevices && <div className="field-error" style={{ color: "var(--red)", fontSize: 12, marginTop: 4 }}>⚠ {errors.numberOfDevices}</div>}
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
                  className={`form-input mono${errors.entervoVersion ? " input-error" : ""}`}
                  placeholder="e.g. V2 R5 M8 or V3 R0 P0 M5"
                  value={form.entervoVersion}
                  onChange={e => {
                    setForm({ ...form, entervoVersion: e.target.value });
                    if (errors.entervoVersion) setErrors({ ...errors, entervoVersion: "" });
                  }}
                />
                {errors.entervoVersion && <div className="field-error" style={{ color: "var(--red)", fontSize: 12, marginTop: 4 }}>⚠ {errors.entervoVersion}</div>}
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
                {errors.operatingSystem && <div className="field-error" style={{ color: "var(--red)", fontSize: 12, marginTop: 4 }}>⚠ {errors.operatingSystem}</div>}
              </div>

              <div className="field">
                <label className="field-label">Primary IP Address (IP 1) <span style={{ color: "var(--red)" }}>*</span></label>
                <input
                  required
                  className={`form-input mono${errors.ipAddress1 ? " input-error" : ""}`}
                  placeholder="e.g. 10.50.38.100"
                  value={form.ipAddress1}
                  onChange={e => {
                    setForm({ ...form, ipAddress1: e.target.value });
                    if (errors.ipAddress1) setErrors({ ...errors, ipAddress1: "" });
                  }}
                />
                {errors.ipAddress1 && <div className="field-error" style={{ color: "var(--red)", fontSize: 12, marginTop: 4 }}>⚠ {errors.ipAddress1}</div>}
              </div>

              <div className="field">
                <label className="field-label">Secondary IP Address (IP 2, Optional)</label>
                <input
                  className={`form-input mono${errors.ipAddress2 ? " input-error" : ""}`}
                  placeholder="e.g. 10.50.38.101"
                  value={form.ipAddress2}
                  onChange={e => {
                    setForm({ ...form, ipAddress2: e.target.value });
                    if (errors.ipAddress2) setErrors({ ...errors, ipAddress2: "" });
                  }}
                />
                {errors.ipAddress2 && <div className="field-error" style={{ color: "var(--red)", fontSize: 12, marginTop: 4 }}>⚠ {errors.ipAddress2}</div>}
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
