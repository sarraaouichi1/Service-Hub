import { FeatureCard, Flow, IconTile, PageHeader, SectionHeader, Tile, TileArt } from "../../../design-system";
import { AUTOMOX_FLOW, AUTOMOX_PILLARS, AUTOMOX_STAGES, AUTOMOX_TASKS } from "../data/content";
import { useReveal } from "../../../hooks/useReveal";

const STAGE_COLORS = [
  { color: "#00A3E0", name: "Agent Telemetry" },
  { color: "#003865", name: "Cloud Analysis" },
  { color: "#10B981", name: "Policy Matching" },
  { color: "#6366F1", name: "Silent Execution" },
  { color: "#0D9488", name: "Compliance Verified" },
];

export function PatchAutomoxView() {
  const pillarsRef = useReveal<HTMLDivElement>(".feature-card");
  const stagesRef = useReveal<HTMLDivElement>(".patch-automox-stage");
  const tasksRef = useReveal<HTMLDivElement>(".feature-card");

  return (
    <>
      <PageHeader
        eyebrow="Patch Management"
        title="Automox cloud-native platform"
        description="Automated, cloud-managed patch deployment — the engine behind the managed patch service."
      />

      {/* ── Cloud orchestration with picture and animations ───────────── */}
      <section className="page-section" style={{ marginBottom: "var(--space-10)" }}>
        <Tile
          media={
            <TileArt
              icon="cloud"
              label="Automox engine · cloud orchestration"
              imageSrc="/patch/automox-cloud.jpg"
            />
          }
        >
          <div className="row" style={{ alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#00E599",
                boxShadow: "0 0 10px #00E599",
                display: "inline-block",
                animation: "statLivePulse 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
            <div className="eyebrow" style={{ color: "#0088CC", fontWeight: "bold" }}>
              Cloud orchestration · Live Autonomous Sync
            </div>
          </div>
          <h2 className="display">A cloud-native patch platform</h2>
          <p className="lead">
            Automox deploys patches to every parking endpoint directly from the cloud, without on-premise
            update infrastructure, WSUS servers, or VPN tunnels to maintain.
          </p>
          <pre className="code-block patch-worklet fade-in" style={{ borderLeft: "4px solid #00A3E0" }}>
            <div className="code-head"><span>Worklet · monthly security roll-up</span><span>PowerShell</span></div>
            <span className="c-comment"># Freeze the entervo service, apply the policy, bring it back</span>{"\n"}
            Get-Service -Name "EntervoService" | Stop-Service -Force{"\n"}
            Invoke-AutomoxPatchPolicy -PolicyId "POL-LCU-MONTHLY"{"\n"}
            <span className="c-ok">Start-Service -Name "EntervoService"</span>
          </pre>
        </Tile>
      </section>

      {/* ── Why Automox with colors and animations ────────────────────── */}
      <section className="page-section" style={{ marginBottom: "var(--space-10)" }}>
        <SectionHeader
          title="Why Automox"
          description="Cloud advantages and policy-driven governance over legacy on-premise WSUS infrastructure."
        />
        <div ref={pillarsRef} className="grid-4 patch-pillars">
          {AUTOMOX_PILLARS.map((p, i) => {
            const styles = [
              { border: "#00A3E0", iconTone: "accent" as const, tag: "Zero Infrastructure" },
              { border: "#10B981", iconTone: "accent" as const, tag: "Cross-OS Fleet" },
              { border: "#8B5CF6", iconTone: "ink" as const,    tag: "Rapid Response" },
              { border: "#003865", iconTone: "ink" as const,    tag: "Autonomous Policy" },
            ][i % 4];

            return (
              <div
                key={p.title}
                className="card patch-pillar-card"
                style={{
                  borderTop: `4px solid ${styles.border}`,
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                  <IconTile name={p.icon} tone={styles.iconTone} size={22} />
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: styles.border,
                      background: "rgba(0, 163, 224, 0.08)",
                      padding: "2px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    {styles.tag}
                  </span>
                </div>
                <div className="card-title" style={{ fontSize: "var(--text-body)", marginBottom: "var(--space-2)" }}>
                  {p.title}
                </div>
                <p className="card-desc" style={{ fontSize: "var(--text-caption)" }}>{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How Automox works with animated numbers and colors ─────────── */}
      <section className="page-section" style={{ marginBottom: "var(--space-10)" }}>
        <SectionHeader
          title="How Automox works"
          description="Continuous closed-loop telemetry and policy execution across 5 automated phases."
        />
        <Flow nodes={AUTOMOX_FLOW} />
        <div ref={stagesRef} className="patch-automox-stages">
          {AUTOMOX_STAGES.map((s, i) => {
            const stageStyle = STAGE_COLORS[i] ?? { color: "#003865", name: "" };
            return (
              <div
                key={s.title}
                className="patch-automox-stage"
                style={{
                  ["--stage-color" as string]: stageStyle.color,
                }}
              >
                <div
                  className="step-index-pill"
                  style={{
                    background: stageStyle.color,
                  }}
                >
                  0{i + 1}
                </div>
                <div
                  className="step-title"
                  style={{
                    color: "var(--color-text)",
                    fontWeight: "var(--weight-bold)",
                    fontSize: "var(--text-body-sm)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  {s.title}
                </div>
                <div className="step-meta" style={{ color: "var(--color-text-muted)", fontSize: "var(--text-caption)" }}>
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="page-section" style={{ marginBottom: 0 }}>
        <SectionHeader title="Scripting & admin task automation" description="Automation beyond standard patching, for complete endpoint control." />
        <div ref={tasksRef} className="grid-3">
          {AUTOMOX_TASKS.map(t => <FeatureCard key={t.title} icon={t.icon} title={t.title} variant="muted">{t.desc}</FeatureCard>)}
        </div>
      </section>
    </>
  );
}
