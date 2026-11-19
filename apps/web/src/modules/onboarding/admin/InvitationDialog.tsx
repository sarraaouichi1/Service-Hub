import { useEffect, useRef, useState } from "react";
import type { Invitation } from "../../../api";
import { Icon } from "../../../components/Icon";

/**
 * Shown after a user is created (or a pending user gets a new link). Email
 * isn't wired up yet, so this is how the link reaches the new person: the
 * administrator copies it and sends it themselves. The link is shown once —
 * only its fingerprint is stored, so it can't be looked up again later.
 */
export function InvitationDialog({ name, email, invitation, onClose }: {
  name: string; email: string; invitation: Invitation; onClose: () => void;
}) {
  const link = `${window.location.origin}${invitation.activationPath}`;
  const [copied, setCopied] = useState<"ok" | "failed" | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
  }, []);

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied("ok"); } catch { setCopied("failed"); }
  };

  return (
    <dialog ref={dialog} className="modal" onClose={onClose} aria-labelledby="invite-title">
      <div className="modal-head">
        <div className="icon-tile sm success"><Icon name="check" size={18} /></div>
        <div>
          <h2 id="invite-title" className="modal-title">User created</h2>
          <p className="modal-desc">Copy this activation link and send it to {name} ({email}). It works once and expires on {new Date(invitation.expiresAt).toLocaleDateString()}.</p>
        </div>
      </div>
      <div className="copy-field">
        <input className="form-input mono" readOnly value={link} onFocus={(e) => e.currentTarget.select()} aria-label="Activation link" />
        <button type="button" className="btn btn-primary" onClick={() => void copy()}>
          <Icon name="layers" size={14} /> {copied === "ok" ? "Copied" : "Copy link"}
        </button>
      </div>
      {copied === "failed" && <div className="error-msg" role="alert">Your browser blocked clipboard access — select the link and copy it by hand.</div>}
      <p className="modal-note">
        <Icon name="info" size={13} /> Invitation emails will be sent automatically once a mail service is connected. Lost the link? Use the envelope button on the user's row to create a new one.
      </p>
      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={() => dialog.current?.close()}>Done</button>
      </div>
    </dialog>
  );
}
