import { useEffect, useState } from "react";
import { Icon } from "../../../../components/Icon";
import { Field } from "../../../../components/Field";
import { useOnboarding } from "../../context/onboardingContext";
import { UserSettingsTabs } from "./UserSettingsTabs";
import { ApiError, changePassword, updateMyProfile } from "../../../../api";

export function AccountSettingsView() {
  const { currentUser } = useOnboarding();

  // Name splitting helper
  const nameParts = currentUser.name.split(" ");
  const defaultFirstName = nameParts[0] ?? "";
  const defaultLastName = nameParts.slice(1).join(" ") ?? "";

  // Avatar State (stored as 256x256 base64 PNG)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Form states
  const [profile, setProfile] = useState({
    firstName: defaultFirstName,
    lastName: defaultLastName,
    username: currentUser.username || currentUser.email.split("@")[0] || "user",
    email: currentUser.email,
    phone: currentUser.phone || "+49 2166 454-0",
    jobTitle: currentUser.jobTitle || (currentUser.roles.includes("Admin")
      ? "Senior IT Security & Platform Admin"
      : currentUser.roles.includes("Project Manager")
      ? "Lead Onboarding Manager"
      : currentUser.roles.includes("Sales")
      ? "Regional Commercial Account Lead"
      : "Systems Specialist"),
    company: currentUser.company || currentUser.partner || "Scheidt & Bachmann GmbH",
    department: currentUser.department || "entervo IT Security & Platform Solutions",
    language: currentUser.language || "en-GB",
    timezone: currentUser.timezone || "Europe/Berlin",
  });

  useEffect(() => {
    const parts = currentUser.name.split(" ");
    setProfile({
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" ") ?? "",
      username: currentUser.username || currentUser.email.split("@")[0] || "user",
      email: currentUser.email,
      phone: currentUser.phone || "+49 2166 454-0",
      jobTitle: currentUser.jobTitle || (currentUser.roles.includes("Admin")
        ? "Senior IT Security & Platform Admin"
        : currentUser.roles.includes("Project Manager")
        ? "Lead Onboarding Manager"
        : currentUser.roles.includes("Sales")
        ? "Regional Commercial Account Lead"
        : "Systems Specialist"),
      company: currentUser.company || currentUser.partner || "Scheidt & Bachmann GmbH",
      department: currentUser.department || "entervo IT Security & Platform Solutions",
      language: currentUser.language || "en-GB",
      timezone: currentUser.timezone || "Europe/Berlin",
    });
  }, [currentUser]);

  // Handle Photo Upload with 256x256 canvas resize
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, 256, 256);
          const resizedDataUrl = canvas.toDataURL("image/png");
          setAvatarUrl(resizedDataUrl);
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateSuccess, setDeactivateSuccess] = useState(false);

  // Connected accounts mock state
  const [connected, setConnected] = useState({
    azure: true,
    github: true,
    google: false,
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setIsSaving(true);
    try {
      await updateMyProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        username: profile.username,
        phone: profile.phone,
        jobTitle: profile.jobTitle,
        company: profile.company,
        department: profile.department,
        language: profile.language,
        timezone: profile.timezone,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        window.location.reload();
      }, 1500);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (!passwordForm.currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match");
      return;
    }
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSuccess(false), 3500);
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Failed to change password");
    }
  };

  const handleDownloadData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({
        user: currentUser,
        profile,
        exportTimestamp: new Date().toISOString(),
        securityStatus: "Active",
      }, null, 2)
    );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `account-data-${currentUser.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Password strength logic
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: "", score: 0, color: "var(--gray-200)" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { label: "Weak", score: 25, color: "var(--red)" };
    if (score === 2 || score === 3) return { label: "Moderate", score: 65, color: "var(--amber)" };
    return { label: "Strong", score: 100, color: "var(--green)" };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <div className="fade-in">
      <UserSettingsTabs />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "flex-start" }}>
        {/* Main Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* PROFILE & PERSONAL INFORMATION */}
          <form
            onSubmit={handleSaveProfile}
            style={{
              background: "white",
              border: "1px solid var(--gray-200)",
              borderRadius: 12,
              padding: 24,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ borderBottom: "1px solid var(--gray-100)", paddingBottom: 16, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>Personal Information</h3>
              <p style={{ fontSize: 13, color: "var(--gray-600)", marginTop: 2 }}>
                Update your account details and public profile information.
              </p>
            </div>

            {/* Profile Picture Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: 16,
                background: "var(--gray-50)",
                border: "1px solid var(--gray-200)",
                borderRadius: 10,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: (currentUser.color ?? "var(--blue)") + "25",
                  color: currentUser.color ?? "var(--blue-bright)",
                  border: `3px solid ${(currentUser.color ?? "var(--blue-bright)")}55`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  currentUser.initials
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>Profile Picture</div>
                <div style={{ fontSize: 12, color: "var(--gray-600)", marginTop: 2 }}>
                  PNG, JPG or SVG. Automatically resized to 256x256px and saved to profile.
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
                  <label className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Icon name="plus" size={12} /> Upload Photo
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
                  </label>
                  {avatarUrl && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ fontSize: 12, padding: "5px 12px", color: "var(--red)" }}
                      onClick={() => setAvatarUrl(null)}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="form-grid">
              <Field label="First Name" required>
                <input
                  className="form-input"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  placeholder="First name"
                />
              </Field>

              <Field label="Last Name" required>
                <input
                  className="form-input"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  placeholder="Last name"
                />
              </Field>

              <Field label="Username" required hint="Used for system mentions and internal logs">
                <input
                  className="form-input mono"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  placeholder="Username"
                />
              </Field>

              <Field label="Email Address" required hint="Account email address (read-only)">
                <input
                  className="form-input"
                  type="email"
                  value={profile.email}
                  disabled
                  readOnly
                  style={{ background: "var(--gray-100)", cursor: "not-allowed", opacity: 0.8 }}
                  placeholder="name@company.com"
                />
              </Field>

              <Field label="Phone Number" hint="Including country code">
                <input
                  className="form-input"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+49 123 456789"
                />
              </Field>

              <Field label="Job Title">
                <input
                  className="form-input"
                  value={profile.jobTitle}
                  onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                  placeholder="e.g. Systems Engineer"
                />
              </Field>

              <Field label="Company / Organisation">
                <input
                  className="form-input"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  placeholder="Company name"
                />
              </Field>

              <Field label="Department">
                <input
                  className="form-input"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  placeholder="e.g. IT Operations"
                />
              </Field>
            </div>

            {/* PREFERENCES (Language, Timezone, Theme) */}
            <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: 20, marginTop: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 14 }}>
                Localization & Display Preferences
              </h4>
              <div className="form-grid">
                <Field label="Language Selector">
                  <select
                    className="form-select"
                    value={profile.language}
                    onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                  >
                    <option value="en-GB">English (United Kingdom)</option>
                    <option value="en-US">English (United States)</option>
                    <option value="de-DE">Deutsch (Deutschland)</option>
                    <option value="fr-FR">Français (France)</option>
                    <option value="nl-NL">Nederlands (Nederland)</option>
                    <option value="es-ES">Español (España)</option>
                  </select>
                </Field>

                <Field label="Time Zone">
                  <select
                    className="form-select"
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  >
                    <option value="Europe/Berlin">UTC+01:00 Europe/Berlin (CET)</option>
                    <option value="Europe/London">UTC+00:00 Europe/London (GMT)</option>
                    <option value="America/New_York">UTC-05:00 America/New_York (EST)</option>
                    <option value="Asia/Singapore">UTC+08:00 Asia/Singapore (SGT)</option>
                  </select>
                </Field>
              </div>
            </div>

            {saveError && (
              <div style={{ padding: "10px 14px", background: "var(--color-danger-soft)", border: "1px solid var(--color-danger)", borderRadius: 8, color: "var(--red)", fontSize: 13, fontWeight: 500, marginTop: 16 }}>
                ⚠️ {saveError}
              </div>
            )}

            <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 14 }}>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Profile Changes"}
              </button>
              {savedSuccess && (
                <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="check" size={15} color="var(--green)" /> Profile settings updated successfully!
                </span>
              )}
            </div>
          </form>

          {/* CHANGE PASSWORD CARD */}
          <form
            onSubmit={handleChangePassword}
            style={{
              background: "white",
              border: "1px solid var(--gray-200)",
              borderRadius: 12,
              padding: 24,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ borderBottom: "1px solid var(--gray-100)", paddingBottom: 16, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="lock" size={18} color="var(--blue-bright)" /> Change Password
              </h3>
              <p style={{ fontSize: 13, color: "var(--gray-600)", marginTop: 2 }}>
                Ensure your account is using a long, random password to stay secure.
              </p>
            </div>

            {passwordError && (
              <div style={{ padding: "10px 14px", background: "var(--color-danger-soft)", border: "1px solid var(--color-danger)", borderRadius: 8, color: "var(--red)", fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
                ⚠️ {passwordError}
              </div>
            )}

            <div className="form-grid">
              <Field label="Current Password" required span2>
                <input
                  type="password"
                  className="form-input mono"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••••••"
                />
              </Field>

              <Field label="New Password" required hint="Min 8 characters, numbers & symbols">
                <input
                  type="password"
                  className="form-input mono"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="••••••••••••"
                />
                {passwordForm.newPassword && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--gray-600)", fontWeight: 600, marginBottom: 3 }}>
                      <span>Password Strength</span>
                      <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                    </div>
                    <div style={{ height: 4, background: "var(--gray-200)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${passwordStrength.score}%`, background: passwordStrength.color, transition: "all 0.3s" }} />
                    </div>
                  </div>
                )}
              </Field>

              <Field label="Confirm New Password" required>
                <input
                  type="password"
                  className="form-input mono"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="••••••••••••"
                />
              </Field>
            </div>

            <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 14 }}>
              <button type="submit" className="btn btn-secondary" style={{ background: "var(--navy)", color: "white" }}>
                Update Password
              </button>
              {passwordSuccess && (
                <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="check" size={15} color="var(--green)" /> Password updated successfully!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Sidebar Column: Connected Accounts, Data & Danger Zone */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* CONNECTED ACCOUNTS CARD */}
          <div
            style={{
              background: "white",
              border: "1px solid var(--gray-200)",
              borderRadius: 12,
              padding: 20,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
              Connected Accounts
            </h4>
            <p style={{ fontSize: 12, color: "var(--gray-600)", marginBottom: 16 }}>
              Single Sign-On & third-party identity integrations.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Azure AD */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 12,
                  background: "var(--gray-50)",
                  border: "1px solid var(--gray-200)",
                  borderRadius: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, background: "#0078D4", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 12 }}>
                    M
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>Microsoft Entra ID</div>
                    <div style={{ fontSize: 11, color: "var(--gray-400)" }}>Corporate SSO</div>
                  </div>
                </div>
                <button
                  type="button"
                  className={`btn ${connected.azure ? "btn-ghost" : "btn-secondary"}`}
                  style={{ fontSize: 11, padding: "4px 10px", color: connected.azure ? "var(--green)" : "var(--blue-bright)" }}
                  onClick={() => setConnected({ ...connected, azure: !connected.azure })}
                >
                  {connected.azure ? "✓ Connected" : "Connect"}
                </button>
              </div>

              {/* GitHub */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 12,
                  background: "var(--gray-50)",
                  border: "1px solid var(--gray-200)",
                  borderRadius: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, background: "#24292E", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 12 }}>
                    GH
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>GitHub Enterprise</div>
                    <div style={{ fontSize: 11, color: "var(--gray-400)" }}>DevOps Sync</div>
                  </div>
                </div>
                <button
                  type="button"
                  className={`btn ${connected.github ? "btn-ghost" : "btn-secondary"}`}
                  style={{ fontSize: 11, padding: "4px 10px", color: connected.github ? "var(--green)" : "var(--blue-bright)" }}
                  onClick={() => setConnected({ ...connected, github: !connected.github })}
                >
                  {connected.github ? "✓ Connected" : "Connect"}
                </button>
              </div>

              {/* Google */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 12,
                  background: "var(--gray-50)",
                  border: "1px solid var(--gray-200)",
                  borderRadius: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, background: "#EA4335", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 12 }}>
                    G
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>Google Workspace</div>
                    <div style={{ fontSize: 11, color: "var(--gray-400)" }}>Not linked</div>
                  </div>
                </div>
                <button
                  type="button"
                  className={`btn ${connected.google ? "btn-ghost" : "btn-secondary"}`}
                  style={{ fontSize: 11, padding: "4px 10px", color: connected.google ? "var(--green)" : "var(--blue-bright)" }}
                  onClick={() => setConnected({ ...connected, google: !connected.google })}
                >
                  {connected.google ? "✓ Connected" : "+ Connect"}
                </button>
              </div>
            </div>
          </div>

          {/* DOWNLOAD DATA CARD */}
          <div
            style={{
              background: "white",
              border: "1px solid var(--gray-200)",
              borderRadius: 12,
              padding: 20,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="download" size={16} color="var(--blue-bright)" /> Download My Data
            </h4>
            <p style={{ fontSize: 12, color: "var(--gray-600)", marginBottom: 14, lineHeight: 1.4 }}>
              Export a full JSON copy of your personal profile, activity history, and security logs.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={handleDownloadData}
            >
              Request Data Archive (.JSON)
            </button>
          </div>

          {/* DEACTIVATE ACCOUNT DANGER ZONE */}
          <div
            style={{
              background: "var(--color-danger-soft)",
              border: "1px solid var(--color-danger)",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-danger-text)", marginBottom: 4 }}>
              Deactivate Account
            </h4>
            <p style={{ fontSize: 12, color: "var(--color-danger-text)", marginBottom: 14, lineHeight: 1.4 }}>
              Temporarily disable your profile and revoke all platform permissions for your role ({currentUser.roles.join(", ")}).
            </p>

            {deactivateSuccess ? (
              <div style={{ fontSize: 12, color: "var(--red)", fontWeight: 700, textAlign: "center" }}>
                🔒 Account Deactivation Requested. Session will end shortly.
              </div>
            ) : (
              <button
                type="button"
                className="btn"
                style={{ width: "100%", justifyContent: "center", background: "var(--color-danger)", color: "white" }}
                onClick={() => setShowDeactivateModal(true)}
              >
                Deactivate My Account
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DEACTIVATE CONFIRMATION MODAL */}
      {showDeactivateModal && (
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
              maxWidth: 440,
              width: "90%",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--gray-200)",
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--color-danger-soft)", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Icon name="trash" size={24} color="var(--red)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>
              Deactivate Account Confirmation
            </h3>
            <p style={{ fontSize: 13, color: "var(--gray-600)", lineHeight: 1.5, marginBottom: 20 }}>
              Are you sure you want to deactivate account <strong>{currentUser.email}</strong>? You will be logged out immediately and system administrators will need to re-verify your identity to restore access.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeactivateModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{ background: "var(--red)", color: "white" }}
                onClick={() => {
                  setDeactivateSuccess(true);
                  setShowDeactivateModal(false);
                }}
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
