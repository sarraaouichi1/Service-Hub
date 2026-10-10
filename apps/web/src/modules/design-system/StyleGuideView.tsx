import { useState, type CSSProperties, type ReactNode } from "react";
import {
  AccountMenu, AppFooter, AppHeader, Badge, Button, Callout, Card, CheckList, FeatureCard, Flow, Icon, IconTile,
  PageHeader, SectionHeader, StatBand, StatCard, Steps, Tile, TileArt,
} from "../../design-system";
import { Field } from "../../components/Field";
import { STATUS_COLOR, STATUS_MAP } from "../../data/display";
import type { ProjectStatus } from "../../types";
import { paletteFamily, useTokens, type Token } from "./useTokens";
import "../../styles/styleguide.css";

const SECTIONS = ["Palettes", "Semantic colours", "Typography", "Spacing & shape", "Buttons", "Badges", "Cards", "Tiles & band", "Forms", "Data", "Feedback", "Process"];
const anchor = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, "-");

export function StyleGuideView() {
  const tokens = useTokens();
  const byPrefix = (prefix: string) => tokens.filter(t => t.name.startsWith(prefix));

  const palettes = new Map<string, Token[]>();
  for (const t of byPrefix("--sb-")) {
    const family = paletteFamily(t.name);
    palettes.set(family, [...(palettes.get(family) ?? []), t]);
  }

  return (
    <div className="page-shell">
      <AppHeader contained actions={<AccountMenu />} />
      <main className="page-body styleguide">
        <PageHeader
          eyebrow="entervo Service Hub"
          title="Design system"
          description="The tokens, palettes and components both modules are built from. The visual language follows scheidt-bachmann.de: a white canvas, black wordmark and pill buttons, light uppercase headlines, slate bands carrying the sky accent, and flat grey panels."
        />
        <nav className="styleguide-index" aria-label="Sections">
          {SECTIONS.map(s => <a key={s} href={`#${anchor(s)}`}>{s}</a>)}
        </nav>

        <Section title="Palettes" description="Raw ramps. Views never use these directly — they go through the semantic tokens below.">
          {[...palettes].map(([family, list]) => (
            <div key={family} className="palette">
              <div className="palette-name">{family}</div>
              <div className="palette-swatches">
                {list.map(t => <Swatch key={t.name} token={t} />)}
              </div>
            </div>
          ))}
        </Section>

        <Section title="Semantic colours" description="What a colour is for. Change a palette and every use of the role follows.">
          <div className="swatch-grid">
            {byPrefix("--color-").map(t => <Swatch key={t.name} token={t} wide />)}
          </div>
          <SectionHeader title="Project status" description="One colour per lifecycle status, shared by badges, progress bars and stat cards." />
          <div className="row" style={{ flexWrap: "wrap" }}>
            {(Object.keys(STATUS_MAP) as ProjectStatus[]).map(s => (
              <div key={s} className="status-sample">
                <span className={`badge ${STATUS_MAP[s].cls}`}>{STATUS_MAP[s].label}</span>
                <div className="progress-bar" style={{ width: 120 }}><div className="progress-fill" style={{ width: "64%", background: STATUS_COLOR[s] }} /></div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typography" description="Open Sans throughout; DM Mono for identifiers and code. Headlines are light and uppercase with open tracking.">
          <div className="type-specimens">
            <div><div className="eyebrow">Display XL · 52 / light / uppercase</div><div className="display display-xl">Mobility made simple</div></div>
            <div><div className="eyebrow">Display · 38</div><div className="display">Energy retail <span className="accent">solutions</span></div></div>
            <div><div className="eyebrow">Page title · 28</div><div className="page-title">Review queue</div></div>
            <div><div className="eyebrow">Section title · 20</div><div className="section-title">Supported versions</div></div>
            <div><div className="eyebrow">Card title · 16 / semibold</div><div className="card-title">Managed Patch Service</div></div>
            <div><div className="eyebrow">Lead · 16</div><p className="lead">The Service Hub is where staff and partners bring customers onto entervo smart.</p></div>
            <div><div className="eyebrow">Body · 14</div><p>Body copy sits in near-black on white for comfortable reading at desk distance.</p></div>
            <div><div className="eyebrow">Eyebrow · 11 / uppercase / tracked</div><div className="eyebrow accent">Module 01 · Provisioning</div></div>
            <div><div className="eyebrow">Mono · DM Mono</div><div className="mono">KB5034441 · POL-LCU-MONTHLY</div></div>
          </div>
        </Section>

        <Section title="Spacing & shape" description="A 4px spacing scale, four radii plus the pill, and soft elevation.">
          <div className="token-rows">
            {byPrefix("--space-").map(t => (
              <div key={t.name} className="token-row">
                <code>{t.name}</code><span className="space-bar" style={{ width: `var(${t.name})` }} /><span className="text-muted">{t.value}</span>
              </div>
            ))}
          </div>
          <div className="row" style={{ flexWrap: "wrap", gap: "var(--space-6)", marginTop: "var(--space-8)" }}>
            {byPrefix("--radius-").map(t => (
              <div key={t.name} className="shape-sample" style={{ borderRadius: `var(${t.name})` }}><code>{t.name}</code></div>
            ))}
            {byPrefix("--shadow-").map(t => (
              <div key={t.name} className="shape-sample" style={{ boxShadow: `var(${t.name})`, border: "none" }}><code>{t.name}</code></div>
            ))}
          </div>
        </Section>

        <Section title="Buttons" description="Black pills lead, as on the S&B site. One primary action per view.">
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="danger">Danger</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="row" style={{ flexWrap: "wrap", marginTop: "var(--space-4)" }}>
            <Button size="sm" icon="plus">Small</Button>
            <Button size="lg" iconEnd="arrowRight">Large with icon</Button>
            <button type="button" className="link-arrow">Arrow link <Icon name="arrowRight" size={14} /></button>
          </div>
          <div className="band on-inverse" style={{ marginTop: "var(--space-6)", padding: "var(--space-6)" }}>
            <Button variant="inverse">Inverse — on slate</Button>
          </div>
        </Section>

        <Section title="Badges" description="Short status labels. Tones carry meaning, never decoration.">
          <div className="row" style={{ flexWrap: "wrap" }}>
            {(["neutral", "info", "success", "warning", "danger", "ink", "outline"] as const).map(t => <Badge key={t} tone={t}>{t}</Badge>)}
            <span className="count-badge">12</span>
          </div>
        </Section>

        <Section title="Cards" description="White on the grey canvas; muted panels for secondary content; a top rule to mark emphasis.">
          <div className="grid-3">
            <FeatureCard icon="shield" title="Feature card">Icon, title and one line of copy.</FeatureCard>
            <FeatureCard icon="layers" title="Muted panel" variant="muted">The flat grey S&amp;B panel.</FeatureCard>
            <FeatureCard icon="zap" title="Ink rule" variant="ink">For the recommended or primary option.</FeatureCard>
          </div>
          <div className="row" style={{ marginTop: "var(--space-4)" }}>
            <IconTile name="cloud" /><IconTile name="cloud" tone="ink" /><div className="avatar">KH</div>
          </div>
        </Section>

        <Section title="Tiles & band" description="The split tile and the slate counter band are the two signature layouts of scheidt-bachmann.de.">
          <Tile media={<TileArt icon="layers" label="Tile art · slate & sky" />}>
            <div className="eyebrow">Split tile</div>
            <h3 className="display">Energy retail solutions</h3>
            <p className="lead">A slate half and a grey half, alternating sides down the page.</p>
            <Button iconEnd="arrowRight">Learn more</Button>
          </Tile>
          <div style={{ marginTop: "var(--space-6)" }}>
            <StatBand items={[{ value: "67+", label: "Countries" }, { value: "1579+", label: "Customers" }, { value: "13+", label: "Sites" }]} />
          </div>
        </Section>

        <Section title="Forms" description="Caption, control, then one message slot that holds the hint or — replacing it — the error.">
          <FormSample />
        </Section>

        <Section title="Data" description="Stat cards take a status colour on their top rule; tables keep a grey header row.">
          <div className="stat-grid">
            <StatCard label="Total projects" value={24} note="+3 this month" noteTone="up" tone="var(--status-review)" />
            <StatCard label="Awaiting review" value={5} note="2 over SLA" noteTone="pending" tone="var(--status-progress)" />
            <StatCard label="Onboarded" value={11} tone="var(--status-onboarded)" />
          </div>
          <div className="data-table" style={{ "--table-columns": "2fr 1fr 1fr" } as CSSProperties}>
            <div className="data-table-head"><div>Project</div><div>Status</div><div>Progress</div></div>
            {(["review", "approved", "draft"] as ProjectStatus[]).map((s, i) => (
              <div key={s} className="data-table-row">
                <div><div className="cell-title">Frankfurt Airport P{i + 1}</div><div className="cell-sub">PRJ-00{i + 1}</div></div>
                <div><span className={`badge ${STATUS_MAP[s].cls}`}>{STATUS_MAP[s].label}</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${80 - i * 25}%`, background: STATUS_COLOR[s] }} /></div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Feedback" description="Callouts explain; they always say what happened and what to do next.">
          <div className="stack">
            <Callout title="Heads up:">Info callouts carry context the user should know.</Callout>
            <Callout tone="success">The project was approved and moved to DevOps.</Callout>
            <Callout tone="warning">This country template has no VAT rule yet.</Callout>
            <Callout tone="danger">Couldn't save the draft. Check your connection and try again.</Callout>
          </div>
          <div className="async-state" style={{ marginTop: "var(--space-4)" }}>Loading projects…</div>
        </Section>

        <Section title="Process" description="Steps for a selectable sequence, a flow for an architecture, a check list for deliverables.">
          <StepsSample />
          <div style={{ margin: "var(--space-6) 0" }}>
            <Flow nodes={[{ icon: "monitor", label: "Endpoint" }, { icon: "cloud", label: "Cloud console", highlight: true }, { icon: "fileText", label: "Report" }]} />
          </div>
          <CheckList items={["Signed binaries verified", "Lab regression passed", "Roll-back plan tested"]} />
        </Section>
      </main>
      <AppFooter />
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section id={anchor(title)} className="page-section styleguide-section">
      <SectionHeader title={title} description={description} />
      <Card>{children}</Card>
    </section>
  );
}

function Swatch({ token, wide }: { token: Token; wide?: boolean }) {
  return (
    <div className={`swatch${wide ? " wide" : ""}`}>
      <div className="swatch-chip" style={{ background: `var(${token.name})` }} />
      <code>{token.name.replace(/^--(sb|color)-/, "")}</code>
      <span>{token.value}</span>
    </div>
  );
}

function FormSample() {
  const [on, setOn] = useState(true);
  return (
    <div className="form-grid">
      <Field label="Company name" required hint="As registered — appears on invoices.">
        <input className="form-input" defaultValue="Scheidt & Bachmann GmbH" />
      </Field>
      <Field label="VAT number" required error="Enter a VAT number in the form DE123456789.">
        <input className="form-input error" defaultValue="DE12" />
      </Field>
      <Field label="Country">
        <select className="form-select" defaultValue="de"><option value="de">Germany</option><option value="fr">France</option></select>
      </Field>
      <div className="toggle-row">
        <div><div className="toggle-info">Email notifications</div><div className="toggle-sub">On every status change</div></div>
        <button type="button" className={`toggle${on ? " on" : ""}`} aria-pressed={on} aria-label="Email notifications" onClick={() => setOn(!on)} />
      </div>
    </div>
  );
}

function StepsSample() {
  const [active, setActive] = useState(2);
  const items = ["Assess", "Acquire", "Test", "Deploy"].map((t, i) => ({ key: i + 1, title: t, meta: `Stage ${i + 1}` }));
  return <Steps label="Sample steps" items={items} active={active} onSelect={setActive} />;
}
