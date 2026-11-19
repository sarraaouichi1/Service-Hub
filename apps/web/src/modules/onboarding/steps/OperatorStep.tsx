import { PRODUCT_REQUIRED_FIELDS, parseProducts } from "@service-hub/shared";
import type { FormTextKey } from "../../../types";
import { Icon } from "../../../components/Icon";
import { Field } from "../../../components/Field";
import { useStepFields } from "./useStepFields";
import { useTemplates } from "../../../queries";

const COUNTRIES: [string, string][] = [
  ["GB", "United Kingdom"], ["DE", "Germany"], ["FR", "France"], ["NL", "Netherlands"], ["CH", "Switzerland"],
  ["AT", "Austria"], ["BE", "Belgium"], ["ES", "Spain"], ["US", "United States"], ["CA", "Canada"],
];

export function OperatorStep() {
  const { input, select, message, values, choose } = useStepFields();
  const selectedList = parseProducts(values.product);
  const templates = useTemplates().data ?? [];
  // Asterisks follow the selected products' onboarding sheets.
  const needs = (key: FormTextKey) => selectedList.some(p => (PRODUCT_REQUIRED_FIELDS[p] ?? []).some(f => f.key === key));
  const needsCity = needs("city");
  const needsOpId = needs("opId");
  const needsCurrency = needs("currency");

  // Choosing a country fills the locale from its country template, without
  // overwriting anything the user already chose.
  const handleCountryChange = (countryCode: string) => {
    choose("country", countryCode);
    const template = templates.find(t => t.country?.toUpperCase() === countryCode.toUpperCase());
    if (!template) return;
    if (template.lang && !values.lang) choose("lang", template.lang);
    if (template.currency && !values.currency) choose("currency", template.currency);
    if (template.vat && !values.vat) choose("vat", template.vat);
    if (template.psp && !values.psp) choose("psp", template.psp);
  };

  return (
    <div className="slide-in">
      <div className="notif-bar">
        <Icon name="zap" size={14} color="var(--color-warning-text)" />
        Fields marked with a red asterisk are required before you can advance to the next step. Numeric fields must contain valid numbers.
      </div>
      <div className="form-grid">
        <Field label={selectedList.includes("entervo-connect") ? "Operator / business partner name" : "Operator Name"} required error={message("opName")} hint="Shared across all products">
          <input {...input("opName")} placeholder="e.g. Medway Hospital NHS Trust" />
        </Field>
        <Field label="Operator ID" required={needsOpId} hint="Unique operator number, 5 digits, e.g. 55555" error={message("opId")}>
          <input {...input("opId", "mono")} placeholder="e.g. 46722" />
        </Field>
        <Field label="Operator Email" required error={message("opEmail")} hint="Shared primary email">
          <input {...input("opEmail")} type="email" placeholder="name@organisation.com" />
        </Field>
        <Field label="Technical Support Email" error={message("techEmail")}>
          <input {...input("techEmail")} type="email" placeholder="it-support@organisation.com" />
        </Field>
        <Field label="Phone Number" error={message("phone")}>
          <input {...input("phone")} placeholder="+44 1634 833 988" />
        </Field>
        <Field label="Parking System Version" hint="Minimum: V2R5M5" error={message("version")}>
          <input {...input("version", "mono")} placeholder="e.g. V3R0M4" />
        </Field>
        <Field label="Operator Address" span2 error={message("address")} hint="Also used for the smart pay API">
          <input {...input("address")} placeholder="Street, postcode, city" />
        </Field>
        <Field label="City" required={needsCity} error={message("city")} hint="Location city — smart web pay and entervo connect">
          <input {...input("city")} placeholder="e.g. London" />
        </Field>

        <div className="form-section-title span-2">
          Locale &amp; finance
          <span>Shared by every cell computer this operator runs. Connection details go on the next step.</span>
        </div>
        <Field label="Country" required error={message("country")} hint="Loads the country template's defaults">
          <select
            className={`form-select${message("country") ? " error" : values.country ? " valid" : ""}`}
            value={(values.country as string | undefined) ?? ""}
            onChange={(e) => handleCountryChange(e.target.value)}
          >
            <option value="">Select country…</option>
            {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}
          </select>
        </Field>
        <Field label="Language Tag" required hint="ISO 639-1 + country code" error={message("lang")}>
          <select {...select("lang")}>
            <option value="">Select language…</option>
            <option>en-GB</option><option>en-US</option><option>de-DE</option><option>de-AT</option><option>de-CH</option>
            <option>fr-FR</option><option>nl-NL</option><option>nl-BE</option><option>es-ES</option>
          </select>
        </Field>
        <Field label="Currency Code" required={needsCurrency} hint="ISO 4217" error={message("currency")}>
          <select {...select("currency")}>
            <option value="">Select currency…</option>
            <option>GBP</option><option>EUR</option><option>CHF</option><option>USD</option><option>CAD</option>
          </select>
        </Field>
        <Field label="Decimal Places in Currency" required={needs("decimals")} hint="Default 2" error={message("decimals")}>
          <input {...input("decimals", "mono")} placeholder="2" />
        </Field>
        <Field label="VAT Percentage" hint="Whole number 0–100" error={message("vat")}>
          <input {...input("vat", "mono")} placeholder="e.g. 20" />
        </Field>

      </div>
    </div>
  );
}
