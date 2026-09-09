import type { KeyboardEvent } from "react";

/**
 * Props that make a non-semantic element (a card, a table row) behave like a
 * button for keyboard and screen-reader users: focusable, activated by Enter
 * or Space, and announced as a button.
 *
 * Spread it onto the element instead of a bare `onClick`:
 *   <div className="project-card" {...clickable(() => open(p))}>
 */
export function clickable(onActivate: () => void) {
  return {
    role: "button",
    tabIndex: 0,
    onClick: onActivate,
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate();
      }
    },
  };
}
