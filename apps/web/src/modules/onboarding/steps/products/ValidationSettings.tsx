import { validationGeneratedUrls } from "@service-hub/shared";
import { Field } from "../../../../components/Field";
import { Toggle } from "../../../../components/Toggle";
import { useStepFields } from "../useStepFields";
import { requiredBy } from "./useProductRequired";

const req = requiredBy("smart-validation");

/**
 * smart validation — "ONBOARDING SHEET (Version 4.4)", section "Customer
 * (Tenant)". Country, currency, language and operator ID are on the Operator
 * step; the cell computer and facility rows (time zone, media types) are on
 * theirs. The sheet's "automatically generated data" is shown, not asked for.
 */
export function ValidationSettings() {
  const { input, toggle, message, values } = useStepFields();
  const generated = validationGeneratedUrls(values.tenantShortname);

  return (
    <div className="slide-in">
      <div className="form-section-title" style={{ marginTop: 0 }}>Customer (tenant)</div>
      <div className="form-grid" style={{ marginTop: 12 }}>
        <Field label="Tenant shortname" required={req("tenantShortname")} error={message("tenantShortname")}
          hint="Company name, up to 20 lowercase letters — becomes part of the URL">
          <input {...input("tenantShortname", "mono")} placeholder="e.g. centralgarage" />
        </Field>
        <Field label="Tenant description" required={req("tenantDescription")} error={message("tenantDescription")}
          hint="The tenant's long name or a description">
          <input {...input("tenantDescription")} placeholder="e.g. Central Garage customer validation" />
        </Field>
        <Field label="SUBtech e-mail" required={req("subtechEmail")} error={message("subtechEmail")}
          hint="For the admin user who will administrate OVAL ADMIN">
          <input {...input("subtechEmail")} type="email" placeholder="admin@organisation.com" />
        </Field>
        <Field label="Incident / maintenance e-mail" error={message("incidentEmail")}
          hint="Address or distribution list for maintenance windows and incidents; several separated by ;">
          <input {...input("incidentEmail")} placeholder="alerts@organisation.com" />
        </Field>
      </div>
      <div className="toggle-grid cols-2" style={{ marginTop: 16 }}>
        <Toggle label="Show licence plate (LPN) in report" sub="Not GDPR conform — leave off unless the customer insists" {...toggle("showLpnInReport")} />
      </div>

      <div className="form-section-title">
        Generated automatically
        <span>From the tenant shortname. S&amp;B (PS ITOPS) adds the App ID.</span>
      </div>
      {generated ? (
        <div className="generated-list">
          {([
            ["URL", generated.url],
            ["Sender e-mail", generated.senderEmail],
            ["SUBtech e-mail (forwards to the address above)", generated.subtechEmail],
            ["OVAL Admin", generated.ovalAdminUrl],
            ["CPI Admin", generated.cpiAdminUrl],
            ["Kiosk app", generated.kioskUrl],
          ] as const).map(([k, v]) => (
            <div className="review-row" key={k}><div className="review-key">{k}</div><div className="review-val">{v}</div></div>
          ))}
        </div>
      ) : (
        <div className="empty-panel">Enter the tenant shortname to see the URLs and addresses it generates.</div>
      )}
    </div>
  );
}
