// Seed data for the in-memory API store. Components read this through
// src/api/, never directly; when real endpoints land, only src/api/ changes.

import type { AdminUser, PlatformUser, UserRole } from "../types";

/** Profiles offered by the topbar profile switcher. */
export const PLATFORM_USERS: PlatformUser[] = [
  { id: 1, initials: "KH", name: "Kai Harperscheidt", role: "Admin", email: "k.harperscheidt@scheidt-bachmann.de", partner: "S&B HQ", color: "#1A6FD4" },
  { id: 2, initials: "MD", name: "Marc Delvaux", role: "Project Manager", email: "m.delvaux@scheidt-bachmann.de", partner: "S&B UK", color: "#1AB870" },
  { id: 3, initials: "MI", name: "Medway IT", role: "Customer", email: "medwayft.carparking@nhs.net", partner: "Medway Hospital", color: "#F4A136" },
  { id: 4, initials: "AK", name: "Anna Krüger", role: "Sales", email: "a.krueger@scheidt-bachmann.de", partner: "S&B HQ", color: "#C0185A" },
];

export const INITIAL_ADMIN_USERS: AdminUser[] = [
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
];

export const USER_ROLES: UserRole[] = [
  "Admin", "Project Manager", "Sales", "Reviewer", "DevOps", "Partner", "Customer",
];

export const ROLE_COLORS: Record<UserRole, { bg: string; color: string }> = {
  Admin: { bg: "#F3F0FC", color: "#6B4FBB" },
  "Project Manager": { bg: "var(--blue-pale)", color: "var(--blue)" },
  Reviewer: { bg: "#E8FAF1", color: "var(--green)" },
  Sales: { bg: "#FFF0F6", color: "#C0185A" },
  DevOps: { bg: "#FEF9EC", color: "#B07800" },
  Partner: { bg: "#E8F0FB", color: "var(--blue-bright)" },
  Customer: { bg: "var(--gray-100)", color: "var(--gray-600)" },
};
