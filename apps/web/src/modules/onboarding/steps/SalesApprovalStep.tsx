import { useStepFields } from "./useStepFields";
import { Badge, Button, Callout, Card, IconTile } from "../../../design-system";
import { useProducts, usePsps } from "../../../queries";

/** Wizard step 05 — Sales confirms delivery readiness before the submission is reviewed. */
export function SalesApprovalStep() {
  const { values, choose, message } = useStepFields();
  const psps = usePsps();
  const productsQuery = useProducts();

  const approved = values.salesApproved ?? false;
  const setApproved = (value: boolean) => choose("salesApproved", value);

  // Dynamic customer name from operator or facilities entered in earlier steps
  const customerValue =
    (values.opName as string) ||
    (values.siteName as string) ||
    (values.facilities && values.facilities[0]?.name) ||
    "—";

  // Dynamic product title(s) from product selection step
  const rawProduct = (values.product as string) || "";
  const selectedProducts = rawProduct
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allProducts = productsQuery.data ?? [];
  const resolvedProducts = selectedProducts
    .map((id) => allProducts.find((p) => p.id === id)?.name || id)
    .join(", ");
  const productValue =
    resolvedProducts ||
    (values.productName as string) ||
    (values.product as string) ||
    "—";

  // Dynamic PSP name from app & payment step
  const pspLabel =
    psps.data?.find((p) => p.id === values.psp)?.name ??
    (values.psp as string) ??
    "—";

  const summary = [
    { label: "Customer", value: customerValue },
    { label: "Product", value: productValue },
    { label: "PSP", value: pspLabel },
    { label: "Sales contact", value: "Sales Team" },
  ];

  return (
    <div className="slide-in stack" style={{ gap: "var(--space-5)" }}>
      <Callout tone="neutral" title="Delivery check required —">
        delivery readiness to be checked
      </Callout>
      <Card>
        <div className="card-header">
          <div className="row">
            <IconTile name="creditCard" tone="ink" />
            <div>
              <div className="card-title">Delivery readiness</div>
              <div className="card-desc">Assigned to the Sales team</div>
            </div>
          </div>
          {approved ? <Badge tone="success">Confirmed</Badge> : <Badge tone="warning">Pending</Badge>}
        </div>
        <div className="grid-2" style={{ gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
          {summary.map((s) => (
            <div key={s.label} className="card card-muted" style={{ padding: "var(--space-3) var(--space-4)" }}>
              <div className="stat-label">{s.label}</div>
              <div className="kv-title" style={{ marginTop: "var(--space-1)" }}>{s.value}</div>
            </div>
          ))}
        </div>
        {!approved ? (
          <div className="callout callout-warning" style={{ alignItems: "center", justifyContent: "space-between" }}>
            <div>Waiting for delivery check. Sales Team has been notified by email.</div>
            <Button size="sm" onClick={() => setApproved(true)}>Simulate approval</Button>
          </div>
        ) : (
          <Callout tone="success" title="Ready for delivery">Sales Team confirmed delivery can be done.</Callout>
        )}
      </Card>
      {message("salesApproved") && (
        <div className="error-msg" role="alert">⚠ {message("salesApproved")}</div>
      )}
    </div>
  );
}
