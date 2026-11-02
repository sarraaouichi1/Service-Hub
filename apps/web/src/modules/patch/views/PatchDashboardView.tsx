import { Link } from "@tanstack/react-router";
import {
  Badge, Card, CheckList, FeatureCard, Icon, SectionHeader, StatBand, Tile, TileArt, buttonClass,
} from "../../../design-system";
import type { IconName } from "../../../types";
import {
  AUTOMOX_PILLARS, CLIENT_SYSTEMS, PROCESS_STEPS, SERVER_SYSTEMS, SERVICE_TIERS, UPDATE_TYPES, VALUE_DRIVERS,
} from "../data/content";
import { ContactSection } from "../components/ContactSection";
import { useReveal } from "../../../hooks/useReveal";

const EXPLORE: {
  to: "/patch/process" | "/patch/systems" | "/patch/automox";
  icon: IconName;
  kicker: string;
  title: string;
  desc: string;
  cta: string;
  image: string;
}[] = [
  {
    to: "/patch/process",
    icon: "refresh",
    kicker: `${PROCESS_STEPS.length}-step process`,
    title: "From Patch Tuesday to the monthly report",
    desc: PROCESS_STEPS.map(s => s.name).join(" · "),
    cta: "Explore the process",
    image: "/patch/tile-process.jpg",
  },
  {
    to: "/patch/systems",
    icon: "server",
    kicker: "Scope",
    title: "Supported systems & update types",
    desc: `${SERVER_SYSTEMS.length} Windows Server and ${CLIENT_SYSTEMS.length} Windows 10 versions, covered for ${UPDATE_TYPES.map(u => u.code).join(" and ")} updates.`,
    cta: "See what's covered",
    image: "/patch/tile-scope.jpg",
  },
  {
    to: "/patch/automox",
    icon: "cloud",
    kicker: "Platform",
    title: "Powered by Automox",
    desc: AUTOMOX_PILLARS.map(p => p.title).join(" · ") + " — patch orchestration without on-premise infrastructure.",
    cta: "How Automox works",
    image: "/patch/tile-platform.jpg",
  },
];

export function PatchDashboardView() {
  const whyRef = useReveal<HTMLDivElement>(".feature-card");
  const tilesRef = useReveal<HTMLDivElement>(".tile");
  const tiersRef = useReveal<HTMLDivElement>(".card");

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
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
          <div className="row" style={{ marginTop: "var(--space-8)", gap: 12 }}>
            <Link to="/patch/tickets/new" className={buttonClass("primary", "lg")}>
              <Icon name="plus" /> New Patch Ticket
            </Link>
            <Link to="/patch/bulletins" className={buttonClass("secondary", "lg")}>
              Review bulletins <Icon name="arrowRight" />
            </Link>
            <Link to="/patch/dashboard" hash="contact" className={buttonClass("secondary", "lg")}>
              Talk to an expert
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why patch management matters — atmospheric dark section ─── */}
      <section className="patch-why-section page-section">
        <SectionHeader
          title="Why patch management matters"
          description="Proactive cyber hygiene that protects critical assets and keeps exposure low."
        />
        <div ref={whyRef} className="grid-3">
          {VALUE_DRIVERS.map(v => <FeatureCard key={v.title} icon={v.icon} title={v.title}>{v.desc}</FeatureCard>)}
        </div>
      </section>

      {/* ── Numbers band ──────────────────────────────────────────────── */}
      <section className="page-section">
        <StatBand
          animated
          items={[
            { value: PROCESS_STEPS.length, label: "Process stages, Patch Tuesday to report" },
            { value: SERVER_SYSTEMS.length + CLIENT_SYSTEMS.length, label: "Supported Windows versions" },
            { value: UPDATE_TYPES.length, label: `Update types (${UPDATE_TYPES.map(u => u.code).join(" & ")})` },
            { value: "24/7", label: "Monitoring in the managed tier" },
          ]}
        />
      </section>

      {/* ── Explore tiles ─────────────────────────────────────────────── */}
      <section ref={tilesRef} className="page-section stack" style={{ gap: "var(--space-6)" }}>
        {EXPLORE.map((e, i) => (
          <Tile key={e.to} reverse={i % 2 === 1} media={<TileArt icon={e.icon} label={e.kicker} imageSrc={e.image} />}>
            <div className="eyebrow">{e.kicker}</div>
            <h2 className="display">{e.title}</h2>
            <p className="lead">{e.desc}</p>
            <Link to={e.to} className={buttonClass("primary")}>{e.cta} <Icon name="arrowRight" /></Link>
          </Tile>
        ))}
      </section>

      {/* ── Service tiers ─────────────────────────────────────────────── */}
      <section className="page-section">
        <SectionHeader
          title="Service tiers"
          description="Two packages, matched to how much of patching the customer's IT team wants to run itself."
          actions={<Link to="/patch/tiers" className="link-arrow">Compare tiers <Icon name="arrowRight" size={14} /></Link>}
        />
        <div ref={tiersRef} className="grid-2">
          {SERVICE_TIERS.map(t => (
            <Card
              key={t.id}
              variant={t.recommended ? "ink" : "default"}
              className={`patch-tier ${t.recommended ? "tier-recommended recommended" : "tier-basic"}`}
            >
              <div className="row" style={{ justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
                <div className="card-title">{t.name}</div>
                {t.recommended ? (
                  <Badge tone="info" dot={false}>Recommended · Turnkey</Badge>
                ) : (
                  <Badge tone="outline" dot={false}>Basic</Badge>
                )}
              </div>
              <p className="card-desc" style={{ marginBottom: "var(--space-5)" }}>{t.summary}</p>
              <CheckList items={t.features.slice(0, 4)} />
            </Card>
          ))}
        </div>
      </section>

      <ContactSection />
    </>
  );
}
