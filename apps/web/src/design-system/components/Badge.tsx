import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "ink" | "outline";

/** A short status label. `dot` keeps the leading status dot; turn it off for plain tags. */
export function Badge({ tone = "neutral", dot = true, children }: { tone?: BadgeTone; dot?: boolean; children: ReactNode }) {
  return <span className={`badge badge-${tone}${dot ? "" : " plain"}`}>{children}</span>;
}
