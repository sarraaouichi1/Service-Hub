// Seed data for the in-memory API store. Components read this through
// src/api/, never directly; when real endpoints land, only src/api/ changes.

import type { AppNotification } from "../types";

export const INITIAL_NOTIFS: AppNotification[] = [
  { id: 1, type: "submit", title: "New Onboarding Request", desc: "Medway Hospital submitted Step 4 — App & Payment for review.", time: "5 min ago", read: false, color: "#E8F0FB", iconColor: "#1A6FD4" },
  { id: 7, type: "approve", title: "Payment Confirmed by Sales", desc: "Anna Krüger confirmed payment received for Rotterdam Harbour.", time: "30 min ago", read: false, color: "#FFF0F6", iconColor: "#C0185A" },
  { id: 2, type: "approve", title: "Onboarding Approved", desc: "Manchester Arena has been fully approved by Stefan Brandt.", time: "1 hour ago", read: false, color: "#E8FAF1", iconColor: "#1AB870" },
  { id: 3, type: "reject", title: "Correction Requested", desc: "Geneva Centre Mall — Step 2 was sent back with comments.", time: "2 hours ago", read: false, color: "#FEECEC", iconColor: "#E84040" },
  { id: 4, type: "submit", title: "New Onboarding Request", desc: "Rotterdam Harbour started a new onboarding (Step 1).", time: "Yesterday", read: true, color: "#E8F0FB", iconColor: "#1A6FD4" },
  { id: 5, type: "approve", title: "Onboarding Approved", desc: "Frankfurt Airport P3 approved and ready for DevOps setup.", time: "2 days ago", read: true, color: "#E8FAF1", iconColor: "#1AB870" },
  { id: 6, type: "info", title: "Template Updated", desc: "UK — Default template was updated by Kai Harperscheidt.", time: "3 days ago", read: true, color: "#FEF9EC", iconColor: "#F4A136" },
];
