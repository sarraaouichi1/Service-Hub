import { useState } from "react";
import { Badge, Card, CheckList, Icon, IconTile, PageHeader, StatBand, Steps, buttonClass } from "../../../design-system";
import { PROCESS_STEPS } from "../data/content";

const STAGE_TONES: Record<number, { tone: "accent" | "ink"; color: string; badge: string }> = {
  1: { tone: "accent", color: "#003865", badge: "Stage 01 · Planning" },
  2: { tone: "accent", color: "#00A3E0", badge: "Stage 02 · Verification" },
  3: { tone: "ink",    color: "#059669", badge: "Stage 03 · Orchestration" },
  4: { tone: "accent", color: "#D97706", badge: "Stage 04 · Deployment" },
  5: { tone: "ink",    color: "#4F46E5", badge: "Stage 05 · Validation" },
  6: { tone: "accent", color: "#0891B2", badge: "Stage 06 · Compliance" },
};

export function PatchProcessView() {
  const [activeStep, setActiveStep] = useState(PROCESS_STEPS[0].step);
  const selected = PROCESS_STEPS.find(s => s.step === activeStep) ?? PROCESS_STEPS[0];
  const stageInfo = STAGE_TONES[selected.step] ?? STAGE_TONES[1];

  return (
    <>
      <PageHeader
        eyebrow="Patch Management"
        title={`The ${PROCESS_STEPS.length}-step patching process`}
        description="An end-to-end operating framework that keeps installations secure and compliant without disrupting operations."
      />

      {/* ── Animated KPI band ─────────────────────────────────────────── */}
      <section className="page-section" style={{ marginBottom: "var(--space-8)" }}>
        <StatBand
          animated
          items={[
            { value: PROCESS_STEPS.length, label: "Core stages, Patch Tuesday to report" },
            { value: "100%", label: "Lab tested prior to production" },
            { value: "0", label: "Operational disruption window" },
            { value: 30, label: "Days continuous compliance cycle" },
          ]}
        />
      </section>

      <section className="page-section">
        <Steps
          label="Patching stages"
          items={PROCESS_STEPS.map(s => ({ key: s.step, title: s.name, meta: s.schedule }))}
          active={activeStep}
          onSelect={setActiveStep}
        />

        <Card
          className="patch-stage fade-in"
          key={selected.step}
          style={{
            borderTop: `4px solid ${stageInfo.color}`,
            boxShadow: "0 12px 32px -6px rgba(0, 40, 85, 0.08)",
          }}
        >
          <div className="patch-stage-head">
            <IconTile name={selected.icon} tone={stageInfo.tone} size={24} />
            <div style={{ flex: 1 }}>
              <div className="row" style={{ gap: "var(--space-2)", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: "var(--text-overline)",
                    fontWeight: "var(--weight-bold)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: stageInfo.color,
                  }}
                >
                  {stageInfo.badge}
                </span>
                <span className="text-muted">·</span>
                <span className="text-muted" style={{ fontSize: "var(--text-caption)" }}>
                  Step {selected.step} of {PROCESS_STEPS.length}
                </span>
              </div>
              <h2 className="section-title" style={{ marginTop: "var(--space-1)" }}>{selected.name}</h2>
              <p className="text-muted" style={{ marginTop: "var(--space-1)" }}>{selected.tagline}</p>
            </div>
            <Badge tone="outline" dot={false}>{selected.schedule}</Badge>
          </div>

          <p className="lead" style={{ margin: "var(--space-5) 0" }}>{selected.desc}</p>

          <div
            className="card card-muted"
            style={{
              background: "var(--sb-sky-50)",
              border: "1px solid var(--sb-sky-200)",
            }}
          >
            <div
              className="eyebrow"
              style={{
                marginBottom: "var(--space-4)",
                color: "var(--sb-sky-800)",
                fontWeight: "var(--weight-bold)",
              }}
            >
              Deliverables &amp; safeguards
            </div>
            <CheckList items={selected.details} />
          </div>

          {/* ── Interactive Stage Pager ───────────────────────────────── */}
          <div
            className="row"
            style={{
              justifyContent: "space-between",
              marginTop: "var(--space-6)",
              paddingTop: "var(--space-4)",
              borderTop: "1px solid var(--color-border-subtle)",
            }}
          >
            {activeStep > 1 ? (
              <button
                type="button"
                className={buttonClass("secondary", "sm")}
                onClick={() => setActiveStep(activeStep - 1)}
              >
                <Icon name="arrowLeft" /> Previous: Stage 0{activeStep - 1}
              </button>
            ) : <div />}

            {activeStep < PROCESS_STEPS.length ? (
              <button
                type="button"
                className={buttonClass("primary", "sm")}
                onClick={() => setActiveStep(activeStep + 1)}
              >
                Next: Stage 0{activeStep + 1} <Icon name="arrowRight" />
              </button>
            ) : <div />}
          </div>
        </Card>
      </section>
    </>
  );
}
