import { Link, useMatches } from "@tanstack/react-router";
import { Icon } from "../../../../components/Icon";
import { useOnboarding } from "../../context/onboardingContext";

export function UserSettingsTabs() {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname ?? "";
  const { currentUser } = useOnboarding();

  const tabs = [
    {
      to: "/onboarding/settings/account",
      label: "Account Settings",
      icon: "users" as const,
    },
    {
      to: "/onboarding/settings/privacy",
      label: "Privacy & Security",
      icon: "shield" as const,
    },
    {
      to: "/onboarding/settings/notifications",
      label: "Notification Preferences",
      icon: "bell" as const,
    },
  ];

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Header bar with User summary */}
      <div
        style={{
          background: "white",
          border: "1px solid var(--gray-200)",
          borderRadius: "12px",
          padding: "20px 24px",
          marginBottom: "20px",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: (currentUser.color ?? "var(--blue)") + "25",
              color: currentUser.color ?? "var(--blue-bright)",
              border: `2px solid ${(currentUser.color ?? "var(--blue-bright)")}66`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {currentUser.initials}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)", margin: 0 }}>
                {currentUser.name}
              </h2>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: "var(--blue-pale)",
                  color: "var(--blue-bright)",
                  border: "1px solid var(--blue-mid)",
                }}
              >
                {currentUser.roles.join(" · ")}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "var(--gray-600)", marginTop: 2 }}>
              {currentUser.email} • {currentUser.partner || "Scheidt & Bachmann HQ"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "var(--gray-400)", fontFamily: "var(--mono)" }}>
            ID: {currentUser.id.slice(0, 8)}...
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          borderBottom: "2px solid var(--gray-200)",
          paddingBottom: 2,
        }}
      >
        {tabs.map((tab) => {
          const isActive = currentPath.includes(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: "8px 8px 0 0",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.15s",
                background: isActive ? "white" : "transparent",
                color: isActive ? "var(--blue-bright)" : "var(--gray-600)",
                border: isActive ? "1px solid var(--gray-200)" : "1px solid transparent",
                borderBottom: isActive ? "2px solid white" : "none",
                marginBottom: isActive ? "-2px" : "0",
              }}
            >
              <Icon name={tab.icon} size={15} color={isActive ? "var(--blue-bright)" : "var(--gray-600)"} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
