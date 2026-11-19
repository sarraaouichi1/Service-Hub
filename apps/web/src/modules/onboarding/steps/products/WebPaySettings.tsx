import { useFormContext } from "react-hook-form";
import { PAYMENT_METHOD_LABELS, PSP_DEFINITIONS, SERVICE_FEE_TYPES, pspDefinition } from "@service-hub/shared";
import { Field } from "../../../../components/Field";
import { Toggle } from "../../../../components/Toggle";
import { Icon } from "../../../../components/Icon";
import { clickable } from "../../../../components/clickable";
import type { OnboardingForm } from "../../../../types";
import { useSecretsOnFile } from "../../../../queries";
import { useStepFields } from "../useStepFields";
import { requiredBy } from "./useProductRequired";

const req = requiredBy("smart-web-pay");

/**
 * smart web pay — "ONBOARDING SHEET (Version 3.1)". Operator ID, name,
 * address, phone, city, country, language, currency, decimals and VAT are on
 * the Operator step; the cell computer rows (host name, IP/port or URL,
 * username, password, device and cashier IDs) on Cell Computers; facility
 * addresses and parent facilities on Facilities. Location ID and shift ID /
 * number are set by S&B, so they aren't asked here.
 */
export function WebPaySettings() {
  const { input, select, toggle, message, values } = useStepFields();
  const serviceFeeType = values.serviceFeeType;

  return (
    <div className="slide-in">
      <div className="form-section-title" style={{ marginTop: 0 }}>Operator</div>
      <div className="form-grid" style={{ marginTop: 12 }}>
        <Field label="Operator description" required={req("opDescription")} error={message("opDescription")} span2>
          <input {...input("opDescription")} placeholder="e.g. Central Garage car parks, London" />
        </Field>
        <Field label="Contact-us e-mail" required={req("contactUsEmails")} error={message("contactUsEmails")}
          hint="Several addresses separated by ; without spaces">
          <input {...input("contactUsEmails")} placeholder="parking@org.com;help@org.com" />
        </Field>
        <Field label="Incident e-mail" required={req("incidentEmail")} error={message("incidentEmail")}
          hint="Several addresses separated by ; without spaces">
          <input {...input("incidentEmail")} placeholder="it@org.com" />
        </Field>
        <Field label="E-mail receipt" required={req("receiptEmails")} error={message("receiptEmails")}
          hint="Receives receipt copies; several separated by ;">
          <input {...input("receiptEmails")} placeholder="finance@org.com" />
        </Field>
      </div>

      <div className="form-section-title">PSP merchant <span>What drivers see when they pay</span></div>
      <div className="form-grid" style={{ marginTop: 12 }}>
        <Field label="Terms of use link" required={req("tocUrl")} error={message("tocUrl")}>
          <input {...input("tocUrl")} placeholder="https://…" />
        </Field>
        <Field label="PGS location description" required={req("pgsLocationDescription")} error={message("pgsLocationDescription")}
          hint="Also used as the merchant PSP reference">
          <input {...input("pgsLocationDescription")} />
        </Field>
        <Field label="Financial info" error={message("financialInfo")} hint="Printed on the receipt">
          <input {...input("financialInfo")} placeholder="e.g. Company Ltd · VAT GB123456789" />
        </Field>
        <Field label="Tariff class" error={message("tariff")} hint="Default 0">
          <input {...input("tariff", "mono")} placeholder="0" />
        </Field>
      </div>
      <p className="field-note"><Icon name="info" size={13} /> The sheet asks for a logo: send it to S&amp;B as an image file (not a PDF), at least 150 pixels high.</p>

      <div className="form-section-title">Payment settings</div>
      <div className="form-grid" style={{ marginTop: 12 }}>
        <Field label="In-pay time after entry (min)" required={req("inPayAfterEntry")} error={message("inPayAfterEntry")} hint="Default 0; facilities can override">
          <input {...input("inPayAfterEntry", "mono")} placeholder="0" />
        </Field>
        <Field label="In-pay time after payment (min)" required={req("inPayAfterPayment")} error={message("inPayAfterPayment")} hint="Default 0; facilities can override">
          <input {...input("inPayAfterPayment", "mono")} placeholder="0" />
        </Field>
        <Field label="Shift handling time" error={message("shiftHandlingTime")} hint="hh:mm, default 00:15">
          <input {...input("shiftHandlingTime", "mono")} placeholder="00:15" />
        </Field>
        <Field label="Service fee" required={req("serviceFeeType")} error={message("serviceFeeType") ?? message("serviceFee")}>
          <div className="inline-pair">
            <select {...select("serviceFeeType")}>
              <option value="">Select…</option>
              {SERVICE_FEE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {serviceFeeType && serviceFeeType !== "none" && (
              <input {...input("serviceFee", "mono")} placeholder={serviceFeeType === "percentage" ? "e.g. 2.5 (%)" : "e.g. 0.50"}
                aria-label="Service fee amount" />
            )}
          </div>
        </Field>
      </div>
      <div className="toggle-grid cols-3" style={{ marginTop: 14 }}>
        <Toggle label="Prepayment supported" {...toggle("prepay")} />
        <Toggle label="Late payment supported" {...toggle("latePayment")} />
        <Toggle label={'Show "in-pay time" after payment'} {...toggle("showInPayTime")} />
      </div>

      <PspSection />
    </div>
  );
}

/**
 * The PSP choice and, below it, exactly the fields and payment methods that
 * PSP's column of the sheet lists. Secret fields are write-only: a stored one
 * shows as "stored" and is left alone unless retyped.
 */
function PspSection() {
  const { register, setValue, trigger, formState } = useFormContext<OnboardingForm>();
  const { values, choose, message } = useStepFields();
  const secretsOnFile = useSecretsOnFile();
  const psp = pspDefinition(values.psp);
  const methods = values.pspConfig?.methods ?? [];
  const configError = message("pspConfig");

  const toggleMethod = (method: string) => {
    const next = methods.includes(method) ? methods.filter(m => m !== method) : [...methods, method];
    setValue("pspConfig.methods", next, { shouldDirty: true });
    if (formState.errors.pspConfig) void trigger("pspConfig");
  };

  return (
    <>
      <div className="form-section-title">
        Payment service provider <span className="req-mark">*</span>
        <span>Choose the customer's PSP; its fields appear below.</span>
      </div>
      <div className="psp-grid" style={{ marginTop: 12 }}>
        {PSP_DEFINITIONS.map(p => (
          <div key={p.id} className={`psp-card${values.psp === p.id ? " selected" : ""}`} {...clickable(() => choose("psp", p.id))}>
            <div className="psp-name">{p.name}</div>
            <div className="psp-tag">{p.tag}</div>
          </div>
        ))}
      </div>
      {message("psp") && <div className="error-msg" role="alert" style={{ marginTop: 8 }}>⚠ {message("psp")}</div>}

      {psp && (
        <div className="product-panel slide-in" style={{ marginTop: 16 }}>
          <div className="product-panel-title">{psp.name} — credentials &amp; payment methods</div>
          <div className="form-grid">
            {psp.fields.map(f => {
              const stored = f.secret && secretsOnFile.includes(`pspConfig.fields.${f.key}`);
              const name = `pspConfig.fields.${f.key}` as const;
              return (
                <Field key={f.key} label={f.label} required={f.required}
                  hint={stored ? "Stored — type to replace" : f.hint}>
                  {f.options ? (
                    <select className="form-select" {...register(name)}>
                      <option value="">Select…</option>
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input className={`form-input${f.secret ? " mono" : ""}`} {...register(name)}
                      type={f.secret ? "password" : "text"} autoComplete="off"
                      placeholder={stored ? "•••••••• stored" : f.secret ? "••••••••" : ""} />
                  )}
                </Field>
              );
            })}
          </div>
          <div className="service-picker">
            <div className="service-picker-label">Payment methods <span className="req">*</span></div>
            <div className="service-picker-options">
              {psp.methods.map(m => (
                <label key={m} className={`service-chip${methods.includes(m) ? " selected" : ""}`}>
                  <input type="checkbox" checked={methods.includes(m)} onChange={() => toggleMethod(m)} />
                  {PAYMENT_METHOD_LABELS[m] ?? m}
                </label>
              ))}
            </div>
          </div>
          {configError && <div className="error-msg" role="alert" style={{ marginTop: 10 }}>⚠ {configError}</div>}
        </div>
      )}
    </>
  );
}
