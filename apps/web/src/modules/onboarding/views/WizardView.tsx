import { useState } from "react";
import { Link, getRouteApi, useNavigate } from "@tanstack/react-router";
import { WIZARD_STEPS } from "../../../data/wizardSteps";
import { Icon } from "../../../components/Icon";
import { clickable } from "../../../components/clickable";
import { ProductSelectionStep } from "../steps/ProductSelectionStep";
import { OperatorStep } from "../steps/OperatorStep";
import { CellComputerStep } from "../steps/CellComputerStep";
import { FacilitiesStep } from "../steps/FacilitiesStep";
import { AppPaymentStep } from "../steps/AppPaymentStep";
import { SalesApprovalStep } from "../steps/SalesApprovalStep";
import { ReviewStep } from "../steps/ReviewStep";
import { useFormContext } from "react-hook-form";
import type { FieldPath } from "react-hook-form";
import type { OnboardingForm } from "../../../types";
import { useOnboarding } from "../context/onboardingContext";
import { fieldsForStep } from "@service-hub/shared";
import { ApiError } from "../../../api";
import { useSaveDraft, useSubmitDraft } from "../../../queries";

const route = getRouteApi("/onboarding/wizard/$step");

const LAST_STEP = WIZARD_STEPS.length - 1;

export function WizardView() {
  const navigate = useNavigate();
  const { step } = route.useParams();
  const { project } = route.useSearch();
  const { declared, setDeclared, submitted, setSubmitted } = useOnboarding();
  const { trigger, formState, getValues, setError } = useFormContext<OnboardingForm>();
  const [failure, setFailure] = useState<string | null>(null);

  const saveDraft = useSaveDraft({ onError: (error) => setFailure(error.message) });

  /**
   * The server re-checks the schema, so a submission can still be refused here.
   * Its 422 carries per-field messages, which go back to the fields that
   * produced them — the same slot the wizard's own validation uses.
   */
  const submitDraft = useSubmitDraft({
    onSuccess: () => { setFailure(null); setSubmitted(true); },
    onError: (error) => {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof OnboardingForm, { message });
        }
      }
      setFailure(error.message);
    },
  });

  // The step lives in the URL, so a refresh or a shared link lands on the
  // same step. Out-of-range values are clamped rather than rendering nothing.
  const wizardStep = Math.min(Math.max(Number(step) || 0, 0), LAST_STEP);

  const goToStep = (next: number) =>
    navigate({
      to: "/onboarding/wizard/$step",
      params: { step: String(Math.min(Math.max(next, 0), LAST_STEP)) },
      search: { project },
    });

  /**
   * Continue is the gate: the step is checked against its schema, and the user
   * only moves on once it passes. Back and the step nav stay free, so a partly
   * filled step is never a trap.
   */
  const advance = async () => {
    const fields = fieldsForStep(wizardStep) as FieldPath<OnboardingForm>[];
    if (await trigger(fields)) goToStep(wizardStep + 1);
  };

  /**
   * Render the active step. A switch rather than an array, so only the step in
   * view is constructed.
   */
  const renderStep = () => {
    switch (wizardStep) {
      case 0: return <ProductSelectionStep />;
      case 1: return <OperatorStep />;
      case 2: return <CellComputerStep />;
      case 3: return <FacilitiesStep />;
      case 4: return <AppPaymentStep />;
      case 5: return <SalesApprovalStep />;
      default: return <ReviewStep declared={declared} onDeclaredChange={setDeclared} />;
    }
  };

  // Submission needs both the declaration ticked and every step's rules met.
  // `isValid` is the whole draft schema, maintained by the form's onTouched mode.
  const canSubmit = declared && formState.isValid;

  if (submitted) {
    return (
      <div className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#E8FAF1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Icon name="check" size={32} color="var(--green)" />
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>Submitted for Review</div>
        <div style={{ fontSize: 14, color: "var(--gray-600)", maxWidth: 400, lineHeight: 1.6 }}>
          Your onboarding data has been submitted to the S&B review team. You'll receive an email notification once it's been reviewed.
        </div>
        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <Link to="/onboarding/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
          <button className="btn btn-primary" onClick={() => { setSubmitted(false); goToStep(LAST_STEP); }}>View Submission</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="wizard-container">
        {/* Step nav */}
        <div className="wizard-nav">
          <div className="wizard-nav-title">Steps</div>
          {WIZARD_STEPS.map((s, i) => {
            const state = wizardStep === s.num ? "active" : wizardStep > s.num ? "done" : "todo";
            return (
              <div key={s.num}>
                <div className={`wizard-step-item${state === "active" ? " active" : ""}`} {...clickable(() => goToStep(s.num))}>
                  <div className={`step-circle ${state}`}>
                    {state === "done" ? <Icon name="check" size={12} color="white" /> : s.num}
                  </div>
                  <div className="step-info">
                    <div className="step-label">{s.label}</div>
                    <div className={`step-name${state === "active" ? " active" : ""}`}>{s.name}</div>
                  </div>
                </div>
                {i < WIZARD_STEPS.length - 1 && <div className="wizard-step-connector" />}
              </div>
            );
          })}
        </div>

        {/* Step body */}
        <div className="wizard-body">
          <div className="wizard-header">
            <div className="wizard-step-tag">{WIZARD_STEPS[wizardStep].label}</div>
            <div className="wizard-title">{WIZARD_STEPS[wizardStep].name}</div>
            <div className="wizard-subtitle">
              {WIZARD_STEPS[wizardStep].subtitle}
            </div>
          </div>

          {renderStep()}

          <div className="wizard-footer">
            <div className="step-dots">
              {WIZARD_STEPS.map(s => (
                <div key={s.num} className={`step-dot${wizardStep === s.num ? " active" : wizardStep > s.num ? " done" : ""}`} />
              ))}
            </div>
            {failure && (
              <div className="error-msg" role="alert" style={{ marginRight: "auto" }}>⚠ {failure}</div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              {wizardStep > 0 && (
                <button className="btn btn-secondary" onClick={() => goToStep(wizardStep - 1)}>
                  <Icon name="chevronLeft" /> Back
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => saveDraft.mutate(getValues())}
                disabled={saveDraft.isPending}>
                {saveDraft.isPending ? "Saving…" : saveDraft.isSuccess ? "Draft saved" : "Save Draft"}
              </button>
              {wizardStep < LAST_STEP ? (
                <button className="btn btn-primary" onClick={() => void advance()}>
                  Continue <Icon name="chevronRight" />
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ background: canSubmit ? "var(--green)" : "var(--gray-200)", color: canSubmit ? "white" : "var(--gray-400)", cursor: canSubmit ? "pointer" : "not-allowed" }}
                  disabled={!canSubmit || submitDraft.isPending}
                  title={canSubmit ? undefined : declared ? "Some steps are still incomplete" : "Tick the confirmation above to submit"}
                  onClick={() => submitDraft.mutate(getValues())}>
                  <Icon name="check" /> Submit for Review
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
