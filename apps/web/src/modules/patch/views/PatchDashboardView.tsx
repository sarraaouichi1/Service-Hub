import { Link } from "@tanstack/react-router";
import type { PatchStatus } from "@service-hub/shared";
import { AsyncSection } from "../../../components/AsyncSection";
import { PATCH_STATUS } from "../../../data/display";
import { useBulletins } from "../../../queries";
import {
  Badge, Card, CheckList, FeatureCard, Icon, IconTile, SectionHeader, StatBand, Tile, TileArt, buttonClass,
} from "../../../design-system";
import type { IconName } from "../../../types";
import {
  AUTOMOX_PILLARS, CLIENT_SYSTEMS, PROCESS_STEPS, ROADMAP, SERVER_SYSTEMS, SERVICE_TIERS, UPDATE_TYPES, VALUE_DRIVERS,
} from "../data/content";
import { ContactSection } from "../components/ContactSection";

const STATUS_ORDER: PatchStatus[] = ["pending", "testing", "scheduled", "deployed"];

const EXPLORE: { to: "/patch/process" | "/patch/systems" | "/patch/automox"; icon: IconName; kicker: string; title: string; desc: string; cta: string }[] = [
  {
    to: "/patch/process",
    icon: "refresh",
    kicker: `${PROCESS_STEPS.length}-step process`,
    title: "From Patch Tuesday to the monthly report",
    desc: PROCESS_STEPS.map(s => s.name).join(" · "),
    cta: "Explore the process",
  },
  {
    to: "/patch/systems",
    icon: "server",
    kicker: "Scope",
    title: "Supported systems & update types",
    desc: `${SERVER_SYSTEMS.length} Windows Server and ${CLIENT_SYSTEMS.length} Windows 10 versions, covered for ${UPDATE_TYPES.map(u => u.code).join(" and ")} updates.`,
    cta: "See what's covered",
  },
  {
    to: "/patch/automox",
    icon: "cloud",
    kicker: "Platform",
    title: "Powered by Automox",
    desc: AUTOMOX_PILLARS.map(p => p.title).join(" · ") + " — patch orchestration without on-premise infrastructure.",
    cta: "How Automox works",
  },
];

export function PatchDashboardView() {
  const bulletins = useBulletins();

  return (
    <>
      <section className="patch-hero page-section">
        <div>
          <div className="eyebrow accent">Patch Management · entervo smart</div>
          <h1 className="display display-xl patch-hero-title">
            Keep every installation <span className="accent">patched &amp; secure</span>
          </h1>
          <p className="lead">
            Proactive patch management for entervo systems — Microsoft updates assessed, tested in our lab
            and rolled out in maintenance windows, with monitoring and a monthly compliance report.
          </p>
          <div className="row" style={{ marginTop: "var(--space-8)" }}>
            <Link to="/patch/bulletins" className={buttonClass("primary", "lg")}>
              Review bulletins <Icon name="arrowRight" />
            </Link>
            <Link to="/patch/dashboard" hash="contact" className={buttonClass("secondary", "lg")}>
              Talk to an expert
            </Link>
          </div>
        </div>

        <Card className="patch-hero-status">
          <div className="card-header">
            <div>
              <div className="eyebrow">This month</div>
              <div className="card-title">Bulletin status</div>
            </div>
            <IconTile name="activity" tone="ink" />
          </div>
          <AsyncSection query={bulletins} label="bulletins">
            {(list) => (
              <>
                <div className="kv-list">
                  {STATUS_ORDER.map(status => (
                    <div key={status} className="kv-row">
                      <Badge tone={PATCH_STATUS[status].tone}>{PATCH_STATUS[status].label}</Badge>
                      <span className="patch-hero-count">{list.filter(b => b.status === status).length}</span>
                    </div>
                  ))}
                </div>
                <CriticalOutstanding count={list.filter(b => b.severity === "Critical" && b.status !== "deployed").length} />
                <Link to="/patch/bulletins" className="link-arrow">All {list.length} bulletins <Icon name="arrowRight" size={14} /></Link>
              </>
            )}
          </AsyncSection>
        </Card>
      </section>

      <section className="page-section">
        <SectionHeader title="Why patch management matters" description="Proactive cyber hygiene that protects critical assets and keeps exposure low." />
        <div className="grid-3">
          {VALUE_DRIVERS.map(v => <FeatureCard key={v.title} icon={v.icon} title={v.title}>{v.desc}</FeatureCard>)}
        </div>
      </section>

      <section className="page-section">
        <StatBand
          items={[
            { value: PROCESS_STEPS.length, label: "Process stages, Patch Tuesday to report" },
            { value: SERVER_SYSTEMS.length + CLIENT_SYSTEMS.length, label: "Supported Windows versions" },
            { value: UPDATE_TYPES.length, label: `Update types (${UPDATE_TYPES.map(u => u.code).join(" & ")})` },
            { value: "24/7", label: "Monitoring in the managed tier" },
          ]}
        />
      </section>

      <section className="page-section stack" style={{ gap: "var(--space-6)" }}>
        {EXPLORE.map((e, i) => (
          <Tile key={e.to} reverse={i % 2 === 1} media={<TileArt icon={e.icon} label={e.kicker} />}>
            <div className="eyebrow">{e.kicker}</div>
            <h2 className="display">{e.title}</h2>
            <p className="lead">{e.desc}</p>
            <Link to={e.to} className={buttonClass("primary")}>{e.cta} <Icon name="arrowRight" /></Link>
          </Tile>
        ))}
      </section>

      <section className="page-section">
        <SectionHeader
          title="Service tiers"
          description="Two packages, matched to how much of patching the customer's IT team wants to run itself."
          actions={<Link to="/patch/tiers" className="link-arrow">Compare tiers <Icon name="arrowRight" size={14} /></Link>}
        />
        <div className="grid-2">
          {SERVICE_TIERS.map(t => (
            <Card key={t.id} variant={t.recommended ? "ink" : "default"}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
                <div className="card-title">{t.name}</div>
                {t.recommended && <Badge tone="ink" dot={false}>Recommended</Badge>}
              </div>
              <p className="card-desc" style={{ marginBottom: "var(--space-5)" }}>{t.summary}</p>
              <CheckList items={t.features.slice(0, 4)} />
            </Card>
          ))}
        </div>
      </section>

      <section className="page-section">
        <SectionHeader title="Roadmap" description="Capabilities in engineering now." />
        <div className="grid-2">
          {ROADMAP.map(r => (
            <Card key={r.title} variant="muted">
              <div className="row" style={{ justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                <IconTile name={r.icon} />
                <Badge tone="info">{r.status}</Badge>
              </div>
              <div className="card-title">{r.title}</div>
              <div className="card-desc">{r.desc}</div>
            </Card>
          ))}
        </div>
      </section>

      <ContactSection />
    </>
  );
}

function CriticalOutstanding({ count }: { count: number }) {
  if (count === 0) {
    return <div className="patch-hero-critical clear"><Icon name="check" size={14} /> Every critical bulletin is deployed</div>;
  }
  return (
    <div className="patch-hero-critical">
      <Icon name="alert" size={14} />
      {count} critical {count === 1 ? "bulletin" : "bulletins"} not yet deployed
    </div>
  );
}
