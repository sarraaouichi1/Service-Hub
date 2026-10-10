export type ButtonVariant = "primary" | "secondary" | "ghost" | "accent" | "danger" | "inverse";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Button classes as a string, for things that must be a different element —
 * a router `Link`, an `<a>` — but should look like a button.
 */
export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra?: string) {
  return ["btn", `btn-${variant}`, size !== "md" && `btn-${size}`, extra].filter(Boolean).join(" ");
}
