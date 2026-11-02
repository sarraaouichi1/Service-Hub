import { Badge, Callout, Card, IconTile, PageHeader, SectionHeader, StatBand } from "../../../design-system";
import { CLIENT_SYSTEMS, SCOPE_NOTE, SERVER_SYSTEMS, UPDATE_TYPES, type SupportedSystem } from "../data/content";
import { useReveal } from "../../../hooks/useReveal";

const PLATFORMS: { title: string; systems: SupportedSystem[]; borderTone: string }[] = [
  { title: "Windows Server", systems: SERVER_SYSTEMS, borderTone: "#003865" },
  { title: "Windows 10 workstations", systems: CLIENT_SYSTEMS, borderTone: "#00A3E0" },
];

export function PatchSystemsView() {
  const cardsRef = useReveal<HTMLDivElement>(".card");
  const platformsRef = useReveal<HTMLDivElement>(".card");

  return (
    <>
      <PageHeader
        eyebrow="Patch Management"
        title="Supported systems & update types"
        description="The Microsoft Windows Server and client versions, and the update packages, that the service covers."
      />

      {/* ── Animated numbers band ─────────────────────────────────────── */}
      <section className="page-section" style={{ marginBottom: "var(--space-8)" }}>
        <StatBand
          animated
          items={[
            { value: SERVER_SYSTEMS.length, label: "Windows Server editions supported" },
            { value: CLIENT_SYSTEMS.length, label: "Windows 10 workstation builds" },
            { value: UPDATE_TYPES.length, label: "Update categories (LCU & SSU)" },
            { value: "100%", label: "Lab-verified patch compatibility" },
          ]}
        />
      </section>

      {/* ── Update types ──────────────────────────────────────────────── */}
      <section className="page-section" style={{ marginBottom: "var(--space-10)" }}>
        <SectionHeader
          title="Update types"
          description="Cumulative and servicing stack packages managed through scheduled deployment rings."
        />
        <div ref={cardsRef} className="grid-2">
          {UPDATE_TYPES.map((u, i) => (
            <Card
              key={u.code}
              variant={i === 0 ? "accent" : "ink"}
              style={{
                borderTop: `4px solid ${i === 0 ? "#00A3E0" : "#003865"}`,
                boxShadow: "0 10px 28px -6px rgba(0, 40, 85, 0.1)",
              }}
            >
              <div className="row" style={{ marginBottom: "var(--space-4)" }}>
                <IconTile name={u.icon} tone={i === 0 ? "accent" : "ink"} size={22} />
                <div>
                  <div
                    className="eyebrow"
                    style={{ color: i === 0 ? "var(--sb-sky-700)" : "var(--sb-sky-400)" }}
                  >
                    Update package 0{i + 1}
                  </div>
                  <div className="card-title">{u.code} — {u.name}</div>
                </div>
              </div>
              <p className="card-desc" style={{ marginBottom: "var(--space-4)" }}>{u.desc}</p>
              <Callout tone={i === 0 ? "info" : "neutral"} title="Key feature:">
                {u.keyFeature}
              </Callout>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Supported versions ────────────────────────────────────────── */}
      <section className="page-section" style={{ marginBottom: "var(--space-8)" }}>
        <SectionHeader
          title="Supported versions"
          description={`${SERVER_SYSTEMS.length + CLIENT_SYSTEMS.length} Windows versions actively validated across parking servers and workstations.`}
        />
        <div ref={platformsRef} className="grid-2">
          {PLATFORMS.map(p => (
            <Card
              key={p.title}
              style={{
                borderTop: `3px solid ${p.borderTone}`,
                boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div className="card-header" style={{ paddingBottom: "var(--space-3)" }}>
                <div className="card-title" style={{ fontSize: "var(--text-title-sm)" }}>{p.title}</div>
                <span
                  className="count-badge"
                  style={{
                    background: p.borderTone,
                    color: "#FFFFFF",
                    fontWeight: "bold",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                  }}
                >
                  {p.systems.length} editions
                </span>
              </div>
              <div className="kv-list">
                {p.systems.map(s => (
                  <div key={s.name} className="kv-row" style={{ transition: "background 0.2s ease" }}>
                    <div>
                      <div className="kv-title" style={{ fontWeight: "var(--weight-semibold)" }}>{s.name}</div>
                      <div className="kv-sub">{s.desc}</div>
                    </div>
                    <Badge tone="success" dot={true}>Supported</Badge>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Callout title="Scope:">{SCOPE_NOTE}</Callout>
    </>
  );
}
