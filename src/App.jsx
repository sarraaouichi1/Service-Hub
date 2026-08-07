import { useState, useEffect, useRef } from "react";

// ─── DESIGN SYSTEM ──────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #root {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  :root {
    --navy: #0B1F3A;
    --blue: #1152A0;
    --blue-bright: #1A6FD4;
    --blue-pale: #E8F0FB;
    --blue-mid: #C2D6F0;
    --teal: #00A896;
    --amber: #F4A136;
    --red: #E84040;
    --green: #1AB870;
    --white: #FFFFFF;
    --gray-50: #F7F9FC;
    --gray-100: #EEF2F8;
    --gray-200: #DAE2EE;
    --gray-400: #95A3B8;
    --gray-600: #5A6880;
    --gray-800: #2C3A4F;
    --font: 'DM Sans', sans-serif;
    --mono: 'DM Mono', monospace;
    --radius: 10px;
    --shadow-sm: 0 1px 3px rgba(11,31,58,0.08), 0 1px 2px rgba(11,31,58,0.06);
    --shadow: 0 4px 16px rgba(11,31,58,0.10), 0 1px 4px rgba(11,31,58,0.06);
    --shadow-lg: 0 12px 40px rgba(11,31,58,0.14), 0 4px 12px rgba(11,31,58,0.08);
  }

  body { font-family: var(--font); background: var(--gray-50); color: var(--navy); }

  /* Layout */
  .app { display: flex; width: 100vw; height: 100vh; overflow: hidden; }
  .sidebar { width: 260px; min-width: 260px; background: var(--navy); display: flex; flex-direction: column; overflow-y: auto; }
  .main { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
  .topbar { height: 60px; background: var(--white); border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; padding: 0 28px; gap: 16px; flex-shrink: 0; width: 100%; }
  .content { flex: 1; overflow-y: auto; padding: 32px 36px; width: 100%; }

  /* Sidebar */
  .sidebar-logo { padding: 24px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .logo-mark { display: flex; align-items: center; gap: 10px; }
  .logo-icon { width: 34px; height: 34px; background: var(--blue-bright); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .logo-icon svg { width: 18px; height: 18px; }
  .logo-text { color: white; font-size: 15px; font-weight: 700; letter-spacing: -0.3px; }
  .logo-sub { color: rgba(255,255,255,0.4); font-size: 11px; font-weight: 400; margin-top: 1px; letter-spacing: 0.3px; text-transform: uppercase; }

  .sidebar-section { padding: 20px 12px 8px; }
  .sidebar-section-label { color: rgba(255,255,255,0.3); font-size: 10px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; padding: 0 8px; margin-bottom: 4px; }

  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 7px; cursor: pointer; transition: all 0.15s; color: rgba(255,255,255,0.55); font-size: 13.5px; font-weight: 500; }
  .nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.85); }
  .nav-item.active { background: var(--blue-bright); color: white; }
  .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }
  .nav-badge { margin-left: auto; background: var(--amber); color: var(--navy); font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; }

  /* Topbar */
  .topbar-title { font-size: 16px; font-weight: 600; color: var(--navy); flex: 1; }
  .topbar-subtitle { font-size: 13px; color: var(--gray-400); }
  .btn { display: inline-flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 7px; font-family: var(--font); font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
  .btn-primary { background: var(--blue-bright); color: white; }
  .btn-primary:hover { background: var(--blue); }
  .btn-secondary { background: var(--gray-100); color: var(--gray-800); border: 1px solid var(--gray-200); }
  .btn-secondary:hover { background: var(--gray-200); }
  .btn-ghost { background: transparent; color: var(--gray-600); }
  .btn-ghost:hover { background: var(--gray-100); }
  .btn svg { width: 14px; height: 14px; }
  .avatar { width: 32px; height: 32px; background: var(--blue-mid); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--blue); }

  /* Dashboard */
  .page-header { margin-bottom: 28px; }
  .page-title { font-size: 24px; font-weight: 700; color: var(--navy); letter-spacing: -0.5px; }
  .page-desc { font-size: 14px; color: var(--gray-600); margin-top: 4px; }

  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; width: 100%; }
  .stat-card { background: white; border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow-sm); }
  .stat-label { font-size: 12px; font-weight: 600; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.8px; }
  .stat-value { font-size: 32px; font-weight: 700; color: var(--navy); letter-spacing: -1px; margin-top: 6px; }
  .stat-change { font-size: 12px; margin-top: 4px; }
  .stat-change.up { color: var(--green); }
  .stat-change.pending { color: var(--amber); }

  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .section-title { font-size: 15px; font-weight: 700; color: var(--navy); }

  /* Project cards */
  .project-grid { display: grid; gap: 12px; width: 100%; }
  .project-card { background: white; border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 18px 20px; box-shadow: var(--shadow-sm); cursor: pointer; transition: all 0.15s; display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center; }
  .project-card:hover { border-color: var(--blue-mid); box-shadow: var(--shadow); transform: translateY(-1px); }
  .project-card.selected { border-color: var(--blue-bright); box-shadow: 0 0 0 3px rgba(26,111,212,0.12); }
  .project-name { font-size: 14px; font-weight: 700; color: var(--navy); }
  .project-meta { font-size: 12px; color: var(--gray-400); margin-top: 3px; display: flex; align-items: center; gap: 10px; }
  .project-progress { margin-top: 10px; }
  .progress-bar { height: 4px; background: var(--gray-100); border-radius: 4px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 4px; transition: width 0.4s ease; }
  .progress-label { font-size: 11px; color: var(--gray-400); margin-top: 4px; }

  /* Status badges */
  .badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; }
  .badge-draft { background: var(--gray-100); color: var(--gray-600); }
  .badge-draft::before { background: var(--gray-400); }
  .badge-progress { background: #FEF3E8; color: #C07000; }
  .badge-progress::before { background: var(--amber); }
  .badge-review { background: #EBF4FF; color: var(--blue); }
  .badge-review::before { background: var(--blue-bright); }
  .badge-approved { background: #E8FAF1; color: #0F7A40; }
  .badge-approved::before { background: var(--green); }
  .badge-error { background: #FEECEC; color: #B03030; }
  .badge-error::before { background: var(--red); }

  /* Wizard */
  .wizard-container { display: grid; grid-template-columns: 240px 1fr; gap: 0; background: white; border: 1px solid var(--gray-200); border-radius: 12px; box-shadow: var(--shadow); min-height: 600px; overflow: hidden; width: 100%; }
  .wizard-nav { background: var(--gray-50); border-right: 1px solid var(--gray-200); padding: 28px 0; }
  .wizard-nav-title { font-size: 11px; font-weight: 700; color: var(--gray-400); text-transform: uppercase; letter-spacing: 1px; padding: 0 20px 16px; }
  .wizard-step-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 20px; cursor: pointer; transition: background 0.12s; }
  .wizard-step-item:hover { background: white; }
  .wizard-step-item.active { background: white; }
  .step-circle { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 1px; transition: all 0.2s; }
  .step-circle.todo { background: var(--gray-200); color: var(--gray-600); }
  .step-circle.active { background: var(--blue-bright); color: white; box-shadow: 0 0 0 4px rgba(26,111,212,0.15); }
  .step-circle.done { background: var(--green); color: white; }
  .step-info { flex: 1; }
  .step-label { font-size: 12px; color: var(--gray-400); font-weight: 500; }
  .step-name { font-size: 13px; font-weight: 600; color: var(--gray-800); margin-top: 1px; }
  .step-name.active { color: var(--blue-bright); }
  .wizard-step-connector { width: 1px; height: 12px; background: var(--gray-200); margin: 0 32px; }

  .wizard-body { padding: 36px 40px; }
  .wizard-header { margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid var(--gray-100); }
  .wizard-step-tag { font-size: 11px; font-weight: 700; color: var(--blue-bright); text-transform: uppercase; letter-spacing: 1px; }
  .wizard-title { font-size: 22px; font-weight: 700; color: var(--navy); letter-spacing: -0.5px; margin-top: 4px; }
  .wizard-subtitle { font-size: 13px; color: var(--gray-600); margin-top: 6px; }

  /* Form */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .form-grid.full { grid-template-columns: 1fr; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.span2 { grid-column: span 2; }
  .form-label { font-size: 12px; font-weight: 600; color: var(--gray-800); }
  .form-label span { color: var(--red); margin-left: 2px; }
  .form-hint { font-size: 11px; color: var(--gray-400); margin-top: -2px; }
  .form-input { padding: 9px 12px; border: 1.5px solid var(--gray-200); border-radius: 7px; font-family: var(--font); font-size: 13px; color: var(--navy); outline: none; transition: all 0.15s; background: white; }
  .form-input:focus { border-color: var(--blue-bright); box-shadow: 0 0 0 3px rgba(26,111,212,0.1); }
  .form-input.valid { border-color: var(--green); }
  .form-input.error { border-color: var(--red); }
  .form-input.mono { font-family: var(--mono); font-size: 12.5px; }
  .form-select { padding: 9px 12px; border: 1.5px solid var(--gray-200); border-radius: 7px; font-family: var(--font); font-size: 13px; color: var(--navy); outline: none; transition: all 0.15s; background: white; appearance: none; cursor: pointer; }
  .form-select:focus { border-color: var(--blue-bright); box-shadow: 0 0 0 3px rgba(26,111,212,0.1); }
  .error-msg { font-size: 11px; color: var(--red); font-weight: 500; }
  .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--gray-50); border: 1.5px solid var(--gray-200); border-radius: 7px; }
  .toggle-info { font-size: 13px; color: var(--navy); font-weight: 500; }
  .toggle-sub { font-size: 11px; color: var(--gray-400); }
  .toggle { width: 38px; height: 22px; background: var(--gray-200); border-radius: 11px; position: relative; cursor: pointer; transition: background 0.2s; flex-shrink: 0; border: none; }
  .toggle.on { background: var(--blue-bright); }
  .toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; background: white; border-radius: 50%; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
  .toggle.on::after { left: 19px; }

  /* PSP cards */
  .psp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .psp-card { padding: 14px; border: 2px solid var(--gray-200); border-radius: 8px; cursor: pointer; transition: all 0.15s; text-align: center; }
  .psp-card:hover { border-color: var(--blue-mid); background: var(--blue-pale); }
  .psp-card.selected { border-color: var(--blue-bright); background: var(--blue-pale); }
  .psp-name { font-size: 13px; font-weight: 700; color: var(--navy); }
  .psp-tag { font-size: 10px; color: var(--gray-400); margin-top: 2px; }

  /* Facilities */
  .facility-row { display: grid; grid-template-columns: 60px 1fr 1fr 80px 80px 36px; gap: 10px; align-items: center; padding: 10px 14px; background: white; border: 1px solid var(--gray-200); border-radius: 7px; margin-bottom: 8px; }
  .facility-header { display: grid; grid-template-columns: 60px 1fr 1fr 80px 80px 36px; gap: 10px; padding: 6px 14px; margin-bottom: 4px; }
  .facility-col-label { font-size: 11px; font-weight: 600; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.6px; }
  .facility-input { padding: 6px 10px; border: 1.5px solid var(--gray-200); border-radius: 6px; font-family: var(--font); font-size: 12.5px; color: var(--navy); outline: none; width: 100%; }
  .facility-input:focus { border-color: var(--blue-bright); }
  .del-btn { width: 28px; height: 28px; border-radius: 6px; border: none; background: var(--gray-100); color: var(--gray-400); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all 0.12s; }
  .del-btn:hover { background: #FEECEC; color: var(--red); }

  /* Review step */
  .review-section { margin-bottom: 24px; }
  .review-section-title { font-size: 13px; font-weight: 700; color: var(--navy); padding: 10px 14px; background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 7px 7px 0 0; border-bottom: none; display: flex; align-items: center; gap: 8px; }
  .review-row { display: grid; grid-template-columns: 200px 1fr; border: 1px solid var(--gray-200); border-top: none; padding: 9px 14px; }
  .review-row:last-child { border-radius: 0 0 7px 7px; }
  .review-row:nth-child(even) { background: var(--gray-50); }
  .review-key { font-size: 12px; font-weight: 600; color: var(--gray-600); }
  .review-val { font-size: 12.5px; color: var(--navy); font-family: var(--mono); }

  /* Wizard footer */
  .wizard-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 24px; margin-top: 28px; border-top: 1px solid var(--gray-100); }
  .step-dots { display: flex; gap: 6px; }
  .step-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--gray-200); transition: all 0.2s; }
  .step-dot.active { background: var(--blue-bright); width: 20px; border-radius: 4px; }
  .step-dot.done { background: var(--green); }


  /* Topbar dropdowns */
  .topbar-dropdown { position: absolute; top: 52px; right: 0; width: 360px; background: white; border: 1px solid var(--gray-200); border-radius: 12px; box-shadow: var(--shadow-lg); z-index: 999; overflow: hidden; }
  .dropdown-header { padding: 14px 18px; border-bottom: 1px solid var(--gray-100); display: flex; align-items: center; justify-content: space-between; }
  .dropdown-header-title { font-size: 14px; font-weight: 700; color: var(--navy); }
  .notif-item { display: flex; gap: 12px; padding: 13px 18px; border-bottom: 1px solid var(--gray-100); cursor: pointer; transition: background 0.12s; }
  .notif-item:hover { background: var(--gray-50); }
  .notif-item.unread { background: var(--blue-pale); }
  .notif-item.unread:hover { background: #dce9f8; }
  .notif-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .notif-body { flex: 1; min-width: 0; }
  .notif-title { font-size: 13px; font-weight: 600; color: var(--navy); }
  .notif-desc { font-size: 12px; color: var(--gray-600); margin-top: 2px; line-height: 1.4; }
  .notif-time { font-size: 11px; color: var(--gray-400); margin-top: 4px; }
  .notif-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--blue-bright); flex-shrink: 0; margin-top: 5px; }
  .profile-dropdown { position: absolute; top: 52px; right: 0; width: 280px; background: white; border: 1px solid var(--gray-200); border-radius: 12px; box-shadow: var(--shadow-lg); z-index: 999; overflow: hidden; }
  .profile-header { padding: 18px; background: var(--navy); }
  .profile-avatar-lg { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; margin-bottom: 10px; }
  .profile-name { font-size: 15px; font-weight: 700; color: white; }
  .profile-role { font-size: 12px; color: rgba(255,255,255,0.55); margin-top: 2px; }
  .profile-email { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }
  .profile-menu-item { display: flex; align-items: center; gap: 10px; padding: 11px 18px; font-size: 13px; color: var(--gray-800); cursor: pointer; transition: background 0.12s; border-bottom: 1px solid var(--gray-50); }
  .profile-menu-item:hover { background: var(--gray-50); }
  .profile-menu-item svg { color: var(--gray-400); }
  .profile-switch { padding: 12px 18px; background: var(--gray-50); border-top: 1px solid var(--gray-200); }
  .profile-switch-label { font-size: 10px; font-weight: 700; color: var(--gray-400); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .profile-switch-user { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; cursor: pointer; transition: background 0.12s; }
  .profile-switch-user:hover { background: var(--gray-200); }
  .profile-switch-user.active { background: var(--blue-pale); }
  .bell-badge { position: absolute; top: 4px; right: 4px; width: 16px; height: 16px; background: var(--red); border-radius: 50%; font-size: 9px; font-weight: 700; color: white; display: flex; align-items: center; justify-content: center; border: 2px solid white; }
  /* Notifications */
  .notif-bar { background: #FEF9EC; border: 1px solid #F4D78A; border-radius: 8px; padding: 10px 16px; display: flex; align-items: center; gap: 10px; margin-bottom: 20px; font-size: 13px; color: #7A5000; }

  /* Animations */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.25s ease both; }
  @keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
  .slide-in { animation: slideIn 0.22s ease both; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--gray-200); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--gray-400); }
