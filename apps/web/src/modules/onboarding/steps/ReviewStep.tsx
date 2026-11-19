import { useWatch } from "react-hook-form";
import type { DeclarationReviewStepProps, OnboardingForm } from "../../../types";
import { Icon } from "../../../components/Icon";
import { useOnboardingSchemas } from "../../../queries";
import { ConfigurationView } from "../configuration/ConfigurationView";

export function ReviewStep({ declared, onDeclaredChange }: DeclarationReviewStepProps) {
  const data = useWatch<OnboardingForm>() as OnboardingForm;
  const schemas = useOnboardingSchemas();
  // Named against the schema, so this can't claim the draft is ready when the
  // submit button disagrees — both ask the same question.
  const issues = schemas.draftIssues(data);

  return (
    <div className="slide-in">
      {issues.length > 0 && (
        <div style={{ background: "var(--color-danger-soft)", border: "1px solid var(--color-danger)", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "var(--color-danger-text)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 600 }}>
            <Icon name="zap" size={14} color="var(--color-danger-text)" />
            {issues.length} {issues.length === 1 ? "item needs" : "items need"} attention before you can submit
          </div>
          <ul style={{ margin: "8px 0 0", paddingLeft: 32, lineHeight: 1.7 }}>
            {issues.map((issue, i) => <li key={i}>{issue}</li>)}
          </ul>
        </div>
      )}

      <ConfigurationView data={data} title={`Onboarding — ${data.opName || "untitled"}`} />

      <div className="declaration">
        <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={declared}
            onChange={e => onDeclaredChange(e.target.checked)}
            style={{ marginTop: 2 }}
          />
          <span>I confirm that all information provided is accurate and complete to the best of my knowledge.</span>
        </label>
      </div>
    </div>
  );
}
