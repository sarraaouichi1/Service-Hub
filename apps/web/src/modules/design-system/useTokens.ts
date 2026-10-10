import { useMemo } from "react";

export interface Token { name: string; value: string }

/**
 * Every custom property declared on :root, read from the loaded stylesheets.
 * The style guide renders from this rather than a list in code, so a token
 * added to tokens.css appears here without anyone remembering to add it.
 */
export function useTokens(): Token[] {
  return useMemo(() => {
    const names = new Set<string>();
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue; // cross-origin sheets (web fonts) can't be read
      }
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule && rule.selectorText === ":root") {
          for (const prop of Array.from(rule.style)) if (prop.startsWith("--")) names.add(prop);
        }
      }
    }
    const root = getComputedStyle(document.documentElement);
    return [...names].map(name => ({ name, value: root.getPropertyValue(name).trim() }));
  }, []);
}

/** `--sb-sky-300` → `sky`; a brand anchor like `--sb-ink` → `brand`. */
export function paletteFamily(name: string) {
  const m = /^--sb-([a-z]+)-\d+$/.exec(name);
  return m ? m[1] : "brand";
}
