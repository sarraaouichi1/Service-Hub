import type { CSSProperties, ReactNode } from "react";

/**
 * One headline figure. `tone` is any colour token — the project-status tokens
 * in particular — and sets the card's top rule.
 */
export function StatCard({ label, value, note, noteTone, tone }: {
  label: ReactNode; value: ReactNode; note?: ReactNode; noteTone?: "up" | "pending"; tone?: string;
}) {
  return (
    <div className="stat-card" style={tone ? ({ "--stat-tone": tone } as CSSProperties) : undefined}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {note && <div className={`stat-change${noteTone ? ` ${noteTone}` : ""}`}>{note}</div>}
    </div>
  );
}

/** The slate counter band from the S&B home page: large sky figures on slate. */
export function StatBand({ items, children }: { items: { value: ReactNode; label: ReactNode }[]; children?: ReactNode }) {
  return (
    <div className="band on-inverse">
      <div className="band-stats">
        {items.map((item, i) => (
          <div key={i}>
            <div className="band-stat-value">{item.value}</div>
            <div className="band-stat-label">{item.label}</div>
          </div>
        ))}
      </div>
      {children && <div style={{ display: "flex", justifyContent: "center", marginTop: "var(--space-8)" }}>{children}</div>}
    </div>
  );
}
