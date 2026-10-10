import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { signOut } from "../../api";
import { useAuth } from "../../modules/auth/useAuth";
import { Icon } from "../../components/Icon";
import { useDismiss } from "../useDismiss";

/** The signed-in user's avatar and menu — the same in every module. */
export function AccountMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    await navigate({ to: "/login" });
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className="avatar"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        onClick={() => setOpen(o => !o)}
      >
        {user.initials}
      </button>
      {open && (
        <div className="menu fade-in" role="menu">
          <div className="account-card">
            <div className="avatar avatar-lg" aria-hidden="true">{user.initials}</div>
            <div style={{ minWidth: 0 }}>
              <div className="account-name">{user.name}</div>
              <div className="account-role">{user.roles.join(" · ")}</div>
              <div className="account-email">{user.email}</div>
            </div>
          </div>
          <Link to="/onboarding/settings/account" className="menu-item" role="menuitem" onClick={close}><Icon name="user" size={15} /> Account settings</Link>
          <Link to="/onboarding/settings/privacy" className="menu-item" role="menuitem" onClick={close}><Icon name="shield" size={15} /> Privacy &amp; security</Link>
          <Link to="/onboarding/settings/notifications" className="menu-item" role="menuitem" onClick={close}><Icon name="bell" size={15} /> Notification preferences</Link>
          <div className="menu-divider" />
          <button type="button" className="menu-item danger" role="menuitem" onClick={() => void handleSignOut()}><Icon name="logOut" size={15} /> Sign out</button>
        </div>
      )}
    </div>
  );
}
