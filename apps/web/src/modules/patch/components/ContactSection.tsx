import { useState, type FormEvent } from "react";
import { Field } from "../../../components/Field";
import { useAuth } from "../../auth/useAuth";
import { Button, Callout, Icon } from "../../../design-system";
import { CONTACT } from "../data/content";
import { createPatchInquiry } from "../../../api";

const TARGET_EMAILS = [
  "Hafsaoui.Wissal@scheidt-bachmann.de",
  "Aloui.Hadil@scheidt-bachmann.de",
];

export function ContactSection() {
  const { user } = useAuth();
  const [company, setCompany] = useState(user?.company ?? user?.partner ?? "");
  const [message, setMessage] = useState("");
  const [opened, setOpened] = useState(false);
  const [dbRecorded, setDbRecorded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const subject = `Patch Management enquiry${company ? ` — ${company}` : ""}`;
    const body = [
      message,
      "",
      "—",
      `Sender: ${user?.name || "Customer"}`,
      `Email: ${user?.email || "Unknown"}`,
      `Company: ${company || "Not specified"}`,
      `Submitted: ${new Date().toLocaleString()}`,
    ].join("\n");

    try {
      await createPatchInquiry({
        userName: user?.name,
        userEmail: user?.email,
        company,
        message,
      });
      setDbRecorded(true);
    } catch (err) {
      console.warn("Failed to store patch inquiry in DB:", err);
    } finally {
      setIsSubmitting(false);
      const recipientString = TARGET_EMAILS.join(",");
      window.location.href = `mailto:${recipientString}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setOpened(true);
    }
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
            <span><small>Central Service Desk</small>{CONTACT.phone}</span>
          </a>
          <div className="patch-contact-line">
            <Icon name="shield" size={18} />
            <span><small>Security Operations Center</small>Mönchengladbach, Germany · SOC Team</span>
          </div>
          <div className="patch-contact-line">
            <Icon name="clock" size={18} />
            <span><small>Response SLA</small>Priority assessment within 24 hours</span>
          </div>
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
            {dbRecorded ? "✓ Inquiry stored in the platform database. " : ""}
            Your consultation request has been automatically prepared and forwarded to our security team.
          </Callout>
        )}
        <Button type="submit" size="lg" iconEnd="arrowRight" disabled={!message.trim() || isSubmitting}>
          {isSubmitting ? "Recording & Composing..." : "Compose email"}
        </Button>
      </form>
    </section>
  );
}
