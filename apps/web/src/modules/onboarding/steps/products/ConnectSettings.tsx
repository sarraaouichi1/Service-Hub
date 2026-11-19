import { CONNECT_SERVICES } from "@service-hub/shared";
import { Field } from "../../../../components/Field";
import { Toggle } from "../../../../components/Toggle";
import type { FormBoolKey, FormTextKey } from "../../../../types";
import { useStepFields } from "../useStepFields";
import { requiredBy } from "./useProductRequired";

const req = requiredBy("entervo-connect");

/**
 * entervo connect — "ONBOARDING SHEET (Version 3.0)". The business partner's
 * name, country, city, currency and operator ID are on the Operator step; the
 * cell computer's participant ID and password on the Cell Computers step; the
 * carpark type per facility on Facilities. The facility API key, username and
 * password are provided by PS ITOPS, so they aren't asked here.
 */
export function ConnectSettings() {
  const { input, select, toggle, message, values } = useStepFields();

  return (
    <div className="slide-in">
      <div className="form-section-title" style={{ marginTop: 0 }}>Business partner</div>
      <div className="form-grid" style={{ marginTop: 12 }}>
        <Field label="Provider ID" required={req("providerId")} error={message("providerId")}
          hint="Provided by PS ITOPS: > 100 for a car park operator, ≤ 100 for an authorisation provider">
          <input {...input("providerId", "mono")} placeholder="e.g. 101" />
        </Field>
      </div>

      <div className="form-section-title">Contact person <span>Overall responsibility</span></div>
      <div className="form-grid" style={{ marginTop: 12 }}>
        <Field label="Salutation" required={req("salutation")} error={message("salutation")}>
          <select {...select("salutation")}>
            <option value="">Select…</option>
            <option>Mr</option><option>Ms</option><option>Mx</option>
          </select>
        </Field>
        <Field label="Title" error={message("contactTitle")}>
          <input {...input("contactTitle")} placeholder="e.g. Dr." />
        </Field>
        <Field label="First name" required={req("contactFirstname")} error={message("contactFirstname")}>
          <input {...input("contactFirstname")} />
        </Field>
        <Field label="Surname" required={req("contactSurname")} error={message("contactSurname")}>
          <input {...input("contactSurname")} />
        </Field>
        <Field label="Street / house no." error={message("contactStreet")}>
          <input {...input("contactStreet")} />
        </Field>
        <Field label="Postcode / city" error={message("contactCity")}>
          <input {...input("contactCity")} placeholder="e.g. 41238 Mönchengladbach" />
        </Field>
        <Field label="E-mail" required={req("contactEmail")} error={message("contactEmail")}>
          <input {...input("contactEmail")} type="email" />
        </Field>
        <Field label="Phone" required={req("contactPhone")} error={message("contactPhone")}>
          <input {...input("contactPhone")} placeholder="+49 …" />
        </Field>
      </div>

      <div className="form-section-title">Administrator <span>Technical contact for S&amp;B Service</span></div>
      <div className="form-grid" style={{ marginTop: 12 }}>
        <Field label="Username" required={req("adminUsername")} error={message("adminUsername")}>
          <input {...input("adminUsername")} />
        </Field>
        <Field label="Name" required={req("adminName")} error={message("adminName")}>
          <input {...input("adminName")} />
        </Field>
        <Field label="E-mail" required={req("adminEmail")} error={message("adminEmail")}>
          <input {...input("adminEmail")} type="email" />
        </Field>
        <Field label="Phone" error={message("adminPhone")}>
          <input {...input("adminPhone")} />
        </Field>
      </div>

      <div className="form-section-title">Services <span>Switch on each service used and name its provider</span></div>
      <div className="connect-services">
        {CONNECT_SERVICES.map(service => {
          const on = Boolean(values[service.toggle as FormBoolKey]);
          return (
            <div className="connect-service" key={service.toggle}>
              <Toggle label={service.label} {...toggle(service.toggle as FormBoolKey)} />
              <input {...input(service.provider as FormTextKey)} placeholder="Provider" disabled={!on}
                aria-label={`${service.label} provider`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
