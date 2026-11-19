import { useCallback, useEffect, useState } from "react";

/**
 * Light / dark / follow-the-system theme.
 *
 * The choice is a per-browser preference, so it lives in localStorage rather
 * than on the account. `index.html` applies it before React loads, so a dark
 * page never flashes white first. Storage can be unavailable (private modes,
 * locked-down browsers); every access is guarded and the app falls back to
 * following the system.
 */
export type ThemeChoice = "light" | "dark" | "system";

const STORAGE_KEY = "service-hub-theme";
const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

function readChoice(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function apply(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "system" && darkQuery().matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function useTheme(): [ThemeChoice, (next: ThemeChoice) => void] {
  const [choice, setChoice] = useState<ThemeChoice>(readChoice);

  useEffect(() => {
    apply(choice);
    if (choice !== "system") return;
    // Following the system means following it live, e.g. at dusk on macOS.
    const query = darkQuery();
    const onChange = () => apply("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [choice]);

  const update = useCallback((next: ThemeChoice) => {
    try {
      if (next === "system") window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, next);
    } catch { /* the choice still applies for this visit */ }
    setChoice(next);
  }, []);

  return [choice, update];
}

/**
 * Whether the sidebar is collapsed to icons. Remembered per browser; with no
 * choice made yet, a narrow window (a half-screen split) starts collapsed so
 * the page gets the room.
 */
const SIDEBAR_KEY = "service-hub-sidebar-collapsed";

export function useSidebarCollapsed(): [boolean, (next: boolean) => void] {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const stored = window.localStorage.getItem(SIDEBAR_KEY);
      if (stored !== null) return stored === "true";
    } catch { /* fall through to the width-based default */ }
    return window.matchMedia("(max-width: 1100px)").matches;
  });
  const update = useCallback((next: boolean) => {
    try { window.localStorage.setItem(SIDEBAR_KEY, String(next)); } catch { /* applies for this visit */ }
    setCollapsed(next);
  }, []);
  return [collapsed, update];
}
