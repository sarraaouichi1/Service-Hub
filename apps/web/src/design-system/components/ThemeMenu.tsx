import { useCallback, useRef, useState } from "react";
import { Icon } from "../../components/Icon";
import { useDismiss } from "../useDismiss";
import { useTheme, type ThemeChoice } from "../theme";
import type { IconName } from "../../types";

const OPTIONS: { value: ThemeChoice; label: string; icon: IconName }[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "monitor" },
];

/** The theme switcher in the top bar: light, dark, or follow the operating system. */
export function ThemeMenu() {
  const [choice, setChoice] = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);
  const current = OPTIONS.find(o => o.value === choice) ?? OPTIONS[2];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" className="icon-button" aria-haspopup="menu" aria-expanded={open}
        aria-label={`Theme: ${current.label}`} title={`Theme: ${current.label}`} onClick={() => setOpen(o => !o)}>
        <Icon name={current.icon} size={18} />
      </button>
      {open && (
        <div className="menu menu-narrow fade-in" role="menu">
          <div className="menu-header"><div className="menu-title">Appearance</div></div>
          {OPTIONS.map(o => (
            <button key={o.value} type="button" role="menuitemradio" aria-checked={choice === o.value}
              className={`menu-item${choice === o.value ? " selected" : ""}`}
              onClick={() => { setChoice(o.value); close(); }}>
              <Icon name={o.icon} size={15} /> {o.label}
              {choice === o.value && <span className="menu-item-check"><Icon name="check" size={14} /></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