`;

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16, color = "currentColor" }) => {
  const icons = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    check: <><polyline points="20 6 9 17 4 12"/></>,
    chevronRight: <><polyline points="9 18 15 12 9 6"/></>,
    chevronLeft: <><polyline points="15 18 9 12 15 6"/></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    building: <><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/><rect x="9" y="12" width="6" height="10"/><line x1="9" y1="7" x2="9" y2="7"/><line x1="12" y1="7" x2="12" y2="7"/><line x1="15" y1="7" x2="15" y2="7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    list: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></>,
    creditCard: <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    server: <><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></>,
    mapPin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
    zap: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const PROJECTS = [
  { id: 1, name: "Medway Hospital", partner: "S&B UK", pm: "Marc Delvaux", step: 4, total: 5, status: "progress", psp: "Fiserv", country: "UK", product: "smart web pay" },
  { id: 2, name: "Frankfurt Airport P3", partner: "S&B DE", pm: "Stefan Brandt", step: 5, total: 5, status: "review", psp: "Worldline", country: "DE", product: "econnect" },
  { id: 3, name: "Geneva Centre Mall", partner: "S&B CH", pm: "Laura Meissner", step: 2, total: 5, status: "progress", psp: "CCV", country: "CH", product: "smart validation" },
  { id: 4, name: "Manchester Arena", partner: "S&B UK", pm: "James Hill", step: 5, total: 5, status: "sales-approval", psp: "Planet", country: "UK", product: "smart web pay" },
  { id: 5, name: "Rotterdam Harbour", partner: "S&B NL", pm: "Joost van Dijk", step: 5, total: 5, status: "sales-approval", psp: "NMI", country: "NL", product: "econnect" },
  { id: 6, name: "Brussels Central Station", partner: "S&B BE", pm: "Kai Harperscheidt", step: 5, total: 5, status: "onboarded", psp: "Worldline", country: "BE", product: "smart validation" },
];

const STATUS_MAP = {
  draft: { label: "Draft", cls: "badge-draft" },
  progress: { label: "In Progress", cls: "badge-progress" },
  review: { label: "Pending Review", cls: "badge-review" },
  approved: { label: "Approved", cls: "badge-approved" },
  "sales-approval": { label: "Sales Approval", cls: "badge-sales" },
  onboarded: { label: "Onboarded", cls: "badge-onboarded" },
};


const PRODUCT_MAP = {
  "smart web pay":   { color: "#1A6FD4", bg: "#E8F0FB" },
  "smart validation":{ color: "#1AB870", bg: "#E8FAF1" },
  "econnect":        { color: "#7C3AED", bg: "#EDE9FE" },
  "eaccess":         { color: "#F4A136", bg: "#FEF3E8" },
};

const PSP_LIST = [
  { id: "fiserv", name: "Fiserv / Telecash", tag: "EU / Global" },
  { id: "planet", name: "Planet", tag: "Hospitality" },
  { id: "trustcommerce", name: "TrustCommerce", tag: "US / CA" },
  { id: "nmi", name: "NMI", tag: "US / EU" },
  { id: "ccv", name: "CCV", tag: "Benelux" },
  { id: "worldline", name: "Worldline", tag: "EU" },
];

const WIZARD_STEPS = [
  { num: 0, label: "Step 00", name: "Product Selection" },
  { num: 1, label: "Step 01", name: "Operator & Access" },
  { num: 2, label: "Step 02", name: "Cell Computer" },
  { num: 3, label: "Step 03", name: "Facilities" },
  { num: 4, label: "Step 04", name: "App & Payment" },
  { num: 5, label: "Step 05", name: "Review & Submit" },
];


// ─── USERS ───────────────────────────────────────────────────────────────────
const PLATFORM_USERS = [
  { id: 1, initials: "KH", name: "Kai Harperscheidt", role: "Admin", email: "k.harperscheidt@scheidt-bachmann.de", partner: "S&B HQ", color: "#1A6FD4" },
  { id: 2, initials: "MD", name: "Marc Delvaux", role: "Project Manager", email: "m.delvaux@scheidt-bachmann.de", partner: "S&B UK", color: "#1AB870" },
  { id: 3, initials: "MI", name: "Medway IT", role: "Customer", email: "medwayft.carparking@nhs.net", partner: "Medway Hospital", color: "#F4A136" },
  { id: 4, initials: "AK", name: "Anna Krüger", role: "Sales", email: "a.krueger@scheidt-bachmann.de", partner: "S&B HQ", color: "#C0185A" },
];

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
const INITIAL_NOTIFS = [
  { id: 1, type: "submit", title: "New Onboarding Request", desc: "Medway Hospital submitted Step 4 — App & Payment for review.", time: "5 min ago", read: false, color: "#E8F0FB", iconColor: "#1A6FD4" },
  { id: 7, type: "approve", title: "Payment Confirmed by Sales", desc: "Anna Krüger confirmed payment received for Rotterdam Harbour.", time: "30 min ago", read: false, color: "#FFF0F6", iconColor: "#C0185A" },
  { id: 2, type: "approve", title: "Onboarding Approved", desc: "Manchester Arena has been fully approved by Stefan Brandt.", time: "1 hour ago", read: false, color: "#E8FAF1", iconColor: "#1AB870" },
  { id: 3, type: "reject", title: "Correction Requested", desc: "Geneva Centre Mall — Step 2 was sent back with comments.", time: "2 hours ago", read: false, color: "#FEECEC", iconColor: "#E84040" },
  { id: 4, type: "submit", title: "New Onboarding Request", desc: "Rotterdam Harbour started a new onboarding (Step 1).", time: "Yesterday", read: true, color: "#E8F0FB", iconColor: "#1A6FD4" },
  { id: 5, type: "approve", title: "Onboarding Approved", desc: "Frankfurt Airport P3 approved and ready for DevOps setup.", time: "2 days ago", read: true, color: "#E8FAF1", iconColor: "#1AB870" },
  { id: 6, type: "info", title: "Template Updated", desc: "UK — Default template was updated by Kai Harperscheidt.", time: "3 days ago", read: true, color: "#FEF9EC", iconColor: "#F4A136" },
];

// ─── FORM FIELD COMPONENT ────────────────────────────────────────────────────
function Field({ label, hint, required, children, span2, error }) {
  return (
    <div className={`form-group${span2 ? " span2" : ""}`}>
      <label className="form-label">{label}{required && <span>*</span>}</label>
      {hint && <div className="form-hint">{hint}</div>}
      {children}
      {error && <div className="error-msg">⚠ {error}</div>}
    </div>
  );
}

function Toggle({ label, sub, value, onChange }) {
  return (
    <div className="toggle-row">
      <div>
        <div className="toggle-info">{label}</div>
        {sub && <div className="toggle-sub">{sub}</div>}
      </div>
      <button className={`toggle${value ? " on" : ""}`} onClick={() => onChange(!value)} />
    </div>
  );
}


// ─── STEP 0: PRODUCT SELECTION ───────────────────────────────────────────────
const PRODUCTS = [
  {
    id: "smart-web-pay",
    name: "smart web pay",
    desc: "Mobile payment solution for parking — lets drivers pay via QR code or web browser without an app.",
    icon: "💳",
    color: "#1A6FD4",
    bg: "#E8F0FB",
    fields: ["Operator", "Cell Computer", "Facilities", "PSP / Payment"],
  },
  {
    id: "smart-validation",
    name: "smart validation",
    desc: "New tenant request for validation-based parking — businesses validate parking tickets for their customers.",
    icon: "✅",
    color: "#1AB870",
    bg: "#E8FAF1",
    fields: ["Operator", "Cell Computer", "Tenant Details", "Validation Rules"],
  },
  {
    id: "econnect",
    name: "econnect",
    desc: "Real-time data exchange platform connecting parking systems with third-party apps and city platforms.",
    icon: "🔗",
    color: "#7C3AED",
    bg: "#EDE9FE",
    fields: ["Operator", "API Configuration", "Data Feeds", "Webhooks"],
  },
  {
    id: "eaccess",
    name: "eaccess",
    desc: "Access control solution for barriers, gates, and ANPR cameras — manages entry and exit permissions.",
    icon: "🔐",
    color: "#F4A136",
    bg: "#FEF3E8",
    fields: ["Operator", "Access Points", "Permissions", "Hardware Config"],
  },
];

function Step0({ data, setData }) {
  return (
    <div className="slide-in">
      <div style={{ marginBottom: 20, padding: "12px 16px", background: "var(--blue-pale)", border: "1px solid var(--blue-mid)", borderRadius: 8, fontSize: 13, color: "var(--blue)" }}>
        Select the <strong>entervo smart</strong> product you want to onboard. The wizard steps will adapt based on your selection.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {PRODUCTS.map(p => (
          <div key={p.id}
            onClick={() => setData({ ...data, product: p.id, productName: p.name })}
            style={{
              border: `2px solid ${data.product === p.id ? p.color : "var(--gray-200)"}`,
              borderRadius: 12,
              padding: "20px 22px",
              cursor: "pointer",
              transition: "all 0.15s",
              background: data.product === p.id ? p.bg : "white",
              boxShadow: data.product === p.id ? `0 0 0 4px ${p.color}18` : "var(--shadow-sm)",
            }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, border: `1px solid ${p.color}30` }}>
                {p.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>{p.name}</div>
                  {data.product === p.id && (
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--gray-600)", lineHeight: 1.5, marginBottom: 12 }}>{p.desc}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {p.fields.map((f, i) => (
                    <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: p.bg, color: p.color, border: `1px solid ${p.color}30` }}>
                      {i + 1}. {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!data.product && (
        <div style={{ marginTop: 20, padding: "10px 16px", background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 12, color: "var(--gray-400)", textAlign: "center" }}>
          Please select a product above to continue
        </div>
      )}
    </div>
  );
}

// ─── WIZARD STEPS ─────────────────────────────────────────────────────────────
function Step1({ data, setData }) {
  const [errors, setErrors] = useState({});

  const validate = (field, val) => {
    const errs = { ...errors };
    if (field === "ip" && val && !/^\d{1,3}(\.\d{1,3}){3}$/.test(val)) errs.ip = "Must be a valid IPv4 address";
    else delete errs.ip;
    if (field === "port" && val && (isNaN(val) || val < 1 || val > 65535)) errs.port = "Port must be between 1 and 65535";
    else delete errs.port;
    setErrors(errs);
  };

  const f = (key) => ({
    value: data[key] || "",
    onChange: e => { setData({ ...data, [key]: e.target.value }); validate(key, e.target.value); },
    className: `form-input${errors[key] ? " error" : data[key] ? " valid" : ""}`
  });

  return (
    <div className="slide-in">
      <div className="notif-bar">
        <Icon name="zap" size={14} color="#B07800" />
        Fields marked with a red asterisk are required before you can advance to the next step.
      </div>
      <div className="form-grid">
        <Field label="Operator Name" required><input {...f("opName")} placeholder="e.g. Medway Hospital NHS Trust" /></Field>
        <Field label="Operator ID" hint="Assigned by S&B"><input {...f("opId")} placeholder="e.g. 49666" className={f("opId").className + " mono"} /></Field>
        <Field label="Operator Email" required><input {...f("opEmail")} type="email" placeholder="name@organisation.com" /></Field>
        <Field label="Technical Support Email"><input {...f("techEmail")} type="email" placeholder="it-support@organisation.com" /></Field>
        <Field label="Phone Number"><input {...f("phone")} placeholder="+44 1634 833 988" /></Field>
        <Field label="Parking System Version" hint="Minimum: V2R5M5"><input {...f("version")} placeholder="e.g. V3R0M4" className={f("version").className + " mono"} /></Field>
        <Field label="Static Public IP Address" required error={errors.ip} hint="External IP of the cell computer">
          <input {...f("ip")} placeholder="195.171.142.1" className={`form-input mono${errors.ip ? " error" : data.ip ? " valid" : ""}`} />
        </Field>
        <Field label="Communication Port" hint="Standard: 8443" error={errors.port}>
          <input {...f("port")} placeholder="8443" className={`form-input mono${errors.port ? " error" : data.port ? " valid" : ""}`} />
        </Field>
        <Field label="Operator Domain / URL" hint="IP:Port or domain name" span2>
          <input {...f("domain")} placeholder="204.96.89.10 or carpark.organisation.com" />
        </Field>
        <Field label="Operator Address" span2>
          <input {...f("address")} placeholder="Street, City, Country" />
        </Field>
      </div>
      <div style={{ marginTop: 18, display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
        <Toggle label="Cell reachable from outside network" sub="Confirm after testing the static IP" value={data.reachable} onChange={v => setData({ ...data, reachable: v })} />
        <Toggle label="Network communication forwarding set" sub="Port forwarding tested and confirmed" value={data.forwarding} onChange={v => setData({ ...data, forwarding: v })} />
      </div>
    </div>
  );
}

function Step2({ data, setData }) {
  const f = (key, extra = "") => ({
    value: data[key] || "",
    onChange: e => setData({ ...data, [key]: e.target.value }),
    className: `form-input${extra ? " " + extra : ""}${data[key] ? " valid" : ""}`
  });
  return (
    <div className="slide-in">
      <div className="form-grid">
        <Field label="Cell Computer ID" required hint="Numeric ID from entervo system">
          <input {...f("cellId", "mono")} placeholder="e.g. 4438" />
        </Field>
        <Field label="Cell Computer Name" hint="Display name shown in the frontend">
          <input {...f("cellName")} placeholder="e.g. MedwayHZR" />
        </Field>
        <Field label="Language Tag" required hint="ISO 639-1 + country code">
          <select className={`form-select${data.lang ? " valid" : ""}`} value={data.lang || ""} onChange={e => setData({ ...data, lang: e.target.value })}>
            <option value="">Select language…</option>
            <option>en-GB</option><option>en-US</option><option>de-DE</option><option>de-AT</option>
            <option>fr-FR</option><option>nl-NL</option><option>nl-BE</option><option>es-ES</option>
          </select>
        </Field>
        <Field label="Country" required>
          <select className={`form-select${data.country ? " valid" : ""}`} value={data.country || ""} onChange={e => setData({ ...data, country: e.target.value })}>
            <option value="">Select country…</option>
            <option value="GB">United Kingdom (GB)</option>
            <option value="DE">Germany (DE)</option>
            <option value="FR">France (FR)</option>
            <option value="NL">Netherlands (NL)</option>
            <option value="CH">Switzerland (CH)</option>
            <option value="AT">Austria (AT)</option>
          </select>
        </Field>
        <Field label="Currency Code" hint="ISO 4217">
          <select className={`form-select${data.currency ? " valid" : ""}`} value={data.currency || ""} onChange={e => setData({ ...data, currency: e.target.value })}>
            <option value="">Select currency…</option>
            <option>GBP</option><option>EUR</option><option>CHF</option><option>USD</option><option>CAD</option>
          </select>
        </Field>
        <Field label="Decimal Places in Currency">
          <input {...f("decimals", "mono")} placeholder="2" />
        </Field>
        <Field label="UI User ID" hint="Digits only">
          <input {...f("uiUserId", "mono")} placeholder="e.g. 98" />
        </Field>
        <Field label="UI User Password" hint="Max 9 chars, no @ or spaces">
          <input {...f("uiPassword", "mono")} type="password" placeholder="••••••••" />
        </Field>
        <Field label="Cashier Terminal Device ID">
          <input {...f("deviceId", "mono")} placeholder="e.g. 750" />
        </Field>
        <Field label="VAT Percentage" hint="Required for first roll-out in country">
          <input {...f("vat", "mono")} placeholder="e.g. 20" />
        </Field>
      </div>
      <div style={{ marginTop: 18, display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
        <Toggle label="LPR (Licence Plate Recognition)" value={data.lpr} onChange={v => setData({ ...data, lpr: v })} />
        <Toggle label="Barcode" value={data.barcode} onChange={v => setData({ ...data, barcode: v })} />
        <Toggle label="LFK (Long-range remote key fob)" value={data.lfk} onChange={v => setData({ ...data, lfk: v })} />
        <Toggle label="Free-flow system with late payment" value={data.freeflow} onChange={v => setData({ ...data, freeflow: v })} />
      </div>
    </div>
  );
}

function Step3({ data, setData }) {
  const facilities = data.facilities || [{ id: "", name: "", city: "", inpayEntry: 30, inpayPayment: 30 }];
  const update = (i, key, val) => {
    const f = [...facilities];
    f[i] = { ...f[i], [key]: val };
    setData({ ...data, facilities: f });
  };
  const addRow = () => setData({ ...data, facilities: [...facilities, { id: "", name: "", city: "", inpayEntry: 30, inpayPayment: 30 }] });
  const removeRow = (i) => setData({ ...data, facilities: facilities.filter((_, idx) => idx !== i) });

  return (
    <div className="slide-in">
      <div className="facility-header">
        <div className="facility-col-label">Facility ID</div>
        <div className="facility-col-label">Facility Name</div>
        <div className="facility-col-label">City</div>
        <div className="facility-col-label">InPay Entry</div>
        <div className="facility-col-label">InPay Pay</div>
        <div />
      </div>
      {facilities.map((fac, i) => (
        <div className="facility-row" key={i}>
          <input className="facility-input mono" placeholder="4439" value={fac.id} onChange={e => update(i, "id", e.target.value)} />
          <input className="facility-input" placeholder="Car Park A – Public" value={fac.name} onChange={e => update(i, "name", e.target.value)} />
          <input className="facility-input" placeholder="City" value={fac.city} onChange={e => update(i, "city", e.target.value)} />
          <input className="facility-input mono" placeholder="30 min" value={fac.inpayEntry} onChange={e => update(i, "inpayEntry", e.target.value)} />
          <input className="facility-input mono" placeholder="30 min" value={fac.inpayPayment} onChange={e => update(i, "inpayPayment", e.target.value)} />
          <button className="del-btn" onClick={() => removeRow(i)} title="Remove">×</button>
        </div>
      ))}
      <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={addRow}>
        <Icon name="plus" /> Add Facility
      </button>
      <div style={{ marginTop: 20, background: "var(--blue-pale)", border: "1px solid var(--blue-mid)", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "var(--blue)" }}>
        <strong>Bulk import:</strong> You can also upload a CSV file with all facility data. Each row should contain: Facility ID, Name, Address, City, InPay Entry (min), InPay Payment (min).
        <span style={{ marginLeft: 8, textDecoration: "underline", cursor: "pointer" }}>Upload CSV →</span>
      </div>
    </div>
  );
}

function Step4({ data, setData }) {
  const f = (key, extra = "") => ({
    value: data[key] || "",
    onChange: e => setData({ ...data, [key]: e.target.value }),
    className: `form-input${extra ? " " + extra : ""}${data[key] ? " valid" : ""}`
  });
  return (
    <div className="slide-in">
      <div className="form-grid" style={{ marginBottom: 20 }}>
        <Field label="Financial Information" hint="Printed on the payment receipt" span2>
          <input {...f("financialInfo", "mono")} placeholder="e.g. 654929496" />
        </Field>
        <Field label="Terms & Conditions URL">
          <input {...f("tocUrl")} placeholder="https://…" />
        </Field>
        <Field label="Tariff Class ID" hint="0 = standard tariff">
          <input {...f("tariff", "mono")} placeholder="0" />
        </Field>
      </div>
      <div style={{ marginBottom: 18, display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <Toggle label="Vouchers" value={data.vouchers} onChange={v => setData({ ...data, vouchers: v })} />
        <Toggle label="Prepayment" value={data.prepay} onChange={v => setData({ ...data, prepay: v })} />
        <Toggle label="Top-up" value={data.topup} onChange={v => setData({ ...data, topup: v })} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <div className="form-label" style={{ marginBottom: 10 }}>Payment Service Provider <span style={{ color: "var(--red)" }}>*</span></div>
        <div className="psp-grid">
          {PSP_LIST.map(p => (
            <div key={p.id} className={`psp-card${data.psp === p.id ? " selected" : ""}`} onClick={() => setData({ ...data, psp: p.id })}>
              <div className="psp-name">{p.name}</div>
              <div className="psp-tag">{p.tag}</div>
            </div>
          ))}
        </div>
      </div>
      {data.psp && (
        <div className="slide-in" style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 8, padding: "18px 20px", marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 14 }}>
            {PSP_LIST.find(p => p.id === data.psp)?.name} — Configuration
          </div>
          <div className="form-grid">
            <Field label="Merchant ID" required><input {...f("pspMid", "mono")} placeholder="MID-xxxxx" /></Field>
            <Field label="Terminal ID"><input {...f("pspTid", "mono")} placeholder="TID-xxxxx" /></Field>
            <Field label="API Key / Client ID"><input {...f("pspKey", "mono")} placeholder="••••••••••••" type="password" /></Field>
            <Field label="API Secret"><input {...f("pspSecret", "mono")} placeholder="••••••••••••" type="password" /></Field>
          </div>
          <div style={{ marginTop: 14, display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr" }}>
            {["Visa", "Mastercard", "Apple Pay", "Google Pay", "PayPal", "SEPA"].map(pm => (
              <Toggle key={pm} label={pm} value={data[`pm_${pm}`]} onChange={v => setData({ ...data, [`pm_${pm}`]: v })} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ─── STEP 5: SALES APPROVAL ───────────────────────────────────────────────────
function Step5Sales({ data }) {
  const [approved, setApproved] = useState(data.salesApproved || false);
  return (
    <div className="slide-in">
      <div style={{ marginBottom: 20, padding: "12px 16px", background: "#FFF0F6", border: "1px solid #F5A7C7", borderRadius: 8, fontSize: 13, color: "#C0185A" }}>
        <strong>Sales Approval Required</strong> — Before submitting for technical review, the Sales team must confirm that the customer payment has been received.
      </div>
      <div style={{ background: "white", border: "1.5px solid var(--gray-200)", borderRadius: 12, padding: "24px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FFF0F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>💳</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>Payment Confirmation</div>
            <div style={{ fontSize: 12, color: "var(--gray-600)", marginTop: 2 }}>Assigned to: <strong>Sales Team</strong> · Status: {approved ? <span style={{ color: "var(--green)", fontWeight: 700 }}>✓ Confirmed</span> : <span style={{ color: "var(--amber)", fontWeight: 700 }}>⏳ Pending</span>}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          <div style={{ background: "var(--gray-50)", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", marginBottom: 4 }}>Customer</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{data.siteName || "Medway Hospital"}</div>
          </div>
          <div style={{ background: "var(--gray-50)", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", marginBottom: 4 }}>Product</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{data.productName || "smart web pay"}</div>
          </div>
          <div style={{ background: "var(--gray-50)", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", marginBottom: 4 }}>PSP</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{data.psp || "Fiserv"}</div>
          </div>
          <div style={{ background: "var(--gray-50)", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", marginBottom: 4 }}>Sales Contact</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>Anna Krüger</div>
          </div>
        </div>
        {!approved ? (
          <div style={{ padding: "14px 16px", background: "#FFF9EC", border: "1px solid #F4D78A", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, color: "#7A5000" }}>⏳ Waiting for Sales team to confirm payment receipt. An email notification has been sent to Anna Krüger.</div>
            <button onClick={() => setApproved(true)} style={{ marginLeft: 16, padding: "7px 16px", background: "#C0185A", color: "white", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font)" }}>
              Simulate Approval
            </button>
          </div>
        ) : (
          <div style={{ padding: "14px 16px", background: "#E8FAF1", border: "1px solid #A0E0C0", borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F7A40" }}>Payment confirmed by Sales</div>
              <div style={{ fontSize: 11, color: "var(--gray-600)", marginTop: 2 }}>Anna Krüger confirmed payment received · Just now</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Step5({ data }) {
  const pspLabel = PSP_LIST.find(p => p.id === data.psp)?.name || "Not selected";
  const facs = data.facilities || [];
  const allValid = data.opName && data.ip && data.port && data.psp;
  return (
    <div className="slide-in">
      {!allValid && (
        <div style={{ background: "#FEECEC", border: "1px solid #F0AAAA", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#B03030", display: "flex", gap: 10, alignItems: "center" }}>
          <Icon name="zap" size={14} color="#B03030" />
          Some required fields are incomplete. Please go back and fill them in before submitting.
        </div>
      )}
      <div className="review-section">
        <div className="review-section-title"><Icon name="building" size={14} /> Operator & Access</div>
        {[["Operator Name", data.opName || "—"],["Operator ID", data.opId || "—"],["Email", data.opEmail || "—"],["Phone", data.phone || "—"],["Static IP", data.ip || "—"],["Port", data.port || "—"],["Domain", data.domain || "—"],["Version", data.version || "—"]].map(([k,v], i) => (
          <div className="review-row" key={i}><div className="review-key">{k}</div><div className="review-val">{v}</div></div>
        ))}
      </div>
      <div className="review-section">
        <div className="review-section-title"><Icon name="server" size={14} /> Cell Computer</div>
        {[["Cell ID", data.cellId || "—"],["Cell Name", data.cellName || "—"],["Language", data.lang || "—"],["Country", data.country || "—"],["Currency", data.currency || "—"],["VAT %", data.vat || "—"],["LPR", data.lpr ? "Yes" : "No"],["Barcode", data.barcode ? "Yes" : "No"]].map(([k,v], i) => (
          <div className="review-row" key={i}><div className="review-key">{k}</div><div className="review-val">{v}</div></div>
        ))}
      </div>
      <div className="review-section">
        <div className="review-section-title"><Icon name="mapPin" size={14} /> Facilities ({facs.length})</div>
        {facs.length === 0 ? (
          <div className="review-row"><div className="review-key">No facilities added</div><div className="review-val">—</div></div>
        ) : facs.map((f, i) => (
          <div className="review-row" key={i}><div className="review-key">Facility {i+1}</div><div className="review-val">{f.id} — {f.name} ({f.city})</div></div>
        ))}
      </div>
      <div className="review-section">
        <div className="review-section-title"><Icon name="creditCard" size={14} /> Payment Provider</div>
        {[["PSP", pspLabel],["Merchant ID", data.pspMid || "—"],["Tariff Class", data.tariff || "0"],["Vouchers", data.vouchers ? "Yes" : "No"],["Prepayment", data.prepay ? "Yes" : "No"]].map(([k,v], i) => (
          <div className="review-row" key={i}><div className="review-key">{k}</div><div className="review-val">{v}</div></div>
        ))}
      </div>
      <div style={{ marginTop: 20, padding: "14px 18px", background: "var(--blue-pale)", border: "1px solid var(--blue-mid)", borderRadius: 8, fontSize: 13, color: "var(--blue)" }}>
        <input type="checkbox" id="declare" style={{ marginRight: 8 }} />
        <label htmlFor="declare">I confirm that all information provided is accurate and complete to the best of my knowledge.</label>
      </div>
    </div>
  );
}


// ─── ADMIN: TEMPLATES ────────────────────────────────────────────────────────
function AdminTemplates() {
  const [templates, setTemplates] = useState([
    { id: 1, title: "UK — Default", country: "GB", lang: "en-GB", currency: "GBP", vat: "20", psp: "Fiserv", status: "active", projects: 3 },
    { id: 2, title: "Germany — Default", country: "DE", lang: "de-DE", currency: "EUR", vat: "19", psp: "Worldline", status: "active", projects: 2 },
    { id: 3, title: "Netherlands — Default", country: "NL", lang: "nl-NL", currency: "EUR", vat: "21", psp: "CCV", status: "active", projects: 1 },
    { id: 4, title: "Switzerland — Default", country: "CH", lang: "de-CH", currency: "CHF", vat: "0", psp: "CCV", status: "draft", projects: 0 },
    { id: 5, title: "France — Default", country: "FR", lang: "fr-FR", currency: "EUR", vat: "20", psp: "Worldline", status: "draft", projects: 0 },
  ]);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newTpl, setNewTpl] = useState({ title: "", country: "", lang: "", currency: "", vat: "", psp: "", status: "draft" });

  const PSP_OPTIONS = ["Fiserv", "Planet", "TrustCommerce", "NMI", "CCV", "Worldline"];

  const saveNew = () => {
    if (!newTpl.title) return;
    setTemplates([...templates, { ...newTpl, id: Date.now(), projects: 0 }]);
    setShowNew(false);
    setNewTpl({ title: "", country: "", lang: "", currency: "", vat: "", psp: "", status: "draft" });
  };

  const toggleStatus = (id) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, status: t.status === "active" ? "draft" : "active" } : t));
  };

  const deleteTemplate = (id) => setTemplates(templates.filter(t => t.id !== id));

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="page-title">Onboarding Templates</div>
          <div className="page-desc">Pre-configured templates that speed up onboarding for common country/PSP combinations.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Template
        </button>
      </div>

      {/* New template form */}
      {showNew && (
        <div className="fade-in" style={{ background: "white", border: "2px solid var(--blue-bright)", borderRadius: 10, padding: 24, marginBottom: 24, boxShadow: "var(--shadow)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 18 }}>New Template</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            {[
              { label: "Template Name", key: "title", placeholder: "e.g. Belgium — Default" },
              { label: "Country Code", key: "country", placeholder: "e.g. BE" },
              { label: "Language Tag", key: "lang", placeholder: "e.g. nl-BE" },
              { label: "Currency (ISO 4217)", key: "currency", placeholder: "e.g. EUR" },
              { label: "VAT %", key: "vat", placeholder: "e.g. 21" },
            ].map(f => (
              <div key={f.key}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-800)", marginBottom: 5 }}>{f.label}</div>
                <input
                  style={{ width: "100%", padding: "8px 12px", border: "1.5px solid var(--gray-200)", borderRadius: 7, fontFamily: "var(--font)", fontSize: 13 }}
                  placeholder={f.placeholder}
                  value={newTpl[f.key]}
                  onChange={e => setNewTpl({ ...newTpl, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-800)", marginBottom: 5 }}>Default PSP</div>
              <select
                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid var(--gray-200)", borderRadius: 7, fontFamily: "var(--font)", fontSize: 13, background: "white" }}
                value={newTpl.psp}
                onChange={e => setNewTpl({ ...newTpl, psp: e.target.value })}
              >
                <option value="">Select PSP…</option>
                {PSP_OPTIONS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={saveNew}>Save Template</button>
            <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Template list */}
      <div style={{ display: "grid", gap: 10 }}>
        {templates.map(t => (
          <div key={t.id}
            style={{ background: "white", border: `1px solid ${selected === t.id ? "var(--blue-bright)" : "var(--gray-200)"}`, borderRadius: 10, padding: "16px 20px", boxShadow: "var(--shadow-sm)", cursor: "pointer", transition: "all 0.15s" }}
            onClick={() => setSelected(selected === t.id ? null : t.id)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--blue-pale)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {t.country === "GB" ? "🇬🇧" : t.country === "DE" ? "🇩🇪" : t.country === "NL" ? "🇳🇱" : t.country === "CH" ? "🇨🇭" : t.country === "FR" ? "🇫🇷" : "🌍"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{t.title}</div>
                  <span className={`badge ${t.status === "active" ? "badge-approved" : "badge-draft"}`}>{t.status === "active" ? "Active" : "Draft"}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 3, display: "flex", gap: 16 }}>
                  <span>🌐 {t.lang}</span>
                  <span>💱 {t.currency} · VAT {t.vat}%</span>
                  <span>💳 {t.psp}</span>
                  <span>📁 {t.projects} project{t.projects !== 1 ? "s" : ""}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                <button className="btn btn-secondary" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => toggleStatus(t.id)}>
                  {t.status === "active" ? "Deactivate" : "Activate"}
                </button>
                <button className="btn btn-ghost" style={{ fontSize: 11, padding: "5px 10px", color: "var(--red)" }} onClick={() => deleteTemplate(t.id)}>
                  Delete
                </button>
              </div>
            </div>

            {/* Expanded detail */}
            {selected === t.id && (
              <div className="fade-in" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--gray-100)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  { label: "Country", value: t.country },
                  { label: "Language", value: t.lang },
                  { label: "Currency", value: t.currency },
                  { label: "VAT", value: `${t.vat}%` },
                  { label: "Default PSP", value: t.psp },
                  { label: "Status", value: t.status },
                  { label: "Projects using", value: t.projects },
                  { label: "Vouchers default", value: "Off" },
                ].map((item, i) => (
                  <div key={i} style={{ background: "var(--gray-50)", borderRadius: 7, padding: "10px 14px" }}>
                    <div style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)", marginTop: 4 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN: VALIDATION RULES ─────────────────────────────────────────────────
function AdminRules() {
  const [rules, setRules] = useState([
    { id: 1, field: "IP Address", category: "Network", type: "Regex", pattern: "^\\d{1,3}(\\.\\d{1,3}){3}$", severity: "error", active: true, description: "Must be a valid IPv4 address" },
    { id: 2, field: "Communication Port", category: "Network", type: "Range", pattern: "1–65535", severity: "error", active: true, description: "Port must be within valid range" },
    { id: 3, field: "System Version", category: "System", type: "Min Version", pattern: "V2R5M5", severity: "error", active: true, description: "Minimum compatible version" },
    { id: 4, field: "Currency Code", category: "Localisation", type: "Enum (ISO 4217)", pattern: "EUR, GBP, CHF, USD…", severity: "error", active: true, description: "Must be a valid ISO 4217 code" },
    { id: 5, field: "Language Tag", category: "Localisation", type: "Regex", pattern: "^[a-z]{2}-[A-Z]{2}$", severity: "error", active: true, description: "Format: en-GB, de-DE, fr-FR…" },
    { id: 6, field: "UI Password", category: "Security", type: "Regex", pattern: "^[^@ ]{1,9}$", severity: "error", active: true, description: "Max 9 chars, no @ or spaces" },
    { id: 7, field: "Smart Validation Port", category: "Network", type: "Range", pattern: "8400–8450", severity: "warning", active: true, description: "Preferred range for smart validation" },
    { id: 8, field: "VAT Cross-check", category: "Finance", type: "Cross-field", pattern: "currency ↔ country", severity: "warning", active: false, description: "Warn if VAT doesn't match country norm" },
  ]);

  const [editing, setEditing] = useState(null);
  const CATEGORIES = ["Network", "System", "Localisation", "Security", "Finance"];
  const SEVERITIES = ["error", "warning"];

  const toggleActive = (id) => setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  const toggleSeverity = (id) => setRules(rules.map(r => r.id === id ? { ...r, severity: r.severity === "error" ? "warning" : "error" } : r));

  const catColors = { Network: "#E8F0FB", System: "#E8FAF1", Localisation: "#FEF9EC", Security: "#FEECEC", Finance: "#F3F0FC" };
  const catText = { Network: "var(--blue)", System: "var(--green)", Localisation: "#B07800", Security: "var(--red)", Finance: "#6B4FBB" };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="page-title">Validation Rules</div>
          <div className="page-desc">Configure field-level rules enforced during onboarding. Changes take effect immediately.</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ padding: "8px 14px", background: "#FEECEC", borderRadius: 7, fontSize: 12, color: "var(--red)", fontWeight: 600 }}>
            {rules.filter(r => r.severity === "error" && r.active).length} Hard rules
          </div>
          <div style={{ padding: "8px 14px", background: "#FEF9EC", borderRadius: 7, fontSize: 12, color: "#B07800", fontWeight: 600 }}>
            {rules.filter(r => r.severity === "warning" && r.active).length} Soft warnings
          </div>
        </div>
      </div>

      {/* Rules table */}
      <div style={{ background: "white", border: "1px solid var(--gray-200)", borderRadius: 10, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr 100px 90px 60px", padding: "10px 18px", background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
          {["Field", "Category", "Type", "Rule / Pattern", "Severity", "Status", ""].map((h, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</div>
          ))}
        </div>
        {rules.map((r, i) => (
          <div key={r.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr 100px 90px 60px", padding: "13px 18px", borderBottom: i < rules.length - 1 ? "1px solid var(--gray-100)" : "none", alignItems: "center", opacity: r.active ? 1 : 0.5, transition: "opacity 0.2s" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{r.field}</div>
              <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>{r.description}</div>
            </div>
            <div>
              <span style={{ background: catColors[r.category], color: catText[r.category], fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>{r.category}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--gray-600)" }}>{r.type}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--gray-600)", background: "var(--gray-50)", padding: "3px 8px", borderRadius: 5 }}>{r.pattern}</div>
            <div>
              <span
                style={{ cursor: "pointer", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: r.severity === "error" ? "#FEECEC" : "#FEF9EC", color: r.severity === "error" ? "var(--red)" : "#B07800" }}
                onClick={() => toggleSeverity(r.id)}
                title="Click to toggle severity"
              >
                {r.severity === "error" ? "⛔ Hard" : "⚠ Soft"}
              </span>
            </div>
            <div>
              <button
                style={{ background: r.active ? "#E8FAF1" : "var(--gray-100)", color: r.active ? "var(--green)" : "var(--gray-400)", border: "none", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                onClick={() => toggleActive(r.id)}
              >
                {r.active ? "● Active" : "○ Off"}
              </button>
            </div>
            <div>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", fontSize: 16, lineHeight: 1 }} title="Edit" onClick={() => setEditing(r.id === editing ? null : r.id)}>✏</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--blue-pale)", borderRadius: 8, fontSize: 12, color: "var(--blue)" }}>
        <strong>Tip:</strong> Hard rules block submission until fixed. Soft warnings allow the user to proceed with a confirmation. Click the severity badge to toggle between them.
      </div>
    </div>
  );
}

// ─── ADMIN: USERS ─────────────────────────────────────────────────────────────
function AdminUsers() {
  const [users, setUsers] = useState([
    { id: 1, name: "Kai Harperscheidt", email: "k.harperscheidt@scheidt-bachmann.de", role: "Admin", partner: "S&B HQ", status: "active", lastLogin: "Today, 09:14", initials: "KH" },
    { id: 2, name: "Marc Delvaux", email: "m.delvaux@scheidt-bachmann.de", role: "Project Manager", partner: "S&B UK", status: "active", lastLogin: "Today, 08:50", initials: "MD" },
    { id: 3, name: "Stefan Brandt", email: "s.brandt@scheidt-bachmann.de", role: "Project Manager", partner: "S&B DE", status: "active", lastLogin: "Yesterday", initials: "SB" },
    { id: 4, name: "Laura Meissner", email: "l.meissner@scheidt-bachmann.de", role: "Reviewer", partner: "S&B CH", status: "active", lastLogin: "2 days ago", initials: "LM" },
    { id: 5, name: "Joost van Dijk", email: "j.vandijk@scheidt-bachmann.de", role: "Partner", partner: "S&B NL", status: "active", lastLogin: "3 days ago", initials: "JV" },
    { id: 6, name: "James Hill", email: "j.hill@manchester-arena.co.uk", role: "Customer", partner: "Manchester Arena", status: "active", lastLogin: "1 week ago", initials: "JH" },
    { id: 7, name: "Medway IT", email: "medwayft.carparking@nhs.net", role: "Customer", partner: "Medway Hospital", status: "active", lastLogin: "2 weeks ago", initials: "MI" },
    { id: 8, name: "DevOps Bot", email: "devops@scheidt-bachmann.de", role: "DevOps", partner: "S&B HQ", status: "inactive", lastLogin: "Never", initials: "DB" },
    { id: 9, name: "Anna Krüger", email: "a.krueger@scheidt-bachmann.de", role: "Sales", partner: "S&B HQ", status: "active", lastLogin: "Today, 10:22", initials: "AK" },
    { id: 10, name: "Tom Verschueren", email: "t.verschueren@scheidt-bachmann.de", role: "Sales", partner: "S&B BE", status: "active", lastLogin: "Yesterday", initials: "TV" },
  ]);

  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState({ name: "", email: "", role: "Customer", partner: "" });
  const [filter, setFilter] = useState("all");

  const ROLES = ["Admin", "Project Manager", "Sales", "Reviewer", "DevOps", "Partner", "Customer"];
  const ROLE_COLORS = {
    Admin: { bg: "#F3F0FC", color: "#6B4FBB" },
    "Project Manager": { bg: "var(--blue-pale)", color: "var(--blue)" },
    Reviewer: { bg: "#E8FAF1", color: "var(--green)" },
    Sales: { bg: "#FFF0F6", color: "#C0185A" },
    DevOps: { bg: "#FEF9EC", color: "#B07800" },
    Partner: { bg: "#E8F0FB", color: "var(--blue-bright)" },
    Customer: { bg: "var(--gray-100)", color: "var(--gray-600)" },
  };

  const filtered = filter === "all" ? users : users.filter(u => u.role === filter);

  const sendInvite = () => {
    if (!invite.email || !invite.name) return;
    const initials = invite.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    setUsers([...users, { ...invite, id: Date.now(), status: "pending", lastLogin: "Never", initials }]);
    setShowInvite(false);
    setInvite({ name: "", email: "", role: "Customer", partner: "" });
  };

  const toggleUserStatus = (id) => setUsers(users.map(u => u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u));

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
            {[
              { label: "Full Name", key: "name", placeholder: "e.g. Anna Schmidt" },
              { label: "Email Address", key: "email", placeholder: "anna@company.com" },
              { label: "Organisation / Partner", key: "partner", placeholder: "e.g. S&B DE" },
            ].map(f => (
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
                onChange={e => setInvite({ ...invite, role: e.target.value })}
              >
                {ROLES.map(r => <option key={r}>{r}</option>)}
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
          { label: "Customers", value: users.filter(u => u.role === "Customer").length, color: "var(--blue)" },
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
        {["all", ...ROLES].map(r => (
          <button key={r} onClick={() => setFilter(r)}
            style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.12s",
              background: filter === r ? "var(--navy)" : "white",
              color: filter === r ? "white" : "var(--gray-600)",
              borderColor: filter === r ? "var(--navy)" : "var(--gray-200)" }}>
            {r === "all" ? "All Users" : r}
          </button>
        ))}
      </div>

      {/* User list */}
      <div style={{ background: "white", border: "1px solid var(--gray-200)", borderRadius: 10, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2.5fr 2fr 1.2fr 1.2fr 1.2fr 80px", padding: "10px 18px", background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
          {["User", "Email", "Role", "Organisation", "Last Login", ""].map((h, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</div>
          ))}
        </div>
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
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: ROLE_COLORS[u.role]?.bg, color: ROLE_COLORS[u.role]?.color }}>
                {u.role}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--gray-600)" }}>{u.partner}</div>
            <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{u.lastLogin}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "var(--gray-400)", fontWeight: 600, padding: "3px 6px", borderRadius: 5 }}
                onClick={() => toggleUserStatus(u.id)} title={u.status === "active" ? "Deactivate" : "Activate"}>
                {u.status === "active" ? "🔒" : "🔓"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN: SETTINGS ─────────────────────────────────────────────────────────
function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [cfg, setCfg] = useState({
    platformName: "entervo smart Onboarding",
    supportEmail: "onboarding-support@scheidt-bachmann.de",
    defaultPM: "k.harperscheidt@scheidt-bachmann.de",
    notifyOnSubmit: true,
    notifyOnApprove: true,
    notifyOnReject: true,
    requireDualApproval: false,
    autoExportOnApprove: false,
    sessionTimeout: "60",
    exportFormat: "json",
  });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Platform Settings</div>
        <div className="page-desc">Global configuration for the onboarding platform.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* General */}
        <div style={{ background: "white", border: "1px solid var(--gray-200)", borderRadius: 10, padding: 24, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid var(--gray-100)" }}>General</div>
          {[
            { label: "Platform Name", key: "platformName" },
            { label: "Support Email", key: "supportEmail" },
            { label: "Default Project Manager", key: "defaultPM" },
            { label: "Session Timeout (minutes)", key: "sessionTimeout" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-800)", marginBottom: 5 }}>{f.label}</div>
              <input
                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid var(--gray-200)", borderRadius: 7, fontFamily: "var(--font)", fontSize: 13 }}
                value={cfg[f.key]}
                onChange={e => setCfg({ ...cfg, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-800)", marginBottom: 5 }}>Default Export Format</div>
            <select
              style={{ width: "100%", padding: "8px 12px", border: "1.5px solid var(--gray-200)", borderRadius: 7, fontFamily: "var(--font)", fontSize: 13, background: "white" }}
              value={cfg.exportFormat}
              onChange={e => setCfg({ ...cfg, exportFormat: e.target.value })}
            >
              <option value="json">JSON (API ingestion)</option>
              <option value="excel">Excel (legacy)</option>
              <option value="pdf">PDF summary</option>
            </select>
          </div>
        </div>

        {/* Workflow & Notifications */}
        <div style={{ background: "white", border: "1px solid var(--gray-200)", borderRadius: 10, padding: 24, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid var(--gray-100)" }}>Workflow & Notifications</div>
          {[
            { label: "Notify reviewer on new submission", key: "notifyOnSubmit", sub: "Email sent to assigned reviewer" },
            { label: "Notify submitter on approval", key: "notifyOnApprove", sub: "Confirmation email to customer/partner" },
            { label: "Notify submitter on rejection", key: "notifyOnReject", sub: "Email with reviewer comments" },
            { label: "Require dual approval", key: "requireDualApproval", sub: "Two S&B reviewers must approve" },
            { label: "Auto-export on approval", key: "autoExportOnApprove", sub: "Automatically export JSON on approval" },
          ].map(s => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--gray-50)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--navy)" }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "var(--gray-400)" }}>{s.sub}</div>
              </div>
              <button
                style={{ width: 38, height: 22, borderRadius: 11, border: "none", background: cfg[s.key] ? "var(--blue-bright)" : "var(--gray-200)", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
                onClick={() => setCfg({ ...cfg, [s.key]: !cfg[s.key] })}
              >
                <div style={{ position: "absolute", top: 3, left: cfg[s.key] ? 19 : 3, width: 16, height: 16, background: "white", borderRadius: "50%", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </button>
            </div>
          ))}
        </div>

        {/* Audit Log */}
        <div style={{ background: "white", border: "1px solid var(--gray-200)", borderRadius: 10, padding: 24, boxShadow: "var(--shadow-sm)", gridColumn: "span 2" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid var(--gray-100)" }}>Recent Audit Log</div>
          <div style={{ display: "grid", gap: 8 }}>
            {[
              { time: "Today 09:14", user: "Kai Harperscheidt", action: "Approved", target: "Frankfurt Airport P3", color: "var(--green)" },
              { time: "Today 08:50", user: "Marc Delvaux", action: "Submitted", target: "Medway Hospital — Step 4", color: "var(--blue-bright)" },
              { time: "Yesterday 16:32", user: "Laura Meissner", action: "Requested correction", target: "Geneva Centre Mall", color: "var(--amber)" },
              { time: "Yesterday 11:05", user: "Stefan Brandt", action: "Created project", target: "Frankfurt Airport P3", color: "var(--blue)" },
              { time: "2 days ago", user: "Kai Harperscheidt", action: "Updated rule", target: "Smart Validation Port range", color: "var(--gray-400)" },
            ].map((log, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "130px 160px 160px 1fr", gap: 12, padding: "8px 12px", background: "var(--gray-50)", borderRadius: 7, alignItems: "center" }}>
                <div style={{ fontSize: 11, color: "var(--gray-400)", fontFamily: "var(--mono)" }}>{log.time}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--navy)" }}>{log.user}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: log.color }}>{log.action}</div>
                <div style={{ fontSize: 12, color: "var(--gray-600)" }}>{log.target}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
        <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        <button className="btn btn-secondary">Reset to Defaults</button>
        {saved && <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 600 }}>✓ Settings saved successfully</span>}
      </div>
    </div>
  );
}

// ─── PATCH MANAGEMENT APP ────────────────────────────────────────────────────
const PATCH_CSS = `
  @keyframes patchFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes patchPulse { 0%,100%{ box-shadow: 0 0 0 0 rgba(26,184,112,0.5); } 70%{ box-shadow: 0 0 0 8px rgba(26,184,112,0); } }

  .patch-fade { animation: patchFadeIn 0.3s ease both; }

  .patch-app { display: flex; width: 100vw; height: 100vh; overflow: hidden; font-family: 'DM Sans', sans-serif; background: #F7F9FC; }

  /* ── Patch Sidebar ── */
  .patch-sidebar { width: 240px; min-width: 240px; background: #0B1F3A; display: flex; flex-direction: column; overflow-y: auto; flex-shrink: 0; }
  .patch-sidebar-logo { padding: 22px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; gap: 10px; }
  .patch-sidebar-icon { width: 34px; height: 34px; background: linear-gradient(135deg,#1AB870,#0D7A46); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .patch-sidebar-brand { color: #fff; font-size: 14px; font-weight: 700; letter-spacing: -0.2px; }
  .patch-sidebar-sub { color: rgba(255,255,255,0.38); font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 1px; }
  .patch-nav-section { padding: 18px 12px 6px; }
  .patch-nav-label { color: rgba(255,255,255,0.3); font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; padding: 0 8px; margin-bottom: 4px; }
  .patch-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 7px; cursor: pointer; color: rgba(255,255,255,0.55); font-size: 13px; font-weight: 500; transition: all 0.14s; text-decoration: none; }
  .patch-nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.85); }
  .patch-nav-item.active { background: #1AB870; color: #fff; }
  .patch-nav-item.active:hover { background: #18A864; }
  .patch-nav-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; background: rgba(255,255,255,0.3); }
  .patch-nav-item.active .patch-nav-dot { background: rgba(255,255,255,0.9); }
  .patch-nav-badge { margin-left: auto; background: #E84040; color: #fff; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; }

  /* ── Patch Main ── */
  .patch-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .patch-topbar { height: 60px; background: #fff; border-bottom: 1px solid #DAE2EE; display: flex; align-items: center; padding: 0 28px; gap: 16px; flex-shrink: 0; }
  .patch-topbar-title { font-size: 16px; font-weight: 700; color: #0B1F3A; flex: 1; }
  .patch-content { flex: 1; overflow-y: auto; padding: 28px 32px; }

  /* ── Hero Banner ── */
  .patch-hero { background: linear-gradient(135deg, #0B1F3A 0%, #1152A0 55%, #1A6FD4 100%); border-radius: 16px; padding: 40px 44px; margin-bottom: 28px; position: relative; overflow: hidden; display: flex; gap: 40px; align-items: center; }
  .patch-hero::after { content: ''; position: absolute; top: -60px; right: -60px; width: 280px; height: 280px; border-radius: 50%; background: rgba(255,255,255,0.04); pointer-events: none; }
  .patch-hero-left { flex: 1; position: relative; z-index: 1; }
  .patch-hero-right { position: relative; z-index: 1; flex-shrink: 0; }
  .patch-hero-live { display: inline-flex; align-items: center; gap: 7px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 100px; padding: 5px 14px; color: #5DE8A8; font-size: 11px; font-weight: 700; letter-spacing: 0.6px; margin-bottom: 16px; }
  .patch-hero-live-dot { width: 8px; height: 8px; border-radius: 50%; background: #1AB870; animation: patchPulse 2s infinite; flex-shrink: 0; }
  .patch-hero-h1 { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .patch-hero-h2 { font-size: 30px; font-weight: 800; color: #fff; letter-spacing: -0.8px; line-height: 1.15; margin-bottom: 10px; }
  .patch-hero-h2 em { font-style: normal; color: #5DE8A8; }
  .patch-hero-desc { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.65; max-width: 440px; margin-bottom: 22px; }
  .patch-hero-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #0B1F3A; padding: 11px 24px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; transition: all 0.16s; }
  .patch-hero-btn:hover { background: #E8F0FB; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
  .patch-hero-shield { width: 120px; height: 120px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; }

  /* ── Stats ── */
  .patch-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .patch-stat-card { background: #fff; border: 1px solid #DAE2EE; border-radius: 12px; padding: 20px 22px; box-shadow: 0 1px 3px rgba(11,31,58,0.06); }
  .patch-stat-label { font-size: 11px; font-weight: 700; color: #95A3B8; text-transform: uppercase; letter-spacing: 0.8px; }
  .patch-stat-value { font-size: 32px; font-weight: 800; color: #0B1F3A; letter-spacing: -1px; margin-top: 6px; }
  .patch-stat-sub { font-size: 12px; margin-top: 4px; }

  /* ── Service Tiers ── */
  .patch-section-title { font-size: 17px; font-weight: 800; color: #0B1F3A; letter-spacing: -0.3px; margin-bottom: 16px; }
  .patch-service-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
  .patch-service-card { background: #fff; border: 2px solid #DAE2EE; border-radius: 14px; padding: 26px 24px; position: relative; overflow: hidden; transition: all 0.16s; }
  .patch-service-card:hover { border-color: #C2D6F0; box-shadow: 0 4px 16px rgba(11,31,58,0.10); }
  .patch-service-card.popular { border-color: #1AB870; }
  .patch-service-card.popular:hover { box-shadow: 0 4px 20px rgba(26,184,112,0.18); }
  .patch-popular-badge { position: absolute; top: 16px; right: 16px; background: #1AB870; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.5px; }
  .patch-service-title { font-size: 17px; font-weight: 800; color: #0B1F3A; margin-bottom: 16px; }
  .patch-check-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 13px; color: #5A6880; }
  .patch-check-icon { width: 20px; height: 20px; border-radius: 50%; background: #E8FAF1; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .patch-check-icon svg { width: 11px; height: 11px; stroke: #1AB870; stroke-width: 3; }
  .patch-service-btn { margin-top: 20px; width: 100%; padding: 11px; border-radius: 9px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.14s; }
  .patch-service-btn.basic { border: 2px solid #DAE2EE; background: #fff; color: #0B1F3A; }
  .patch-service-btn.basic:hover { border-color: #C2D6F0; background: #F7F9FC; }
  .patch-service-btn.premium { border: none; background: linear-gradient(135deg, #1AB870, #0D8A53); color: #fff; }
  .patch-service-btn.premium:hover { background: linear-gradient(135deg, #22D982, #1AB870); box-shadow: 0 4px 14px rgba(26,184,112,0.35); }

  /* ── 5-Stage Process ── */
  .patch-process-wrap { background: #fff; border: 1px solid #DAE2EE; border-radius: 14px; padding: 28px 24px; margin-bottom: 28px; box-shadow: 0 1px 3px rgba(11,31,58,0.06); }
  .patch-process-title { font-size: 17px; font-weight: 800; color: #0B1F3A; text-align: center; margin-bottom: 28px; letter-spacing: -0.3px; }
  .patch-stages { display: grid; grid-template-columns: repeat(5,1fr); position: relative; }
  .patch-stages-line { position: absolute; top: 30px; left: 10%; right: 10%; height: 2px; background: linear-gradient(to right, #1AB870, #1A6FD4); }
  .patch-stage { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 0 6px; position: relative; z-index: 1; }
  .patch-stage-circle { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; border: 3px solid #fff; box-shadow: 0 3px 12px rgba(11,31,58,0.14); position: relative; }
  .patch-stage-num { position: absolute; top: -4px; right: -4px; width: 20px; height: 20px; background: #0B1F3A; color: #fff; border-radius: 50%; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }
  .patch-stage-name { font-size: 11px; font-weight: 800; color: #0B1F3A; text-transform: uppercase; letter-spacing: 0.7px; text-align: center; }
  .patch-stage-desc { font-size: 11px; color: #95A3B8; text-align: center; line-height: 1.4; }

  /* ── Bulletins Table ── */
  .patch-table-card { background: #fff; border: 1px solid #DAE2EE; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(11,31,58,0.06); }
  .patch-table-head { display: grid; grid-template-columns: 2.5fr 1fr 1fr 1fr 1fr 90px; padding: 11px 20px; background: #F7F9FC; border-bottom: 1px solid #DAE2EE; }
  .patch-th { font-size: 11px; font-weight: 700; color: #95A3B8; text-transform: uppercase; letter-spacing: 0.8px; }
  .patch-table-row { display: grid; grid-template-columns: 2.5fr 1fr 1fr 1fr 1fr 90px; padding: 15px 20px; border-bottom: 1px solid #EEF2F8; align-items: center; transition: background 0.12s; cursor: pointer; }
  .patch-table-row:last-child { border-bottom: none; }
  .patch-table-row:hover { background: #F7F9FC; }
  .patch-sev { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .sev-critical { background: #FEECEC; color: #B03030; }
  .sev-high { background: #FEF3E8; color: #C07000; }
  .sev-medium { background: #EBF4FF; color: #1152A0; }
  .sev-low { background: #EEF2F8; color: #5A6880; }
  .patch-pill { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .pp-pending { background: #FEF9EC; color: #7A5000; }
  .pp-deployed { background: #E8FAF1; color: #0F7A40; }
  .pp-testing { background: #EBF4FF; color: #1152A0; }
  .pp-scheduled { background: #F3E8FF; color: #5B21B6; }

  /* ── Buttons (patch-scoped) ── */
  .p-btn { display: inline-flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 8px; font-family: 'DM Sans',sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.14s; }
  .p-btn-primary { background: #1AB870; color: #fff; }
  .p-btn-primary:hover { background: #14A060; }
  .p-btn-secondary { background: #EEF2F8; color: #2C3A4F; border: 1px solid #DAE2EE; }
  .p-btn-secondary:hover { background: #DAE2EE; }
  .p-btn-sm { padding: 5px 12px; font-size: 12px; }

  /* ── Page chrome ── */
  .patch-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
  .patch-page-title { font-size: 22px; font-weight: 800; color: #0B1F3A; letter-spacing: -0.5px; }
  .patch-page-desc { font-size: 13px; color: #95A3B8; margin-top: 3px; }
`;

const PATCH_BULLETINS = [
  { id: "KB5034441", name: "Windows Server 2022 – Security Update", severity: "Critical", released: "Mar 12, 2025", systems: 14, status: "deployed", risk: "RCE" },
  { id: "KB5035845", name: "MS Edge Chromium – Zero-Day Fix", severity: "Critical", released: "Mar 10, 2025", systems: 8, status: "testing", risk: "XSS" },
  { id: "KB5033372", name: "SQL Server 2019 CU25 – Rollup", severity: "High", released: "Mar 05, 2025", systems: 3, status: "scheduled", risk: "DoS" },
  { id: "KB5028997", name: ".NET Framework 4.8 Update", severity: "Medium", released: "Feb 28, 2025", systems: 21, status: "deployed", risk: "EoP" },
  { id: "KB5032190", name: "Windows Defender Definitions", severity: "Low", released: "Mar 15, 2025", systems: 34, status: "deployed", risk: "Def" },
  { id: "KB5031364", name: "IIS Lockdown – CVE-2025-1441", severity: "High", released: "Mar 08, 2025", systems: 6, status: "pending", risk: "SSRF" },
];

function PatchApp({ onBack }) {
  const [patchView, setPatchView] = useState("dashboard");

  const CheckIcon = () => (
    <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="2,6 5,9 10,3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <>
      <style>{PATCH_CSS}</style>
      <div className="patch-app patch-fade">

        {/* Sidebar */}
        <aside className="patch-sidebar">
          <div className="patch-sidebar-logo">
            <div className="patch-sidebar-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <div className="patch-sidebar-brand">entervo</div>
              <div className="patch-sidebar-sub">Patch Management</div>
            </div>
          </div>

          <div className="patch-nav-section">
            <div className="patch-nav-label">Overview</div>
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "bulletins", label: "Patch Bulletins", badge: "2" },
              { id: "schedule", label: "Schedule" },
            ].map(item => (
              <div key={item.id} className={"patch-nav-item" + (patchView === item.id ? " active" : "")} onClick={() => setPatchView(item.id)}>
                <span className="patch-nav-dot" />
                {item.label}
                {item.badge && <span className="patch-nav-badge">{item.badge}</span>}
              </div>
            ))}
          </div>

          <div className="patch-nav-section">
            <div className="patch-nav-label">Services</div>
            {[
              { id: "basic", label: "Basic Service" },
              { id: "premium", label: "Premium Service" },
            ].map(item => (
              <div key={item.id} className={"patch-nav-item" + (patchView === item.id ? " active" : "")} onClick={() => setPatchView(item.id)}>
                <span className="patch-nav-dot" />
                {item.label}
              </div>
            ))}
          </div>

          <div className="patch-nav-section" style={{ marginTop: "auto" }}>
            <div className="patch-nav-item" onClick={onBack} style={{ color: "rgba(255,255,255,0.38)", marginTop: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              Back to Hub
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="patch-main">
          <div className="patch-topbar">
            <div className="patch-topbar-title">
              {patchView === "dashboard" && "Patch Dashboard"}
              {patchView === "bulletins" && "Patch Bulletins"}
              {patchView === "schedule" && "Patch Schedule"}
              {patchView === "basic" && "Basic Service"}
              {patchView === "premium" && "Premium Service"}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="p-btn p-btn-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                Alerts
              </button>
              <button className="p-btn p-btn-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Run Patch Cycle
              </button>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#E8FAF1", color: "#1AB870", border: "2px solid #1AB870", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>KH</div>
            </div>
          </div>

          <div className="patch-content">

            {/* Dashboard / Services / Schedule */}
            {(patchView === "dashboard" || patchView === "basic" || patchView === "premium" || patchView === "schedule") && (
              <div className="patch-fade">

                {/* Hero Banner */}
                <div className="patch-hero">
                  <div className="patch-hero-left">
                    <div className="patch-hero-live">
                      <span className="patch-hero-live-dot" />
                      WSUS CONNECTED · LIVE
                    </div>
                    <div className="patch-hero-h1">Proactive Patch Management</div>
                    <div className="patch-hero-h2">Secure. Stable.<br /><em>Compliant.</em></div>
                    <div className="patch-hero-desc">Protecting your infrastructure from evolving cybersecurity threats through a systematic, multi-stage approach.</div>
                    <button className="patch-hero-btn" onClick={() => setPatchView("bulletins")}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1F3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      Explore Services
                    </button>
                  </div>
                  <div className="patch-hero-right">
                    <div className="patch-hero-shield">
                      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <polyline points="9,12 11,14 15,10" stroke="#1AB870" strokeWidth="2.5"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="patch-stat-grid">
                  <div className="patch-stat-card">
                    <div className="patch-stat-label">Patches Applied</div>
                    <div className="patch-stat-value">247</div>
                    <div className="patch-stat-sub" style={{ color: "#1AB870" }}>&#8593; 18 this month</div>
                  </div>
                  <div className="patch-stat-card">
                    <div className="patch-stat-label">Critical Pending</div>
                    <div className="patch-stat-value" style={{ color: "#E84040" }}>2</div>
                    <div className="patch-stat-sub" style={{ color: "#E84040" }}>&#9888; Immediate action</div>
                  </div>
                  <div className="patch-stat-card">
                    <div className="patch-stat-label">Systems Covered</div>
                    <div className="patch-stat-value">34</div>
                    <div className="patch-stat-sub" style={{ color: "#95A3B8" }}>Across 6 sites</div>
                  </div>
                  <div className="patch-stat-card">
                    <div className="patch-stat-label">Compliance Score</div>
                    <div className="patch-stat-value" style={{ color: "#1AB870" }}>94%</div>
                    <div className="patch-stat-sub" style={{ color: "#1AB870" }}>&#8593; 3% vs last cycle</div>
                  </div>
                </div>

                {/* Service Tiers */}
                <div className="patch-section-title">Our Service Tiers</div>
                <div className="patch-service-grid">
                  <div className="patch-service-card">
                    <div className="patch-service-title">Basic Service</div>
                    {["Monthly Patch Bulletins", "Vulnerability Notifications", "Risk Assessment"].map(f => (
                      <div key={f} className="patch-check-row">
                        <div className="patch-check-icon"><CheckIcon /></div>
                        {f}
                      </div>
                    ))}
                    <button className="patch-service-btn basic">Learn More</button>
                  </div>
                  <div className="patch-service-card popular">
                    <div className="patch-popular-badge">MOST POPULAR</div>
                    <div className="patch-service-title">Premium Service</div>
                    {["Active Patch Deployment", "Automated Workflows", "Compatibility Testing", "Comprehensive Monthly Reports"].map(f => (
                      <div key={f} className="patch-check-row">
                        <div className="patch-check-icon"><CheckIcon /></div>
                        {f}
                      </div>
                    ))}
                    <button className="patch-service-btn premium">Learn More</button>
                  </div>
                </div>

                {/* 5-Stage Process */}
                <div className="patch-process-wrap">
                  <div className="patch-process-title">The entervo 5-Stage Patching Process</div>
                  <div className="patch-stages" style={{ position: "relative" }}>
                    <div className="patch-stages-line" />
                    {[
                      { num: 1, icon: "&#128269;", color: "#E8F0FB", name: "Assessment", desc: "Identifying Microsoft security updates." },
                      { num: 2, icon: "&#11015;", color: "#E8FAF1", name: "Acquisition", desc: "Secure sourcing via WSUS over the Internet." },
                      { num: 3, icon: "&#129514;", color: "#FEF3E8", name: "Testing", desc: "Rigorous sandbox environment verification." },
                      { num: 4, icon: "&#9881;", color: "#EDE9FE", name: "Deployment", desc: "Automated, scheduled rollouts to endpoints." },
                      { num: 5, icon: "&#128202;", color: "#E8FAF1", name: "Monitoring", desc: "Continuous health checks and incident response." },
                    ].map(s => (
                      <div key={s.num} className="patch-stage">
                        <div style={{ position: "relative" }}>
                          <div className="patch-stage-circle" style={{ background: s.color }} dangerouslySetInnerHTML={{ __html: s.icon }} />
                          <div className="patch-stage-num">{s.num}</div>
                        </div>
                        <div className="patch-stage-name">{s.name}</div>
                        <div className="patch-stage-desc">{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Bulletins */}
            {patchView === "bulletins" && (
              <div className="patch-fade">
                <div className="patch-page-header">
                  <div>
                    <div className="patch-page-title">Patch Bulletins</div>
                    <div className="patch-page-desc">Microsoft security updates sourced via WSUS — reviewed and staged for deployment.</div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="p-btn p-btn-secondary">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Sync WSUS
                    </button>
                    <button className="p-btn p-btn-primary">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Deploy Selected
                    </button>
                  </div>
                </div>
                <div className="patch-table-card">
                  <div className="patch-table-head">
                    {["Bulletin / Name", "Severity", "Released", "Systems", "Status", "Action"].map(h => (
                      <div key={h} className="patch-th">{h}</div>
                    ))}
                  </div>
                  {PATCH_BULLETINS.map(b => (
                    <div key={b.id} className="patch-table-row">
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0B1F3A" }}>{b.name}</div>
                        <div style={{ fontSize: 11, color: "#95A3B8", fontFamily: "monospace", marginTop: 2 }}>{b.id} · {b.risk}</div>
                      </div>
                      <div><span className={"patch-sev sev-" + b.severity.toLowerCase()}>{b.severity}</span></div>
                      <div style={{ fontSize: 13, color: "#5A6880" }}>{b.released}</div>
                      <div style={{ fontSize: 13, color: "#0B1F3A", fontWeight: 600 }}>{b.systems} endpoints</div>
                      <div><span className={"patch-pill pp-" + b.status}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span></div>
                      <div>
                        <button className="p-btn p-btn-secondary p-btn-sm">
                          {b.status === "pending" ? "Deploy" : b.status === "testing" ? "Approve" : "View"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}

// ─── LANDING / HUB PAGE ───────────────────────────────────────────────────────
const LANDING_CSS = `
  @keyframes hubFadeIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes hubPulse { 0%,100% { opacity:1; box-shadow: 0 0 0 0 rgba(26,184,112,0.4); } 50% { opacity:0.7; box-shadow: 0 0 0 6px rgba(26,184,112,0); } }

  .hub-root {
    width: 100vw; height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: #0B1F3A;
    overflow: hidden; position: relative;
    font-family: 'DM Sans', sans-serif;
  }
  .hub-bg-glow {
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 70% 55% at 25% 15%, rgba(26,111,212,0.32) 0%, transparent 60%),
      radial-gradient(ellipse 55% 45% at 78% 80%, rgba(26,184,112,0.22) 0%, transparent 55%);
  }
  .hub-grid-bg {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 56px 56px;
  }
  .hub-inner { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; width: 100%; padding: 0 24px; }

  .hub-logo { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; animation: hubFadeIn 0.5s ease both; }
  .hub-logo-icon { width: 46px; height: 46px; background: linear-gradient(135deg, #1A6FD4, #0B4FA8); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(26,111,212,0.4); border: 1px solid rgba(255,255,255,0.15); }
  .hub-logo-text { color: #FFFFFF; font-size: 20px; font-weight: 800; letter-spacing: -0.4px; }
  .hub-logo-sub { color: rgba(255,255,255,0.42); font-size: 12px; font-weight: 500; margin-top: 2px; }

  .hub-pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.09); border: 1px solid rgba(255,255,255,0.16); border-radius: 100px; padding: 6px 16px; color: rgba(255,255,255,0.65); font-size: 12px; font-weight: 600; letter-spacing: 0.4px; margin-bottom: 18px; animation: hubFadeIn 0.5s 0.05s ease both; }
  .hub-pill-dot { width: 7px; height: 7px; border-radius: 50%; background: #1AB870; animation: hubPulse 2.5s infinite; flex-shrink: 0; }

  .hub-headline { font-size: 46px; font-weight: 800; color: #FFFFFF; letter-spacing: -1.5px; text-align: center; line-height: 1.1; margin-bottom: 12px; animation: hubFadeIn 0.5s 0.1s ease both; }
  .hub-headline em { font-style: normal; color: #5DE8A8; }
  .hub-sub { font-size: 16px; color: rgba(255,255,255,0.45); text-align: center; margin-bottom: 48px; line-height: 1.65; max-width: 380px; animation: hubFadeIn 0.5s 0.15s ease both; }

  .hub-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 740px; width: 100%; animation: hubFadeIn 0.5s 0.2s ease both; }

  .hub-card {
    background: rgba(255,255,255,0.07);
    border: 1.5px solid rgba(255,255,255,0.13);
    border-radius: 22px; padding: 30px 26px;
    cursor: pointer; position: relative; overflow: hidden;
    transition: transform 0.28s cubic-bezier(.25,.46,.45,.94), box-shadow 0.28s, border-color 0.28s, background 0.28s;
  }
  .hub-card:hover { transform: translateY(-8px); box-shadow: 0 30px 64px rgba(0,0,0,0.5); }
  .hub-card.onboarding:hover { border-color: rgba(26,111,212,0.6); background: rgba(26,111,212,0.10); }
  .hub-card.patch:hover { border-color: rgba(26,184,112,0.55); background: rgba(26,184,112,0.08); }
  .hub-card:hover .hub-card-btn { opacity: 1; transform: translateY(0px); }
  .hub-card:hover .hub-card-arrow-icon { transform: translateX(4px); }

  .hub-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  .hub-card-icon { width: 58px; height: 58px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .hub-card-icon.blue { background: linear-gradient(135deg, #1A6FD4 0%, #0D4A99 100%); box-shadow: 0 8px 22px rgba(26,111,212,0.45); }
  .hub-card-icon.green { background: linear-gradient(135deg, #1AB870 0%, #0D7A46 100%); box-shadow: 0 8px 22px rgba(26,184,112,0.45); }
  .hub-module-badge { font-size: 10px; font-weight: 800; letter-spacing: 0.8px; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
  .hub-module-badge.blue { background: rgba(26,111,212,0.22); color: #8ECAFF; border: 1px solid rgba(26,111,212,0.3); }
  .hub-module-badge.green { background: rgba(26,184,112,0.22); color: #5DE8A8; border: 1px solid rgba(26,184,112,0.3); }

  .hub-card-title { font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.4px; margin-bottom: 8px; }
  .hub-card-desc { font-size: 13.5px; color: rgba(255,255,255,0.50); line-height: 1.65; margin-bottom: 22px; }

  .hub-divider { height: 1px; background: rgba(255,255,255,0.08); margin-bottom: 18px; }
  .hub-card-features { display: flex; flex-direction: column; gap: 10px; margin-bottom: 22px; }
  .hub-card-feat { display: flex; align-items: center; gap: 10px; font-size: 13px; color: rgba(255,255,255,0.72); font-weight: 500; }
  .hub-feat-check { width: 20px; height: 20px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; font-weight: 800; }
  .hub-feat-check.blue { background: rgba(26,111,212,0.28); color: #7DBBF8; }
  .hub-feat-check.green { background: rgba(26,184,112,0.28); color: #5DE8A8; }

  .hub-card-btn {
    width: 100%; padding: 13px 20px; border-radius: 12px; border: none;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.22s; opacity: 0.82; transform: translateY(3px);
  }
  .hub-card-btn.blue { background: linear-gradient(135deg, #1A6FD4, #1152A0); color: #fff; }
  .hub-card-btn.blue:hover { background: linear-gradient(135deg, #2280E8, #1A6FD4); box-shadow: 0 4px 16px rgba(26,111,212,0.5); }
  .hub-card-btn.green { background: linear-gradient(135deg, #1AB870, #0D8A53); color: #fff; }
  .hub-card-btn.green:hover { background: linear-gradient(135deg, #22D982, #1AB870); box-shadow: 0 4px 16px rgba(26,184,112,0.5); }
  .hub-card-arrow-icon { transition: transform 0.22s; display: inline-block; }

  .hub-footer { margin-top: 36px; font-size: 12px; color: rgba(255,255,255,0.22); animation: hubFadeIn 0.5s 0.3s ease both; }
`;

function LandingHub({ onSelect }) {
  return (
    <>
      <style>{LANDING_CSS}</style>
      <div className="hub-root">
        <div className="hub-bg-glow" />
        <div className="hub-grid-bg" />

        <div className="hub-inner">
          {/* Logo */}
          <div className="hub-logo">
            <div className="hub-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <div className="hub-logo-text">entervo smart</div>
              <div className="hub-logo-sub">IT Security Platform</div>
            </div>
          </div>

          {/* Status pill */}
          <div className="hub-pill">
            <span className="hub-pill-dot" />
            Platform v2.4 · All systems operational
          </div>

          {/* Headline */}
          <div className="hub-headline">Welcome to the<br /><em>entervo</em> Platform Hub</div>
          <div className="hub-sub">Choose a module below to get started with your workflow.</div>

          {/* Cards */}
          <div className="hub-cards">
            {/* Onboarding */}
            <div className="hub-card onboarding" onClick={() => onSelect("onboarding")}>
              <div className="hub-card-header">
                <div className="hub-card-icon blue">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <span className="hub-module-badge blue">Module 01</span>
              </div>
              <div className="hub-card-title">Onboarding</div>
              <div className="hub-card-desc">Manage the full lifecycle of partner onboarding — from product selection through S&B review and approval.</div>
              <div className="hub-divider" />
              <div className="hub-card-features">
                {["Multi-step wizard workflow", "Review queue & approvals", "Partner & PSP management"].map(f => (
                  <div key={f} className="hub-card-feat">
                    <div className="hub-feat-check blue">✓</div>
                    {f}
                  </div>
                ))}
              </div>
              <button className="hub-card-btn blue" onClick={(e) => { e.stopPropagation(); onSelect("onboarding"); }}>
                Open Onboarding <span className="hub-card-arrow-icon">→</span>
              </button>
            </div>

            {/* Patch */}
            <div className="hub-card patch" onClick={() => onSelect("patch")}>
              <div className="hub-card-header">
                <div className="hub-card-icon green">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <span className="hub-module-badge green">Module 02</span>
              </div>
              <div className="hub-card-title">Patch Management</div>
              <div className="hub-card-desc">Proactive patch management for entervo systems — secure, stable, and compliant through a 5-stage process.</div>
              <div className="hub-divider" />
              <div className="hub-card-features">
                {["5-stage patching pipeline", "WSUS-based acquisition", "Automated deployment & monitoring"].map(f => (
                  <div key={f} className="hub-card-feat">
                    <div className="hub-feat-check green">✓</div>
                    {f}
                  </div>
                ))}
              </div>
              <button className="hub-card-btn green" onClick={(e) => { e.stopPropagation(); onSelect("patch"); }}>
                Open Patch Management <span className="hub-card-arrow-icon">→</span>
              </button>
            </div>
          </div>

          <div className="hub-footer">© 2025 Scheidt & Bachmann GmbH · entervo IT Security</div>
        </div>
      </div>
    </>
  );
}

// ─── ROOT WRAPPER ─────────────────────────────────────────────────────────────
function OnboardingApp({ onBack }) {
  const [view, setView] = useState("dashboard");
  const [activeProject, setActiveProject] = useState(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState({
    ip: "195.171.142.1", port: "8443", opName: "Medway Hospital",
    version: "V3R0M4", opEmail: "medwayft.carparking@nhs.net",
    domain: "204.96.89.10", opId: "49666", lang: "en-GB",
    country: "GB", currency: "GBP", cellId: "4438", vat: "20",
    lpr: true, barcode: true, reachable: true, forwarding: true,
    psp: "fiserv", pspMid: "FIS-MED-001", tariff: "0",
    facilities: [
      { id: "4439", name: "Car Park D – Public", city: "Gillingham", inpayEntry: 30, inpayPayment: 30 },
      { id: "4440", name: "Car Park D – Public (2)", city: "Gillingham", inpayEntry: 30, inpayPayment: 30 },
      { id: "4441", name: "Car Park B – Staff", city: "Gillingham", inpayEntry: 30, inpayPayment: 30 },
    ]
  });
  const [submitted, setSubmitted] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [currentUser, setCurrentUser] = useState(PLATFORM_USERS[0]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handle = (e) => {
      if (!e.target.closest('.topbar-dropdown') && !e.target.closest('.profile-dropdown') && !e.target.closest('.btn-ghost') && !e.target.closest('.avatar')) {
        setShowNotifs(false);
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const openProject = (p) => {
    setActiveProject(p);
    setWizardStep(p.step === 5 ? 5 : p.step);
    setView("wizard");
  };

  const stepContent = [
    <Step0 data={formData} setData={setFormData} />,
    <Step1 data={formData} setData={setFormData} />,
    <Step2 data={formData} setData={setFormData} />,
    <Step3 data={formData} setData={setFormData} />,
    <Step4 data={formData} setData={setFormData} />,
    <Step5 data={formData} />,
  ];

  const progressPct = (p) => Math.round((p.step / p.total) * 100);
  const progressColor = (s) => s === "approved" ? "var(--green)" : s === "review" ? "var(--blue-bright)" : "var(--amber)";

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">
              <div className="logo-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <div className="logo-text">entervo smart</div>
                <div className="logo-sub">Onboarding Platform</div>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-label">Main</div>
            {[
              { id: "dashboard", icon: "grid", label: "Dashboard" },
              { id: "projects", icon: "list", label: "All Projects", badge: "5" },
              { id: "new", icon: "plus", label: "New Onboarding" },
            ].map(item => (
              <div key={item.id} className={`nav-item${view === item.id || (view === "wizard" && item.id === "projects") ? " active" : ""}`}
                onClick={() => item.id === "new" ? (setActiveProject(null), setWizardStep(0), setFormData({}), setSubmitted(false), setView("wizard")) : setView(item.id)}>
                <Icon name={item.icon} />
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}
          </div>
          <div className="sidebar-section">
            <div className="sidebar-section-label">Review</div>
            {[
              { id: "review-q", icon: "eye", label: "Review Queue", badge: "3" },
              { id: "approved", icon: "shield", label: "Approved" },
              { id: "import", icon: "download", label: "Import Data" },
            ].map(item => (
              <div key={item.id} className={`nav-item${view === item.id ? " active" : ""}`} onClick={() => setView(item.id)}>
                <Icon name={item.icon} />
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}
          </div>
          <div className="sidebar-section" style={{ marginTop: "auto" }}>
            <div className="sidebar-section-label">Admin</div>
            {[
              { id: "admin-templates", icon: "list", label: "Countries" },
              { id: "admin-rules", icon: "shield", label: "Validation Rules" },
              { id: "admin-users", icon: "users", label: "User Management" },
              { id: "admin-settings", icon: "settings", label: "Settings" },
            ].map(item => (
              <div key={item.id} className={`nav-item${view === item.id ? " active" : ""}`} onClick={() => setView(item.id)}>
                <Icon name={item.icon} /> {item.label}
              </div>
            ))}
            <div className="nav-item" style={{ marginTop: 12, color: "rgba(255,255,255,0.4)" }} onClick={onBack}>
              <Icon name="chevronLeft" /> Back to Hub
            </div>
          </div>
        </aside>


        {/* ── MAIN ── */}
        <main className="main">
          {/* Topbar */}
          <div className="topbar">
            {view === "wizard" && (
              <button className="btn btn-ghost" onClick={() => setView("dashboard")} style={{ marginRight: 4 }}>
                <Icon name="chevronLeft" /> Back
              </button>
            )}
            <div>
              <div className="topbar-title">
                {view === "dashboard" && "Dashboard"}
                {view === "projects" && "All Projects"}
                {view === "wizard" && (activeProject ? `${activeProject.name} — Onboarding` : "New Onboarding")}
                {view === "review-q" && "Review Queue"}
                {view === "settings" && "Settings & Templates"}
                {view === "admin-templates" && "Admin — Countries"}
                {view === "admin-rules" && "Admin — Validation Rules"}
                {view === "admin-users" && "Admin — User Management"}
                {view === "admin-settings" && "Admin — Platform Settings"}
              </div>
              {view === "wizard" && activeProject && (
                <div className="topbar-subtitle">{activeProject.partner} · PM: {activeProject.pm}</div>
              )}
              {view === "wizard" && !activeProject && formData.productName && (
                <div className="topbar-subtitle">Product: {formData.productName}</div>
              )}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
              {/* ── NOTIFICATIONS BELL ── */}
              <div style={{ position: "relative" }}>
                <button className="btn btn-ghost" style={{ position: "relative" }} onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}>
                  <Icon name="bell" />
                  {notifs.filter(n => !n.read).length > 0 && (
                    <span className="bell-badge">{notifs.filter(n => !n.read).length}</span>
                  )}
                </button>
                {showNotifs && (
                  <div className="topbar-dropdown fade-in">
                    <div className="dropdown-header">
                      <div className="dropdown-header-title">Notifications</div>
                      <button className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 8px" }} onClick={() => setNotifs(notifs.map(n => ({ ...n, read: true })))}>Mark all read</button>
                    </div>
                    <div style={{ maxHeight: 380, overflowY: "auto" }}>
                      {notifs.map(n => (
                        <div key={n.id} className={`notif-item${n.read ? "" : " unread"}`} onClick={() => setNotifs(notifs.map(x => x.id === n.id ? { ...x, read: true } : x))}>
                          <div className="notif-icon" style={{ background: n.color }}>
                            {n.type === "submit" && <Icon name="plus" size={16} color={n.iconColor} />}
                            {n.type === "approve" && <Icon name="check" size={16} color={n.iconColor} />}
                            {n.type === "reject" && <Icon name="zap" size={16} color={n.iconColor} />}
                            {n.type === "info" && <Icon name="settings" size={16} color={n.iconColor} />}
                          </div>
                          <div className="notif-body">
                            <div className="notif-title">{n.title}</div>
                            <div className="notif-desc">{n.desc}</div>
                            <div className="notif-time">{n.time}</div>
                          </div>
                          {!n.read && <div className="notif-dot" />}
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "10px 18px", borderTop: "1px solid var(--gray-100)", textAlign: "center" }}>
                      <button className="btn btn-ghost" style={{ fontSize: 12, width: "100%" }}>View all notifications</button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── PROFILE ── */}
              <div style={{ position: "relative" }}>
                <div className="avatar" style={{ cursor: "pointer", background: currentUser.color + "33", color: currentUser.color, border: "2px solid " + currentUser.color + "55" }}
                  onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}>
                  {currentUser.initials}
                </div>
                {showProfile && (
                  <div className="profile-dropdown fade-in">
                    <div className="profile-header">
                      <div className="profile-avatar-lg" style={{ background: currentUser.color + "44", color: currentUser.color }}>{currentUser.initials}</div>
                      <div className="profile-name">{currentUser.name}</div>
                      <div className="profile-role">{currentUser.role}</div>
                      <div className="profile-email">{currentUser.email}</div>
                    </div>
                    <div>
                      <div className="profile-menu-item"><Icon name="settings" size={15} /> Account Settings</div>
                      <div className="profile-menu-item"><Icon name="shield" size={15} /> Privacy & Security</div>
                      <div className="profile-menu-item"><Icon name="bell" size={15} /> Notification Preferences</div>
                      <div className="profile-menu-item" style={{ color: "var(--red)" }}><Icon name="zap" size={15} color="var(--red)" /> Sign Out</div>
                    </div>
                    <div className="profile-switch">
                      <div className="profile-switch-label">Switch Profile</div>
                      {PLATFORM_USERS.map(u => (
                        <div key={u.id} className={`profile-switch-user${currentUser.id === u.id ? " active" : ""}`} onClick={() => { setCurrentUser(u); setShowProfile(false); }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: u.color + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: u.color, flexShrink: 0 }}>{u.initials}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--navy)" }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: "var(--gray-400)" }}>{u.role} · {u.partner}</div>
                          </div>
                          {currentUser.id === u.id && <Icon name="check" size={14} color="var(--blue-bright)" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="content">

            {/* ── DASHBOARD ── */}
            {view === "dashboard" && (
              <div className="fade-in">
                <div className="page-header">
                  <div className="page-title">Good morning, {currentUser.name.split(' ')[0]} 👋</div>
                  <div className="page-desc">Here's an overview of your onboarding projects.</div>
                </div>
                <div className="stat-grid" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
                  <div className="stat-card">
                    <div className="stat-label">Total Projects</div>
                    <div className="stat-value">6</div>
                    <div className="stat-change up">↑ 2 this month</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">In Progress</div>
                    <div className="stat-value">2</div>
                    <div className="stat-change pending">Awaiting data</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Pending Review</div>
                    <div className="stat-value">1</div>
                    <div className="stat-change" style={{ color: "var(--blue)" }}>In S&B queue</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Sales Approval</div>
                    <div className="stat-value" style={{ color: "#C0185A" }}>2</div>
                    <div className="stat-change" style={{ color: "#C0185A" }}>Awaiting payment</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Approved</div>
                    <div className="stat-value">0</div>
                    <div className="stat-change up">–</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Onboarded</div>
                    <div className="stat-value" style={{ color: "#7C3AED" }}>1</div>
                    <div className="stat-change" style={{ color: "#7C3AED" }}>↑ 1 this month</div>
                  </div>
                </div>
                <div className="section-header">
                  <div className="section-title">Recent Projects</div>
                  <button className="btn btn-primary" onClick={() => { setActiveProject(null); setWizardStep(0); setFormData({}); setSubmitted(false); setView("wizard"); }}>
                    <Icon name="plus" /> New Onboarding
                  </button>
                </div>
                <div className="project-grid">
                  {PROJECTS.map(p => (
                    <div key={p.id} className={`project-card${activeProject?.id === p.id ? " selected" : ""}`} onClick={() => openProject(p)}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <div className="project-name">{p.name}</div>
                          <span className={`badge ${STATUS_MAP[p.status].cls}`}>{STATUS_MAP[p.status].label}</span>
                        </div>
                        <div className="project-meta">
                          <span>🏢 {p.partner}</span>
                          <span>💳 {p.psp}</span>
                          <span>👤 {p.pm}</span>
                          {p.product && <span style={{ fontWeight: 700, color: (PRODUCT_MAP[p.product] || {}).color }}>{p.product}</span>}
                        </div>
                        <div className="project-progress">
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progressPct(p)}%`, background: progressColor(p.status) }} />
                          </div>
                          <div className="progress-label">Step {p.step} of {p.total} · {progressPct(p)}% complete</div>
                        </div>
                      </div>
                      <Icon name="chevronRight" color="var(--gray-400)" />
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* ── ALL PROJECTS ── */}
            {view === "projects" && (
              <div className="fade-in">
                <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="page-title">All Projects</div>
                    <div className="page-desc">Every onboarding project across all partners and products.</div>
                  </div>
                  <button className="btn btn-primary" onClick={() => { setActiveProject(null); setWizardStep(0); setFormData({}); setSubmitted(false); setView("wizard"); }}>
                    <Icon name="plus" /> New Onboarding
                  </button>
                </div>

                {/* Filter bar */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                  {["All", "Draft", "In Progress", "Pending Review", "Approved", "Onboarded"].map(f => (
                    <button key={f} style={{ padding: "5px 14px", borderRadius: 20, border: "1px solid var(--gray-200)", fontSize: 12, fontWeight: 600, cursor: "pointer", background: f === "All" ? "var(--navy)" : "white", color: f === "All" ? "white" : "var(--gray-600)" }}>
                      {f}
                    </button>
                  ))}
                  <div style={{ marginLeft: "auto" }}>
                    <input placeholder="Search projects…" style={{ padding: "6px 14px", border: "1.5px solid var(--gray-200)", borderRadius: 20, fontFamily: "var(--font)", fontSize: 13, outline: "none", width: 220 }} />
                  </div>
                </div>

                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 1fr 1.2fr 80px", padding: "10px 18px", background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: "8px 8px 0 0", borderBottom: "none" }}>
                  {["Project", "Product", "Partner", "PSP", "Progress", "Status", ""].map((h, i) => (
                    <div key={i} style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</div>
                  ))}
                </div>
                <div style={{ border: "1px solid var(--gray-200)", borderRadius: "0 0 8px 8px", overflow: "hidden", background: "white" }}>
                  {PROJECTS.map((p, i) => {
                    const pc = PRODUCT_MAP[p.product] || { color: "var(--gray-400)", bg: "var(--gray-100)" };
                    return (
                      <div key={p.id} onClick={() => openProject(p)} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 1fr 1.2fr 80px", padding: "14px 18px", borderBottom: i < PROJECTS.length - 1 ? "1px solid var(--gray-100)" : "none", alignItems: "center", cursor: "pointer", transition: "background 0.12s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--gray-50)"}
                        onMouseLeave={e => e.currentTarget.style.background = "white"}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>PM: {p.pm}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: pc.bg, color: pc.color }}>{p.product}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "var(--gray-600)" }}>{p.partner}</div>
                        <div style={{ fontSize: 13, color: "var(--gray-600)" }}>{p.psp}</div>
                        <div>
                          <div style={{ height: 6, background: "var(--gray-100)", borderRadius: 4, overflow: "hidden", width: 80 }}>
                            <div style={{ height: "100%", width: `${Math.round((p.step/p.total)*100)}%`, background: p.status === "onboarded" ? "#7C3AED" : p.status === "approved" ? "var(--green)" : p.status === "review" ? "var(--blue-bright)" : "var(--amber)", borderRadius: 4 }} />
                          </div>
                          <div style={{ fontSize: 10, color: "var(--gray-400)", marginTop: 3 }}>{Math.round((p.step/p.total)*100)}%</div>
                        </div>
                        <div>
                          <span className={`badge ${STATUS_MAP[p.status].cls}`}>{STATUS_MAP[p.status].label}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Icon name="chevronRight" color="var(--gray-400)" size={16} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── WIZARD ── */}
            {view === "wizard" && !submitted && (
              <div className="fade-in">
                <div className="wizard-container">
                  {/* Step nav */}
                  <div className="wizard-nav">
                    <div className="wizard-nav-title">Steps</div>
                    {WIZARD_STEPS.map((s, i) => {
                      const state = wizardStep === s.num ? "active" : wizardStep > s.num ? "done" : "todo";
                      return (
                        <div key={s.num}>
                          <div className={`wizard-step-item${state === "active" ? " active" : ""}`} onClick={() => setWizardStep(s.num)}>
                            <div className={`step-circle ${state}`}>
                              {state === "done" ? <Icon name="check" size={12} color="white" /> : s.num}
                            </div>
                            <div className="step-info">
                              <div className="step-label">{s.label}</div>
                              <div className={`step-name${state === "active" ? " active" : ""}`}>{s.name}</div>
                            </div>
                          </div>
                          {i < WIZARD_STEPS.length - 1 && <div className="wizard-step-connector" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Step body */}
                  <div className="wizard-body">
                    <div className="wizard-header">
                      <div className="wizard-step-tag">{WIZARD_STEPS[wizardStep].label}</div>
                      <div className="wizard-title">{WIZARD_STEPS[wizardStep].name}</div>
                      <div className="wizard-subtitle">
                        {[
                          "Select the entervo smart product you want to onboard.",
                          "Fill in the parking operator details and network access information.",
                          "Provide cell computer configuration and system settings.",
                          "Add one or more parking facilities served by this cell computer.",
                          "Configure the mobile app features and select a payment service provider.",
                          "Review all data before submitting for S&B internal approval."
                        ][wizardStep]}
                      </div>
                    </div>

                    {stepContent[wizardStep]}

                    <div className="wizard-footer">
                      <div className="step-dots">
                        {WIZARD_STEPS.map(s => (
                          <div key={s.num} className={`step-dot${wizardStep === s.num ? " active" : wizardStep > s.num ? " done" : ""}`} />
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        {wizardStep > 0 && (
                          <button className="btn btn-secondary" onClick={() => setWizardStep(w => w - 1)}>
                            <Icon name="chevronLeft" /> Back
                          </button>
                        )}
                        <button className="btn btn-secondary">Save Draft</button>
                        {wizardStep < 5 ? (
                          <button className="btn btn-primary" onClick={() => setWizardStep(w => w + 1)}>
                            Continue <Icon name="chevronRight" />
                          </button>
                        ) : (
                          <button className="btn btn-primary" style={{ background: "var(--green)" }} onClick={() => setSubmitted(true)}>
                            <Icon name="check" /> Submit for Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SUBMITTED ── */}
            {view === "wizard" && submitted && (
              <div className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#E8FAF1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Icon name="check" size={32} color="var(--green)" />
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>Submitted for Review</div>
                <div style={{ fontSize: 14, color: "var(--gray-600)", maxWidth: 400, lineHeight: 1.6 }}>
                  Your onboarding data has been submitted to the S&B review team. You'll receive an email notification once it's been reviewed.
                </div>
                <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                  <button className="btn btn-secondary" onClick={() => setView("dashboard")}>Back to Dashboard</button>
                  <button className="btn btn-primary" onClick={() => { setSubmitted(false); setWizardStep(5); }}>View Submission</button>
                </div>
              </div>
            )}

            {/* ── REVIEW QUEUE ── */}
            {view === "review-q" && (
              <div className="fade-in">
                <div className="page-header">
                  <div className="page-title">Review Queue</div>
                  <div className="page-desc">Submissions awaiting review or Sales payment confirmation.</div>
                </div>

                {/* S&B Technical Review */}
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, marginTop: 4 }}>
                  S&amp;B Technical Review
                </div>
                {PROJECTS.filter(p => p.status === "review").map(p => (
                  <div key={p.id} className="project-card" style={{ marginBottom: 10, cursor: "default" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div className="project-name">{p.name}</div>
                        <span className={`badge ${STATUS_MAP[p.status].cls}`}>{STATUS_MAP[p.status].label}</span>
                      </div>
                      <div className="project-meta"><span>Partner: {p.partner}</span><span>PSP: {p.psp}</span></div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-secondary" style={{ fontSize: 12 }}><Icon name="eye" size={12} /> Review</button>
                      <button className="btn btn-primary" style={{ fontSize: 12, background: "var(--green)" }}><Icon name="check" size={12} /> Approve</button>
                    </div>
                  </div>
                ))}

                {/* Sales Payment Approval */}
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, marginTop: 20 }}>
                  Awaiting Sales Payment Confirmation
                </div>
                {PROJECTS.filter(p => p.status === "sales-approval").map(p => (
                  <div key={p.id} className="project-card" style={{ marginBottom: 10, cursor: "default", borderLeft: "3px solid #C0185A" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div className="project-name">{p.name}</div>
                        <span className={`badge ${STATUS_MAP[p.status].cls}`}>{STATUS_MAP[p.status].label}</span>
                      </div>
                      <div className="project-meta"><span>Partner: {p.partner}</span><span>PSP: {p.psp}</span><span>Assigned to: Anna Krüger (Sales)</span></div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "var(--gray-400)" }}>⏳ Waiting for payment confirmation</span>
                      <button className="btn btn-primary" style={{ fontSize: 12, background: "#C0185A", border: "none" }}>
                        💳 Confirm Payment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── ADMIN: TEMPLATES ── */}
            {view === "admin-templates" && <AdminTemplates />}

            {/* ── ADMIN: VALIDATION RULES ── */}
            {view === "admin-rules" && <AdminRules />}

            {/* ── ADMIN: USERS ── */}
            {view === "admin-users" && <AdminUsers />}

            {/* ── ADMIN: SETTINGS ── */}
            {view === "admin-settings" && <AdminSettings />}

          </div>
        </main>
      </div>
    </>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [module, setModule] = useState(null); // null = hub, "onboarding", "patch"

  if (!module) return <LandingHub onSelect={setModule} />;
  if (module === "patch") return <PatchApp onBack={() => setModule(null)} />;
  return <OnboardingApp onBack={() => setModule(null)} />;
}
