import { AsyncSection } from "../../../components/AsyncSection";
import { useBulletins } from "../../../queries";
import { Callout, PageHeader } from "../../../design-system";
import { BulletinTable } from "../components/BulletinTable";

export function PatchScheduleView() {
  const bulletins = useBulletins();
  return (
    <>
      <PageHeader
        eyebrow="Patch Management"
        title="Patch schedule"
        description="Updates staged for an upcoming maintenance window but not yet deployed."
      />
      <AsyncSection query={bulletins} label="the schedule">
        {(list) => {
          const upcoming = list.filter(b => b.status === "scheduled" || b.status === "pending");
          return (
            <>
              <BulletinTable bulletins={upcoming} empty="Nothing scheduled — every bulletin is deployed or in testing." />
              <div style={{ marginTop: "var(--space-5)" }}>
                <Callout tone="neutral">
                  Roll-outs run off-peak, inside each site's maintenance window. Bulletins still in lab testing
                  join the schedule once they pass.
                </Callout>
              </div>
            </>
          );
        }}
      </AsyncSection>
    </>
  );
}
