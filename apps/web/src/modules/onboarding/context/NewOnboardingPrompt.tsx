import { useEffect, useRef } from "react";
import { Icon } from "../../../components/Icon";
import { formatSavedAt } from "./formatSavedAt";

/** "A saved draft exists — resume or start fresh?", asked before anything is thrown away. */
export function NewOnboardingPrompt({ draft, onResume, onStartFresh, onCancel }: {
  draft: { title: string; savedAt: string | null };
  onResume: () => void;
  onStartFresh: () => void;
  onCancel: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
  }, []);

  return (
    <dialog ref={dialog} className="modal" onClose={onCancel} aria-labelledby="draft-prompt-title">
      <div className="modal-head">
        <div className="icon-tile sm"><Icon name="fileText" size={18} /></div>
        <div>
          <h2 id="draft-prompt-title" className="modal-title">You have a saved draft</h2>
          <p className="modal-desc">
            <strong>{draft.title}</strong> was saved {formatSavedAt(draft.savedAt)}. Would you like to resume it or start a new onboarding?
          </p>
        </div>
      </div>
      <p className="modal-note"><Icon name="info" size={13} /> Starting fresh deletes the saved draft.</p>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={() => dialog.current?.close()}>Cancel</button>
        <button type="button" className="btn btn-secondary" onClick={onStartFresh}>Start fresh</button>
        <button type="button" className="btn btn-primary" onClick={onResume} autoFocus>Resume draft</button>
      </div>
    </dialog>
  );
}
