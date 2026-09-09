import type { FieldProps } from "../types";

/**
 * A labelled form control.
 *
 * The whole group is a <label> so the caption is associated with the control
 * it describes without every call site having to invent an id — clicking the
 * caption focuses the input, and screen readers announce the two together.
 *
 * Layout is: caption, control, then one message slot underneath. That slot
 * holds the hint by default and is replaced by `error` when there is one, so
 * client-side validation and server-side messages (a 422 field error, say)
 * render in exactly the same place and never stack up.
 */
export function Field({ label, hint, required, children, span2, error }: FieldProps) {
  return (
    <label className={`form-group${span2 ? " span2" : ""}`}>
      <span className="form-label">
        {label}
        {required && <span aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </span>
      {children}
      {error
        ? <span className="error-msg" role="alert">⚠ {error}</span>
        : hint && <span className="form-hint">{hint}</span>}
    </label>
  );
}
