import { Link } from "@tanstack/react-router";
import { Badge, Callout, Card, CheckList, Icon, PageHeader, StatBand, buttonClass } from "../../../design-system";
import { SCOPE_NOTE, SERVICE_TIERS } from "../data/content";
import { useReveal } from "../../../hooks/useReveal";

export function PatchServiceTiersView() {
  const tiersRef = useReveal<HTMLDivElement>(".patch-tier");

  return (
    <>
      <PageHeader
        eyebrow="Patch Management"
        title="Service tiers"
        description="Patch management packages for entervo parking infrastructure, from advisories only to a fully managed service."
      />

      {/* ── Animated tier metrics band ─────────────────────────────────── */}
      <section className="page-section" style={{ marginBottom: "var(--space-8)" }}>
        <StatBand
          animated
          items={[
            { value: "2", label: "Specialized service tier options" },
            { value: "24/7", label: "Automated telemetry & monitoring" },
            { value: "< 4h", label: "Critical vulnerability advisory SLA" },
            { value: "100%", label: "Lab verified rollback & safeguards" },
          ]}
        />
      </section>

      <div ref={tiersRef} className="grid-2 patch-tiers">
        {SERVICE_TIERS.map(t => (
          <Card
            key={t.id}
            variant={t.recommended ? "ink" : "default"}
            className={`patch-tier ${t.recommended ? "tier-recommended recommended" : "tier-basic"}`}
          >
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <div
                className="eyebrow"
                style={{
                  color: t.recommended ? "var(--sb-sky-300)" : "var(--sb-sky-700)",
                  fontWeight: "var(--weight-bold)",
                }}
              >
                {t.id === "basic" ? "Tier 1 · Advisory Foundation" : "Tier 2 · Managed Operations"}
              </div>
              {t.recommended ? (
                <Badge tone="info" dot={false}>Recommended · Turnkey</Badge>
              ) : (
                <Badge tone="outline" dot={false}>Customer Managed</Badge>
              )}
            </div>

            <h2 className="section-title" style={{ margin: "var(--space-3) 0 var(--space-2)" }}>{t.name}</h2>
            <p className="card-desc" style={{ marginBottom: "var(--space-6)" }}>{t.summary}</p>

            <CheckList items={t.features} />

            <div className="patch-tier-foot">
              <span className="text-muted">{t.note}</span>
              <Link
                to="/patch/dashboard"
                hash="contact"
                className={buttonClass(t.recommended ? "primary" : "secondary", "sm")}
              >
                Enquire <Icon name="arrowRight" />
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Callout tone="neutral" title="Scope:">{SCOPE_NOTE}</Callout>
    </>
  );
}
