import { useEffect, useState } from "react";
import { Icon } from "../../../../components/Icon";
import { UserSettingsTabs } from "./UserSettingsTabs";
import { useOnboarding } from "../../context/onboardingContext";
import { updateMyProfile, ApiError } from "../../../../api";

type Frequency = "instant" | "daily" | "weekly" | "disabled";

interface CategorySetting {
  id: string;
  name: string;
  desc: string;
  icon: string;
  frequency: Frequency;
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    teams: boolean;
    push: boolean;
  };
}

const DEFAULT_CATEGORIES: CategorySetting[] = [
  {
    id: "security",
    name: "Security Alerts",
    desc: "Unrecognized logins, password resets, 2FA modifications, and privilege escalations.",
    icon: "🔒",
    frequency: "instant",
    channels: { inApp: true, email: true, sms: true, teams: true, push: true },
  },
  {
    id: "system",
    name: "System Updates",
    desc: "Platform maintenance windows, patch bulletin releases, and version upgrades.",
    icon: "⚙️",
    frequency: "daily",
    channels: { inApp: true, email: true, sms: false, teams: true, push: false },
  },
  {
    id: "assignments",
    name: "New Assignments",
    desc: "When a new onboarding project or patch deployment is assigned to your account or team.",
    icon: "📋",
    frequency: "instant",
    channels: { inApp: true, email: true, sms: false, teams: true, push: true },
  },
  {
    id: "approvals",
    name: "Approval Requests",
    desc: "Step submissions, technical review sign-offs, and commercial payment confirmations.",
    icon: "✅",
    frequency: "instant",
    channels: { inApp: true, email: true, sms: false, teams: true, push: true },
  },
  {
    id: "comments",
    name: "Comments & Mentions",
    desc: "Direct @mentions, reviewer notes, and discussion threads on onboarding projects.",
    icon: "💬",
    frequency: "instant",
    channels: { inApp: true, email: true, sms: false, teams: false, push: true },
  },
  {
    id: "reports",
    name: "Reports & Summaries",
    desc: "Weekly onboarding statistics, team activity digests, and system health status reports.",
    icon: "📊",
    frequency: "weekly",
    channels: { inApp: true, email: true, sms: false, teams: false, push: false },
  },
];

