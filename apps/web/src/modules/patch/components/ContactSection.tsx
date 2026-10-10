import { useState, type FormEvent } from "react";
import { Field } from "../../../components/Field";
import { useAuth } from "../../auth/useAuth";
import { Button, Callout, Icon } from "../../../design-system";
import { CONTACT } from "../data/content";

/**
 * There is no enquiry endpoint, so the form composes an email in the user's
 * own client rather than claiming to have sent something it hasn't.
 */
export function ContactSection() {
  const { user } = useAuth();
  const [company, setCompany] = useState(user?.company ?? user?.partner ?? "");
  const [message, setMessage] = useState("");
  const [opened, setOpened] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = `Patch Management enquiry${company ? ` — ${company}` : ""}`;
    const body = [message, "", "—", user?.name, user?.email, company].filter(line => line !== undefined).join("\n");
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <section id="contact" className="page-section patch-contact">
      <div className="patch-contact-panel on-inverse">
        <div className="eyebrow">Scheidt &amp; Bachmann security team</div>
        <h2 className="display">Talk with our security experts</h2>
        <p className="lead">
          Book a consultation with our security architects to assess an installation's patch readiness.
        </p>
        <div className="patch-contact-lines">
          <a href={`tel:${CONTACT.phone.replace(/[^+\d]/g, "")}`} className="patch-contact-line">
            <Icon name="phone" size={18} />
            <span><small>Phone</small>{CONTACT.phone}</span>
          </a>
          <a href={`mailto:${CONTACT.email}`} className="patch-contact-line">
            <Icon name="mail" size={18} />
            <span><small>Email</small>{CONTACT.email}</span>
          </a>
        </div>
      </div>

      <form className="patch-contact-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <Field label="Your name">
            <input className="form-input" value={user?.name ?? ""} readOnly />
          </Field>
          <Field label="Company">
            <input className="form-input" value={company} onChange={e => setCompany(e.target.value)} placeholder="Operator or partner name" />
          </Field>
          <Field label="What do you need?" required span2 hint="Endpoint counts and Windows versions help us prepare.">
            <textarea
              className="form-textarea"
              rows={5}
              required
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="e.g. 12 Windows Server 2019 hosts and 40 Windows 10 1809 lane devices across three sites"
            />
          </Field>
        </div>
        {opened && (
          <Callout tone="success">
            Your email app should now have the message ready to send. If nothing opened, write to {CONTACT.email}.
          </Callout>
        )}
        <Button type="submit" size="lg" iconEnd="arrowRight" disabled={!message.trim()}>Compose email</Button>
      </form>
    </section>
  );
}
