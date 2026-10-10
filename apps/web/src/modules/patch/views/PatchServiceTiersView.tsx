import { Link } from "@tanstack/react-router";
import { Badge, Callout, Card, CheckList, Icon, PageHeader, buttonClass } from "../../../design-system";
import { SCOPE_NOTE, SERVICE_TIERS } from "../data/content";

export function PatchServiceTiersView() {
  return (
    <>
      <PageHeader
        eyebrow="Patch Management"
        title="Service tiers"
        description="Patch management packages for entervo parking infrastructure, from advisories only to a fully managed service."
      />

      <div className="grid-2 patch-tiers">
        {SERVICE_TIERS.map(t => (
          <Card key={t.id} variant={t.recommended ? "ink" : "default"} className={`patch-tier${t.recommended ? " recommended" : ""}`}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="eyebrow">{t.id === "basic" ? "Tier 1" : "Tier 2"}</div>
              {t.recommended && <Badge tone="ink" dot={false}>Recommended</Badge>}
            </div>
            <h2 className="section-title" style={{ margin: "var(--space-2) 0" }}>{t.name}</h2>
            <p className="card-desc" style={{ marginBottom: "var(--space-6)" }}>{t.summary}</p>
            <CheckList items={t.features} />
            <div className="patch-tier-foot">
              <span className="text-muted">{t.note}</span>
              <Link to="/patch/dashboard" hash="contact" className={buttonClass(t.recommended ? "primary" : "secondary", "sm")}>
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
