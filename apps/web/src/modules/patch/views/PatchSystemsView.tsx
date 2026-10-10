import { Badge, Callout, Card, IconTile, PageHeader, SectionHeader } from "../../../design-system";
import { CLIENT_SYSTEMS, SCOPE_NOTE, SERVER_SYSTEMS, UPDATE_TYPES, type SupportedSystem } from "../data/content";

const PLATFORMS: { title: string; systems: SupportedSystem[] }[] = [
  { title: "Windows Server", systems: SERVER_SYSTEMS },
  { title: "Windows 10 workstations", systems: CLIENT_SYSTEMS },
];

export function PatchSystemsView() {
  return (
    <>
      <PageHeader
        eyebrow="Patch Management"
        title="Supported systems & update types"
        description="The Microsoft Windows Server and client versions, and the update packages, that the service covers."
      />

      <section className="page-section" style={{ marginBottom: "var(--space-10)" }}>
        <SectionHeader title="Update types" />
        <div className="grid-2">
          {UPDATE_TYPES.map((u, i) => (
            <Card key={u.code} variant={i === 0 ? "accent" : "ink"}>
              <div className="row" style={{ marginBottom: "var(--space-4)" }}>
                <IconTile name={u.icon} tone={i === 0 ? "accent" : "ink"} />
                <div>
                  <div className="eyebrow">Update type 0{i + 1}</div>
                  <div className="card-title">{u.code} — {u.name}</div>
                </div>
              </div>
              <p className="card-desc" style={{ marginBottom: "var(--space-4)" }}>{u.desc}</p>
              <Callout tone="neutral" title="Key feature:">{u.keyFeature}</Callout>
            </Card>
          ))}
        </div>
      </section>

      <section className="page-section" style={{ marginBottom: "var(--space-8)" }}>
        <SectionHeader title="Supported versions" description={`${SERVER_SYSTEMS.length + CLIENT_SYSTEMS.length} Windows versions across servers and workstations.`} />
        <div className="grid-2">
          {PLATFORMS.map(p => (
            <Card key={p.title}>
              <div className="card-header">
                <div className="card-title">{p.title}</div>
                <span className="count-badge">{p.systems.length}</span>
              </div>
              <div className="kv-list">
                {p.systems.map(s => (
                  <div key={s.name} className="kv-row">
                    <div>
                      <div className="kv-title">{s.name}</div>
                      <div className="kv-sub">{s.desc}</div>
                    </div>
                    <Badge tone="success">Supported</Badge>
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
