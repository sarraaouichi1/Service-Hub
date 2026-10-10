import { useStepFields } from "./useStepFields";
import { Badge, Button, Callout, Card, IconTile } from "../../../design-system";

/** Wizard step 05 — Sales confirms payment before the submission is reviewed. */
export function SalesApprovalStep() {
  const { values, choose, message } = useStepFields();
  const approved = values.salesApproved ?? false;
  const setApproved = (value: boolean) => choose("salesApproved", value);
  const summary = [
    { label: "Customer", value: values.siteName || "Medway Hospital" },
    { label: "Product", value: values.productName || "smart web pay" },
    { label: "PSP", value: values.psp || "Fiserv" },
    { label: "Sales contact", value: "Sales Test" },
  ];
  return (
    <div className="slide-in stack" style={{ gap: "var(--space-5)" }}>
      <Callout tone="neutral" title="Sales approval required —">
        before technical review, the Sales team must confirm that the customer's payment has been received.
      </Callout>
      <Card>
        <div className="card-header">
          <div className="row">
            <IconTile name="creditCard" tone="ink" />
            <div>
              <div className="card-title">Payment confirmation</div>
              <div className="card-desc">Assigned to the Sales team</div>
            </div>
          </div>
          {approved ? <Badge tone="success">Confirmed</Badge> : <Badge tone="warning">Pending</Badge>}
        </div>
        <div className="grid-2" style={{ gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
          {summary.map(s => (
            <div key={s.label} className="card card-muted" style={{ padding: "var(--space-3) var(--space-4)" }}>
              <div className="stat-label">{s.label}</div>
              <div className="kv-title" style={{ marginTop: "var(--space-1)" }}>{s.value}</div>
            </div>
          ))}
        </div>
        {!approved ? (
          <div className="callout callout-warning" style={{ alignItems: "center", justifyContent: "space-between" }}>
            <div>Waiting for the Sales team to confirm payment receipt. Sales Test has been notified by email.</div>
            <Button size="sm" onClick={() => setApproved(true)}>Simulate approval</Button>
          </div>
        ) : (
          <Callout tone="success" title="Payment confirmed by Sales.">Sales Test confirmed the payment was received.</Callout>
        )}
      </Card>
      {message("salesApproved") && (
        <div className="error-msg" role="alert">⚠ {message("salesApproved")}</div>
      )}
    </div>
  );
}
