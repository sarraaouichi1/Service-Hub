import type { CSSProperties } from "react";
import type { PatchBulletin } from "@service-hub/shared";
import { PATCH_SEVERITY_TONE, PATCH_STATUS } from "../../../data/display";
import { Badge } from "../../../design-system";

const COLUMNS = ["Bulletin", "Severity", "Released", "Systems", "Status"];

export function BulletinTable({ bulletins, empty }: { bulletins: PatchBulletin[]; empty: string }) {
  return (
    <div className="data-table" role="table" style={{ "--table-columns": "2.6fr 1fr 1fr 1fr 1fr" } as CSSProperties}>
      <div className="data-table-head" role="row">
        {COLUMNS.map(c => <div key={c} role="columnheader">{c}</div>)}
      </div>
      {bulletins.map(b => (
        <div key={b.id} className="data-table-row" role="row">
          <div role="cell">
            <div className="cell-title">{b.name}</div>
            <div className="cell-sub">{b.id} · {b.risk}</div>
          </div>
          <div role="cell"><Badge tone={PATCH_SEVERITY_TONE[b.severity]}>{b.severity}</Badge></div>
          <div role="cell" className="text-muted">{b.released}</div>
          <div role="cell">{b.systems} endpoints</div>
          <div role="cell"><Badge tone={PATCH_STATUS[b.status].tone} dot={false}>{PATCH_STATUS[b.status].label}</Badge></div>
        </div>
      ))}
      {bulletins.length === 0 && <div className="data-table-empty">{empty}</div>}
    </div>
  );
}
