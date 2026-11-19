import { useMemo, useState } from "react";
import type { OnboardingForm } from "../../../types";
import { Icon } from "../../../components/Icon";
import { useProducts, usePsps } from "../../../queries";
import { buildConfigurationSections, sectionsToText } from "./sections";

/**
 * Every step of an onboarding on one page, each section collapsible, with the
 * copy buttons the testers asked for: plain text to paste into a ticket or an
 * email, and JSON for tooling.
 *
 * A stored configuration arrives without credentials (the API strips them), but
 * in the wizard the form still holds whatever was typed this session — so the
 * JSON is stripped here as well, and nothing secret can reach the clipboard.
 */
function withoutCredentials(data: OnboardingForm): OnboardingForm {
  const copy: OnboardingForm = { ...data };
  delete copy.pspKey;
  delete copy.pspSecret;
  if (copy.cellComputers) copy.cellComputers = copy.cellComputers.map((cell) => ({ ...cell, uiPassword: "" }));
  return copy;
}

export function ConfigurationView({ data, title }: { data: OnboardingForm; title: string }) {
  const products = useProducts().data;
  const psps = usePsps().data;
  const sections = useMemo(() => buildConfigurationSections(data, {
    productName: (id) => products?.find(p => p.id === id)?.name ?? id,
    pspName: (id) => psps?.find(p => p.id === id)?.name ?? id,
  }), [data, products, psps]);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<"text" | "json" | "failed" | null>(null);

  const copy = async (kind: "text" | "json") => {
    const payload = kind === "text" ? sectionsToText(title, sections) : JSON.stringify(withoutCredentials(data), null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(kind);
    } catch {
      // Clipboard access can be refused (an insecure origin, a denied
      // permission); say so rather than pretending it worked.
      setCopied("failed");
    }
    window.setTimeout(() => setCopied(null), 2500);
  };

  const toggle = (id: string) => setCollapsed(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <div className="config-view">
      <div className="config-toolbar">
        <div className="config-toolbar-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCollapsed(new Set())}>Expand all</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCollapsed(new Set(sections.map(s => s.id)))}>Collapse all</button>
        </div>
        <div className="config-toolbar-actions">
          <span className="config-copied" role="status" aria-live="polite">
            {copied === "text" && "Configuration copied"}
            {copied === "json" && "JSON copied"}
            {copied === "failed" && "Copy failed — your browser blocked clipboard access"}
          </span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => void copy("json")}>
            <Icon name="fileText" size={14} /> Copy JSON
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => void copy("text")}>
            <Icon name="layers" size={14} /> Copy configuration
          </button>
        </div>
      </div>

      {sections.map(section => {
        const open = !collapsed.has(section.id);
        return (
          <section className={`config-section${open ? " open" : ""}`} key={section.id}>
            <button type="button" className="config-section-head" aria-expanded={open} onClick={() => toggle(section.id)}>
              <Icon name={section.icon} size={14} />
              <span>{section.title}</span>
              <Icon name="chevronDown" size={14} />
            </button>
            {open && (
              <div className="config-section-body">
                {section.rows.map(([k, v]) => (
                  <div className="review-row" key={k}><div className="review-key">{k}</div><div className="review-val">{v}</div></div>
                ))}
                {section.groups?.map(group => (
                  <div className="config-group" key={group.title}>
                    <div className="config-group-title">{group.title}</div>
                    {group.rows.map(([k, v]) => (
                      <div className="review-row" key={k}><div className="review-key">{k}</div><div className="review-val">{v}</div></div>
                    ))}
                  </div>
                ))}
                {section.rows.length === 0 && !section.groups?.length && <div className="review-row"><div className="review-key">Nothing added</div><div className="review-val">—</div></div>}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
