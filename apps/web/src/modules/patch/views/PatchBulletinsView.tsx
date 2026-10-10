import type { PatchSeverity } from "@service-hub/shared";
import { AsyncSection } from "../../../components/AsyncSection";
import { useBulletins } from "../../../queries";
import { PageHeader, StatCard } from "../../../design-system";
import { BulletinTable } from "../components/BulletinTable";

const SEVERITIES: { severity: PatchSeverity; tone: string }[] = [
  { severity: "Critical", tone: "var(--color-danger)" },
  { severity: "High", tone: "var(--color-warning)" },
  { severity: "Medium", tone: "var(--color-info)" },
  { severity: "Low", tone: "var(--sb-grey-400)" },
];

export function PatchBulletinsView() {
  const bulletins = useBulletins();
  return (
    <>
      <PageHeader
        eyebrow="Patch Management"
        title="Patch bulletins"
        description="Microsoft security updates sourced through WSUS, reviewed and staged for deployment."
      />
      <AsyncSection query={bulletins} label="bulletins">
        {(list) => (
          <>
            <div className="stat-grid">
              {SEVERITIES.map(s => (
                <StatCard
                  key={s.severity}
                  label={s.severity}
                  value={list.filter(b => b.severity === s.severity).length}
                  note={`${list.filter(b => b.severity === s.severity && b.status !== "deployed").length} not yet deployed`}
                  tone={s.tone}
                />
              ))}
            </div>
            <BulletinTable bulletins={list} empty="No bulletins have been published yet." />
          </>
        )}
      </AsyncSection>
    </>
  );
}
