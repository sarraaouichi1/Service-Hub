import { useStepFields } from "./useStepFields";
import { Badge, Button, Callout, Card, IconTile, Icon } from "../../../design-system";
import { useProducts, usePsps } from "../../../queries";

/** Wizard step 05 — Sales confirms delivery readiness and verifies contract validity. */
export function SalesApprovalStep() {
  const { values, choose, message } = useStepFields();
  const psps = usePsps();
  const productsQuery = useProducts();

  const contractDateStr = (values.contractDate as string) || "";
  let isContractExpired = false;
  let isContractValid = false;

  if (contractDateStr) {
    const d = new Date(contractDateStr);
    if (!isNaN(d.getTime())) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      d.setHours(23, 59, 59, 999);
      if (d < today) {
        isContractExpired = true;
      } else {
        isContractValid = true;
      }
    }
  }

  const approved = (values.salesApproved ?? false) && !isContractExpired && isContractValid;
  const setApproved = (value: boolean) => {
    if (value && (isContractExpired || !isContractValid)) return;
    choose("salesApproved", value);
  };

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

  const contractStatusText = contractDateStr
    ? isContractExpired
      ? `${contractDateStr} (Expired)`
      : `${contractDateStr} (Valid)`
    : "Not specified";

  const summary = [
    { label: "Customer", value: customerValue },
    { label: "Product", value: productValue },
    { label: "PSP", value: pspLabel },
    { label: "Contract Status", value: contractStatusText },
    { label: "Sales contact", value: "Sales Team" },
  ];

  return (
    <div className="slide-in stack" style={{ gap: "var(--space-5)" }}>
      <Callout tone="neutral" title="Delivery check required —">
        delivery readiness to be checked(contract valid, payment confirmed,...)
      </Callout>

      <Card>
        <div className="card-header">
          <div className="row">
            <IconTile name="creditCard" tone="ink" />
            <div>
              <div className="card-title">Delivery readiness &amp; Contract Verification</div>
              <div className="card-desc">Assigned to the Sales team</div>
            </div>
          </div>
          {approved ? <Badge tone="success">Confirmed</Badge> : <Badge tone="warning">Pending</Badge>}
        </div>

        {/* Contract Date Field */}
        <div style={{ background: "var(--gray-50, #F8FAFC)", padding: 18, borderRadius: 8, border: "1px solid var(--gray-200)", marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>
            Contract Date / Validity <span style={{ color: "var(--red)" }}>*</span>
          </label>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="date"
              className={`form-input${isContractExpired ? " error" : ""}`}
              style={{ width: "auto", minWidth: 220, padding: "8px 12px", borderRadius: 6, border: isContractExpired ? "1.5px solid var(--red)" : "1.5px solid var(--gray-300)" }}
              value={contractDateStr}
              onChange={(e) => {
                choose("contractDate", e.target.value);
                const newD = new Date(e.target.value);
                if (!isNaN(newD.getTime())) {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  newD.setHours(23, 59, 59, 999);
                  if (newD < today) {
                    choose("salesApproved", false);
                  }
                }
              }}
            />
            {contractDateStr && (
              isContractExpired ? (
                <span className="badge badge-danger" style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#FEECEC", color: "var(--red)", padding: "6px 12px" }}>
                  <Icon name="alert" size={13} /> Contract Expired
                </span>
              ) : (
                <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#E8FAF1", color: "var(--green)", padding: "6px 12px" }}>
                  <Icon name="check" size={13} /> Contract Active &amp; Valid
                </span>
              )
            )}
          </div>
          <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 6 }}>
            The customer's contract must be valid and active for the customer to be onboarded.
          </div>

          {/* Notification when expired */}
          {isContractExpired && (
            <div className="callout callout-danger" style={{ marginTop: 14, borderLeft: "4px solid var(--red)", background: "#FFF5F5" }} role="alert">
              <Icon name="alert" size={18} color="var(--red)" />
              <div>
                <strong style={{ color: "var(--red)" }}>Contract has Expired!</strong>
                <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "var(--gray-800)" }}>
                  The contract expired on <strong>{contractDateStr}</strong>. The customer must have a valid contract before onboarding can proceed. Please check with the customer or legal team to renew the contract.
                </p>
              </div>
            </div>
          )}

          {/* Notification when empty */}
          {!contractDateStr && (
            <div className="callout callout-warning" style={{ marginTop: 14, borderLeft: "4px solid var(--amber-dark, #D97706)" }}>
              <Icon name="alert" size={16} />
              <div style={{ fontSize: 13 }}>
                Please provide the contract expiration date to verify contract validity.
              </div>
            </div>
          )}

          {/* Notification when valid */}
          {isContractValid && (
            <div className="callout callout-success" style={{ marginTop: 14, borderLeft: "4px solid var(--green)", background: "#F0FFF4" }}>
              <Icon name="check" size={16} color="var(--green)" />
              <div style={{ fontSize: 13, color: "var(--green-dark, #065F46)" }}>
                Active contract confirmed valid through <strong>{contractDateStr}</strong>.
              </div>
            </div>
          )}

          {message("contractDate") && (
            <div className="error-msg" role="alert" style={{ marginTop: 8 }}>⚠ {message("contractDate")}</div>
          )}
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
            <div>
              {isContractExpired
                ? "Delivery clearance blocked: Contract is expired. Please renew the contract first."
                : !contractDateStr
                ? "Waiting for valid contract date and delivery check."
                : "Waiting for delivery check. Sales Team has been notified by email."}
            </div>
            <Button
              size="sm"
              disabled={isContractExpired || !contractDateStr}
              onClick={() => setApproved(true)}>
              Simulate approval
            </Button>
          </div>
        ) : (
          <Callout tone="success" title="Ready for delivery">
            Sales Team confirmed delivery can be done. Active contract verified.
          </Callout>
        )}
      </Card>

      {message("salesApproved") && (
        <div className="error-msg" role="alert">⚠ {message("salesApproved")}</div>
      )}
    </div>
  );
}
