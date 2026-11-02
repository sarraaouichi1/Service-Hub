import { Field } from "../../../components/Field";
import { Toggle } from "../../../components/Toggle";
import { useStepFields } from "./useStepFields";
import { useTemplates } from "../../../queries";

export function CellComputerStep() {
  const { input, select, toggle, message, choose, values } = useStepFields();
  const templatesQuery = useTemplates();
  const templates = templatesQuery.data ?? [];

  const selectedStr = (values.product as string) || "";
  const selectedList = selectedStr ? selectedStr.split(",").filter(Boolean) : [];
  const selectedCountry = values.country as string | undefined;

  // Whenever country changes, automatically prefill default values from active Country Templates
  const handleCountryChange = (countryCode: string) => {
    choose("country", countryCode);
    if (!countryCode) return;

    const matchedTemplate = templates.find(t => t.country?.toUpperCase() === countryCode.toUpperCase());
    if (matchedTemplate) {
      if (matchedTemplate.lang && !values.lang) choose("lang", matchedTemplate.lang);
      if (matchedTemplate.currency && !values.currency) choose("currency", matchedTemplate.currency);
      if (matchedTemplate.vat && !values.vat) choose("vat", matchedTemplate.vat);
      if (matchedTemplate.psp && !values.psp) choose("psp", matchedTemplate.psp);
    }
  };

  return (
    <div className="slide-in">
      <div className="form-grid">
        <Field label="Cell Computer ID" required hint="Numeric ID from entervo system (digits only)" error={message("cellId")}>
          <input {...input("cellId", "mono")} placeholder="e.g. 4438" />
        </Field>
        <Field label="Cell Computer Name" hint="Display name shown in frontend" error={message("cellName")}>
          <input {...input("cellName")} placeholder="e.g. MedwayHZR" />
        </Field>

        {/* 1. Country placed BEFORE Language Tag */}
        <Field label="Country" required error={message("country")} hint="Loads regional defaults">
          <select
            className={`form-select${message("country") ? " error" : values.country ? " valid" : ""}`}
            value={selectedCountry ?? ""}
            onChange={(e) => handleCountryChange(e.target.value)}
          >
            <option value="">Select country…</option>
            <option value="GB">United Kingdom (GB)</option>
            <option value="DE">Germany (DE)</option>
            <option value="FR">France (FR)</option>
            <option value="NL">Netherlands (NL)</option>
            <option value="CH">Switzerland (CH)</option>
            <option value="AT">Austria (AT)</option>
            <option value="BE">Belgium (BE)</option>
            <option value="ES">Spain (ES)</option>
            <option value="US">United States (US)</option>
            <option value="CA">Canada (CA)</option>
          </select>
        </Field>

        {/* 2. Language Tag placed AFTER Country */}
        <Field label="Language Tag" required hint="ISO 639-1 + country code" error={message("lang")}>
          <select {...select("lang")}>
            <option value="">Select language…</option>
            <option>en-GB</option><option>en-US</option><option>de-DE</option><option>de-AT</option><option>de-CH</option>
            <option>fr-FR</option><option>nl-NL</option><option>nl-BE</option><option>es-ES</option>
          </select>
        </Field>

        <Field label="Currency Code" hint="ISO 4217" error={message("currency")}>
          <select {...select("currency")}>
            <option value="">Select currency…</option>
            <option>GBP</option><option>EUR</option><option>CHF</option><option>USD</option><option>CAD</option>
          </select>
        </Field>
        <Field label="Decimal Places in Currency" hint="0 to 4 digits" error={message("decimals")}>
          <input {...input("decimals", "mono")} placeholder="2" />
        </Field>
        <Field label="UI User ID" hint="Digits only (1234567890)" error={message("uiUserId")}>
          <input {...input("uiUserId", "mono")} placeholder="e.g. 98" />
        </Field>
        <Field label="UI User Password" hint="Max 9 chars, no @ or spaces" error={message("uiPassword")}>
          <input {...input("uiPassword", "mono")} type="password" placeholder="••••••••" />
        </Field>
        <Field label="Cashier Terminal Device ID" error={message("deviceId")}>
          <input {...input("deviceId", "mono")} placeholder="e.g. 750" />
        </Field>
        <Field label="VAT Percentage" hint="Whole number 0–100" error={message("vat")}>
          <input {...input("vat", "mono")} placeholder="e.g. 20" />
        </Field>

        {/* entervo connect specific cell details */}
        {selectedList.includes("entervo-connect") && (
          <div style={{ gridColumn: "span 2", marginTop: 8, padding: "14px 16px", background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🔗 entervo connect — Network Port & Services</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--purple)", background: "#EDE9FE", padding: "2px 8px", borderRadius: 4 }}>Product Specific</span>
            </div>
            <div className="form-grid">
              <Field label="SSH Port" hint="Delivered by DevOps (1–65535)" error={message("sshPort")}>
                <input {...input("sshPort", "mono")} placeholder="e.g. 2222" />
              </Field>
            </div>
            <div style={{ marginTop: 12, display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr" }}>
              <Toggle label="Online Authorization" sub="Provider service" {...toggle("onlineAuth")} />
              <Toggle label="Customer & Media" sub="Provider service" {...toggle("customerMedia")} />
              <Toggle label="Counting" sub="Smart CONTRACT" {...toggle("counting")} />
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 18, display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <Toggle label="LPR (Licence Plate Recognition)" {...toggle("lpr")} />
        <Toggle label="Barcode" {...toggle("barcode")} />
        <Toggle label="LFK (Remote key fob)" {...toggle("lfk")} />
      </div>
    </div>
  );
}
