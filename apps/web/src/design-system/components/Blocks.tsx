import type { CSSProperties, ReactNode } from "react";
import { Icon } from "../../components/Icon";
import type { IconName } from "../../types";

/** A slate panel beside a grey one — the division rows on scheidt-bachmann.de. */
export function Tile({ media, reverse, children }: { media: ReactNode; reverse?: boolean; children: ReactNode }) {
  return (
    <div className={`tile${reverse ? " reverse" : ""}`}>
      <div className="tile-media">{media}</div>
      <div className="tile-body">{children}</div>
    </div>
  );
}

/** The slate half of a tile when there's no photograph: one icon in sky rings.
 *  Pass `imageSrc` to show a real cover photo instead. */
export function TileArt({ icon, label, imageSrc }: { icon: IconName; label?: ReactNode; imageSrc?: string }) {
  if (imageSrc) {
    return (
      <div className="tile-art tile-art-photo" aria-hidden="true">
        <img src={imageSrc} alt="" loading="lazy" />
        {label && <div className="tile-art-label">{label}</div>}
      </div>
    );
  }
  return (
    <div className="tile-art" aria-hidden="true">
      <div className="tile-art-ring"><Icon name={icon} size={48} /></div>
      {label && <div className="tile-art-label">{label}</div>}
    </div>
  );
}


export function CheckList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="check-list">
      {items.map((item, i) => (
        <li key={i}>
          <span className="check-mark" aria-hidden="true"><Icon name="check" /></span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const CALLOUT_ICON: Record<CalloutTone, IconName> = {
  info: "info", warning: "alert", danger: "alert", success: "check", neutral: "info",
};
type CalloutTone = "info" | "warning" | "danger" | "success" | "neutral";

export function Callout({ tone = "info", title, children }: { tone?: CalloutTone; title?: ReactNode; children: ReactNode }) {
  return (
    <div className={`callout${tone === "info" ? "" : ` callout-${tone}`}`} role={tone === "danger" ? "alert" : undefined}>
      <Icon name={CALLOUT_ICON[tone]} size={16} />
      <div>{title && <strong>{title} </strong>}{children}</div>
    </div>
  );
}

/** A row of numbered steps where one is selected — the process timelines. */
export function Steps<T extends { key: string | number; title: ReactNode; meta?: ReactNode }>({
  items, active, onSelect, label,
}: { items: T[]; active: T["key"]; onSelect: (key: T["key"]) => void; label: string }) {
  return (
    <div className="steps" role="tablist" aria-label={label} style={{ "--steps": items.length } as CSSProperties}>
      {items.map((s, i) => (
        <button
          key={s.key}
          type="button"
          role="tab"
          aria-selected={s.key === active}
          className={`step${s.key === active ? " active" : ""}`}
          onClick={() => onSelect(s.key)}
        >
          <div className="step-index">{i + 1}</div>
          <div className="step-title">{s.title}</div>
          {s.meta && <div className="step-meta">{s.meta}</div>}
        </button>
      ))}
    </div>
  );
}

/** Nodes joined by arrows — an architecture or data flow. */
export function Flow({ nodes }: { nodes: { icon: IconName; label: ReactNode; highlight?: boolean }[] }) {
  return (
    <div className="flow">
      {nodes.map((n, i) => (
        <div key={i} style={{ display: "contents" }}>
          {i > 0 && <span className="flow-arrow" aria-hidden="true"><Icon name="arrowRight" size={18} /></span>}
          <div className={`flow-node${n.highlight ? " highlight" : ""}`}>
            <div className="icon-tile sm"><Icon name={n.icon} size={18} /></div>
            {n.label}
          </div>
        </div>
      ))}
    </div>
  );
}
