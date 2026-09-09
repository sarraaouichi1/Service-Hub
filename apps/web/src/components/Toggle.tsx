import type { ToggleProps } from "../types";

export function Toggle({ label, sub, value, onChange }: ToggleProps) {
  return (
    <div className="toggle-row">
      <div>
        <div className="toggle-info">{label}</div>
        {sub && <div className="toggle-sub">{sub}</div>}
      </div>
      <button className={`toggle${value ? " on" : ""}`} onClick={() => onChange(!value)} />
    </div>
  );
}
