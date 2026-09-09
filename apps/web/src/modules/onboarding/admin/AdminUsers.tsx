import { useState } from "react";
import type { InviteDraft, InviteDraftTextKey, UserRole } from "../../../types";
import { ROLE_COLORS, USER_ROLES } from "../../../data/display";
import { AsyncSection } from "../../../components/AsyncSection";
import { ApiError } from "../../../api";
import { useCreateUser, useUpdateUser, useUsers } from "../../../queries";

const EMPTY_INVITE: InviteDraft = { name: "", email: "", role: "Customer", partner: "" };

/** "Today, 09:14" is friendlier than an ISO string for a table you scan. */
function formatLastLogin(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const when = new Date(iso);
  const today = new Date();
  const sameDay = when.toDateString() === today.toDateString();
  const time = when.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return sameDay ? `Today, ${time}` : when.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function AdminUsers() {
  const query = useUsers();
  const users = query.data ?? [];
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState<InviteDraft>(EMPTY_INVITE);
  const [filter, setFilter] = useState<"all" | UserRole>("all");
  const [failure, setFailure] = useState<string | null>(null);

  // Server state, so the write goes to the API and the list refreshes from it.
  // The server also refuses anything that would lock the platform out — the
  // last active administrator can't be demoted or deactivated.
  const createUser = useCreateUser({
    onSuccess: () => { setShowInvite(false); setInvite(EMPTY_INVITE); setFailure(null); },
    onError: (error) => setFailure(error instanceof ApiError ? error.message : "Couldn't invite that user"),
  });
  const updateUser = useUpdateUser({
    onError: (error) => setFailure(error instanceof ApiError ? error.message : "Couldn't update that user"),
    onSuccess: () => setFailure(null),
  });

  const filtered = filter === "all" ? users : users.filter(u => u.roles.includes(filter));

  const sendInvite = () => {
    if (!invite.email || !invite.name) return;
    createUser.mutate({
      email: invite.email, name: invite.name, partner: invite.partner, roles: [invite.role],
    });
  };

  const toggleUserStatus = (id: string, status: string) =>
    updateUser.mutate({ id, patch: { status: status === "active" ? "inactive" : "active" } });

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="page-title">User Management</div>
          <div className="page-desc">Manage platform access, roles, and permissions.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Invite User
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="fade-in" style={{ background: "white", border: "2px solid var(--blue-bright)", borderRadius: 10, padding: 24, marginBottom: 24, boxShadow: "var(--shadow)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 18 }}>Invite New User</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            {([
              { label: "Full Name", key: "name", placeholder: "e.g. Anna Schmidt" },
              { label: "Email Address", key: "email", placeholder: "anna@company.com" },
              { label: "Organisation / Partner", key: "partner", placeholder: "e.g. S&B DE" },
            ] as { label: string; key: InviteDraftTextKey; placeholder: string }[]).map(f => (
              <div key={f.key}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-800)", marginBottom: 5 }}>{f.label}</div>
                <input
                  style={{ width: "100%", padding: "8px 12px", border: "1.5px solid var(--gray-200)", borderRadius: 7, fontFamily: "var(--font)", fontSize: 13 }}
                  placeholder={f.placeholder}
                  value={invite[f.key]}
                  onChange={e => setInvite({ ...invite, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-800)", marginBottom: 5 }}>Role</div>
              <select
                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid var(--gray-200)", borderRadius: 7, fontFamily: "var(--font)", fontSize: 13, background: "white" }}
                value={invite.role}
                onChange={e => setInvite({ ...invite, role: e.target.value as UserRole })}
              >
                {USER_ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={sendInvite}>Send Invitation</button>
            <button className="btn btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Users", value: users.length, color: "var(--navy)" },
          { label: "Active", value: users.filter(u => u.status === "active").length, color: "var(--green)" },
          { label: "Customers", value: users.filter(u => u.roles.includes("Customer")).length, color: "var(--blue)" },
          { label: "Pending", value: users.filter(u => u.status === "pending").length, color: "var(--amber)" },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", border: "1px solid var(--gray-200)", borderRadius: 8, padding: "14px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["all", ...USER_ROLES] as ("all" | UserRole)[]).map(r => (
          <button key={r} onClick={() => setFilter(r)}
            style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.12s",
              background: filter === r ? "var(--navy)" : "white",
              color: filter === r ? "white" : "var(--gray-600)",
              borderColor: filter === r ? "var(--navy)" : "var(--gray-200)" }}>
            {r === "all" ? "All Users" : r}
          </button>
        ))}
      </div>

      {failure && (
        <div className="error-msg" role="alert" style={{ marginBottom: 14 }}>⚠ {failure}</div>
      )}

      {/* User list */}
      <div style={{ background: "white", border: "1px solid var(--gray-200)", borderRadius: 10, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2.5fr 2fr 1.2fr 1.2fr 1.2fr 80px", padding: "10px 18px", background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
          {["User", "Email", "Role", "Organisation", "Last Login", ""].map((h, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</div>
          ))}
        </div>
        <AsyncSection query={query} label="users">
          {() => <>
        {filtered.map((u, i) => (
          <div key={u.id} style={{ display: "grid", gridTemplateColumns: "2.5fr 2fr 1.2fr 1.2fr 1.2fr 80px", padding: "12px 18px", borderBottom: i < filtered.length - 1 ? "1px solid var(--gray-100)" : "none", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--blue-mid)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--blue)", flexShrink: 0 }}>{u.initials}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{u.name}</div>
                <div style={{ fontSize: 11, color: u.status === "active" ? "var(--green)" : u.status === "pending" ? "var(--amber)" : "var(--gray-400)", fontWeight: 500 }}>
                  {u.status === "active" ? "● Active" : u.status === "pending" ? "◌ Pending invite" : "○ Inactive"}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--gray-600)" }}>{u.email}</div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: ROLE_COLORS[u.roles[0]]?.bg, color: ROLE_COLORS[u.roles[0]]?.color }}>
                {u.roles[0]}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--gray-600)" }}>{u.partner}</div>
            <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{formatLastLogin(u.lastLoginAt)}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "var(--gray-400)", fontWeight: 600, padding: "3px 6px", borderRadius: 5 }}
                onClick={() => toggleUserStatus(u.id, u.status)} title={u.status === "active" ? "Deactivate" : "Activate"}>
                {u.status === "active" ? "🔒" : "🔓"}
              </button>
            </div>
          </div>
        ))}
          </>}
        </AsyncSection>
      </div>
    </div>
  );
}
