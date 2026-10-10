import { FeatureCard, Flow, PageHeader, SectionHeader, Tile, TileArt } from "../../../design-system";
import { AUTOMOX_FLOW, AUTOMOX_PILLARS, AUTOMOX_STAGES, AUTOMOX_TASKS } from "../data/content";

export function PatchAutomoxView() {
  return (
    <>
      <PageHeader
        eyebrow="Patch Management"
        title="Automox cloud-native platform"
        description="Automated, cloud-managed patch deployment — the engine behind the managed patch service."
      />

      <section className="page-section" style={{ marginBottom: "var(--space-10)" }}>
        <Tile media={<TileArt icon="cloud" label="Automox engine · no on-prem servers" />}>
          <div className="eyebrow">Cloud orchestration</div>
          <h2 className="display">A cloud-native patch platform</h2>
          <p className="lead">
            Automox deploys patches to every parking endpoint from the cloud, without on-premise
            update infrastructure to buy, host or maintain.
          </p>
          <pre className="code-block patch-worklet">
            <div className="code-head"><span>Worklet · monthly security roll-up</span><span>PowerShell</span></div>
            <span className="c-comment"># Freeze the entervo service, apply the policy, bring it back</span>{"\n"}
            Get-Service -Name "EntervoService" | Stop-Service -Force{"\n"}
            Invoke-AutomoxPatchPolicy -PolicyId "POL-LCU-MONTHLY"{"\n"}
            <span className="c-ok">Start-Service -Name "EntervoService"</span>
          </pre>
        </Tile>
      </section>

      <section className="page-section" style={{ marginBottom: "var(--space-10)" }}>
        <SectionHeader title="Why Automox" />
        <div className="grid-4">
          {AUTOMOX_PILLARS.map(p => <FeatureCard key={p.title} icon={p.icon} title={p.title}>{p.desc}</FeatureCard>)}
        </div>
      </section>

      <section className="page-section" style={{ marginBottom: "var(--space-10)" }}>
        <SectionHeader title="How Automox works" description="Data flows from each endpoint's agent to the cloud console and back as policy." />
        <Flow nodes={AUTOMOX_FLOW} />
        <div className="patch-automox-stages">
          {AUTOMOX_STAGES.map((s, i) => (
            <div key={s.title} className="patch-automox-stage">
              <div className="step-index">{i + 1}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-meta">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-section" style={{ marginBottom: 0 }}>
        <SectionHeader title="Scripting & admin task automation" description="Automation beyond standard patching, for complete endpoint control." />
        <div className="grid-3">
          {AUTOMOX_TASKS.map(t => <FeatureCard key={t.title} icon={t.icon} title={t.title} variant="muted">{t.desc}</FeatureCard>)}
        </div>
      </section>
    </>
  );
}
