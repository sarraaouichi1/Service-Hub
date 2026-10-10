import { useState } from "react";
import { Badge, Card, CheckList, IconTile, PageHeader, Steps } from "../../../design-system";
import { PROCESS_STEPS } from "../data/content";

export function PatchProcessView() {
  const [activeStep, setActiveStep] = useState(PROCESS_STEPS[0].step);
  const selected = PROCESS_STEPS.find(s => s.step === activeStep) ?? PROCESS_STEPS[0];

  return (
    <>
      <PageHeader
        eyebrow="Patch Management"
        title={`The ${PROCESS_STEPS.length}-step patching process`}
        description="An end-to-end operating framework that keeps installations secure and compliant without disrupting operations."
      />

      <Steps
        label="Patching stages"
        items={PROCESS_STEPS.map(s => ({ key: s.step, title: s.name, meta: s.schedule }))}
        active={activeStep}
        onSelect={setActiveStep}
      />

      <Card className="patch-stage fade-in" key={selected.step}>
        <div className="patch-stage-head">
          <IconTile name={selected.icon} tone="ink" size={22} />
          <div style={{ flex: 1 }}>
            <div className="eyebrow accent">Stage {selected.step} of {PROCESS_STEPS.length}</div>
            <h2 className="section-title" style={{ marginTop: "var(--space-1)" }}>{selected.name}</h2>
            <p className="text-muted" style={{ marginTop: "var(--space-1)" }}>{selected.tagline}</p>
          </div>
          <Badge tone="outline" dot={false}>{selected.schedule}</Badge>
        </div>
        <p className="lead" style={{ margin: "var(--space-5) 0" }}>{selected.desc}</p>
        <div className="card card-muted">
          <div className="eyebrow" style={{ marginBottom: "var(--space-4)" }}>Deliverables &amp; safeguards</div>
          <CheckList items={selected.details} />
        </div>
      </Card>
    </>
  );
}
