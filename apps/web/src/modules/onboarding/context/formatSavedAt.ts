/** "today at 14:05", "on 12 Nov at 09:30" — how long ago matters more than the exact date. */
export function formatSavedAt(iso: string | null): string {
  if (!iso) return "earlier";
  const when = new Date(iso);
  const time = when.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  if (when.toDateString() === new Date().toDateString()) return `today at ${time}`;
  return `on ${when.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })} at ${time}`;
}