export function NotificationPreferencesView() {
  const { currentUser } = useOnboarding();

  // Global channel toggles
  const [channels, setChannels] = useState({
    inApp: true,
    email: true,
    sms: false,
    teams: true,
    push: true,
  });

  // Notification categories state
  const [categories, setCategories] = useState<CategorySetting[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    if (currentUser?.notificationSettings) {
      const saved = currentUser.notificationSettings as {
        channels?: typeof channels;
        categories?: CategorySetting[];
      };
      if (saved.channels) setChannels(saved.channels);
      if (saved.categories && Array.isArray(saved.categories)) setCategories(saved.categories);
    }
  }, [currentUser]);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const updateCategoryFrequency = (id: string, frequency: Frequency) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, frequency } : c))
    );
  };

  const updateCategoryChannel = (
    catId: string,
    channelKey: keyof CategorySetting["channels"],
    val: boolean
  ) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, channels: { ...c.channels, [channelKey]: val } }
          : c
      )
    );
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError("");
    try {
      await updateMyProfile({
        notificationSettings: {
          channels,
          categories,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to persist preferences to database");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fade-in">
      <UserSettingsTabs />

      <form onSubmit={handleSavePreferences} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* SECTION 1: GLOBAL NOTIFICATION CHANNELS */}
        <div
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
              <Icon name="bell" size={18} color="var(--blue-bright)" /> Notification Channels
            </h3>
            <p style={{ fontSize: 13, color: "var(--gray-600)", marginTop: 2 }}>
              Enable or disable the delivery communication channels available for your account.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
            {[
              { key: "inApp", name: "In-App", desc: "Top-bar bell & badge", icon: "🔔" },
              { key: "email", name: "Email", desc: "Primary inbox alerts", icon: "✉️" },
              { key: "sms", name: "SMS", desc: "Urgent mobile texts", icon: "📱" },
              { key: "teams", name: "Microsoft Teams", desc: "Channel webhook bot", icon: "💬" },
              { key: "push", name: "Push Notifications", desc: "Browser & mobile push", icon: "⚡" },
            ].map((c) => {
              const isEnabled = channels[c.key as keyof typeof channels];
              return (
                <div
                  key={c.key}
                  onClick={() =>
                    setChannels({
                      ...channels,
                      [c.key]: !isEnabled,
                    })
                  }
                  style={{
                    padding: 16,
                    border: `2px solid ${isEnabled ? "var(--blue-bright)" : "var(--gray-200)"}`,
                    borderRadius: 10,
                    background: isEnabled ? "var(--blue-pale)" : "var(--gray-50)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{c.icon}</span>
                      <button
                        type="button"
                        className={`toggle${isEnabled ? " on" : ""}`}
                        style={{ transform: "scale(0.85)" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setChannels({ ...channels, [c.key]: !isEnabled });
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "var(--gray-600)", marginTop: 2, lineHeight: 1.3 }}>{c.desc}</div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, marginTop: 10, color: isEnabled ? "var(--blue-bright)" : "var(--gray-400)", textTransform: "uppercase" }}>
                    {isEnabled ? "● Active Channel" : "○ Muted"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: NOTIFICATION CATEGORIES & FREQUENCIES */}
        <div
          style={{
            background: "white",
            border: "1px solid var(--gray-200)",
            borderRadius: 12,
            padding: 24,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ borderBottom: "1px solid var(--gray-100)", paddingBottom: 16, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>
              Notification Categories &amp; Frequency Rules
            </h3>
            <p style={{ fontSize: 13, color: "var(--gray-600)", marginTop: 2 }}>
              Choose how frequently and through which channels you receive notifications for each category.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {categories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  background: "var(--gray-50)",
                  border: "1px solid var(--gray-200)",
                  borderRadius: 10,
                  padding: 20,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", maxWidth: 500 }}>
                    <span style={{ fontSize: 24, padding: "8px 10px", background: "white", borderRadius: 8, border: "1px solid var(--gray-200)" }}>
                      {cat.icon}
                    </span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>{cat.name}</div>
                      <div style={{ fontSize: 12.5, color: "var(--gray-600)", marginTop: 2, lineHeight: 1.4 }}>{cat.desc}</div>
                    </div>
                  </div>

                  {/* FREQUENCY SELECTOR */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
                      Delivery Frequency
                    </div>
                    <div style={{ display: "flex", gap: 6, background: "white", padding: 4, borderRadius: 8, border: "1px solid var(--gray-200)" }}>
                      {[
                        { id: "instant", label: "Instant" },
                        { id: "daily", label: "Daily Digest" },
                        { id: "weekly", label: "Weekly Digest" },
                        { id: "disabled", label: "Disabled" },
                      ].map((freq) => {
                        const isSelected = cat.frequency === freq.id;
                        return (
                          <button
                            key={freq.id}
                            type="button"
                            onClick={() => updateCategoryFrequency(cat.id, freq.id as Frequency)}
                            style={{
                              padding: "5px 12px",
                              borderRadius: 6,
                              border: "none",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.12s",
                              background: isSelected ? "var(--navy)" : "transparent",
                              color: isSelected ? "white" : "var(--gray-600)",
                            }}
                          >
                            {freq.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* CATEGORY CHANNEL CHECKBOXES */}
                {cat.frequency !== "disabled" && (
                  <div
                    style={{
                      borderTop: "1px solid var(--gray-200)",
                      paddingTop: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-800)" }}>
                      Active Channels for {cat.name}:
                    </span>
                    {[
                      { key: "inApp", label: "In-App", global: channels.inApp },
                      { key: "email", label: "Email", global: channels.email },
                      { key: "sms", label: "SMS", global: channels.sms },
                      { key: "teams", label: "MS Teams", global: channels.teams },
                      { key: "push", label: "Push", global: channels.push },
                    ].map((ch) => {
                      const channelKey = ch.key as keyof CategorySetting["channels"];
                      const isChecked = cat.channels[channelKey];
                      return (
                        <label
                          key={ch.key}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 12,
                            fontWeight: 500,
                            color: ch.global ? "var(--navy)" : "var(--gray-400)",
                            opacity: ch.global ? 1 : 0.6,
                            cursor: ch.global ? "pointer" : "not-allowed",
                          }}
                          title={!ch.global ? "Channel is globally muted above" : undefined}
                        >
                          <input
                            type="checkbox"
                            disabled={!ch.global}
                            checked={isChecked && ch.global}
                            onChange={(e) => updateCategoryChannel(cat.id, channelKey, e.target.checked)}
                          />
                          {ch.label}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 14 }}>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? "Saving to Database..." : "Save Notification Preferences"}
            </button>
            {savedSuccess && (
              <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="check" size={15} color="var(--green)" /> Notification preferences saved to database!
              </span>
            )}
            {saveError && (
              <span style={{ fontSize: 13, color: "var(--red, #ef4444)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="alert" size={15} color="var(--red, #ef4444)" /> {saveError}
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
