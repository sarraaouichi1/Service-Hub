// Seed data for the in-memory API store. Components read this through
// src/api/, never directly; when real endpoints land, only src/api/ changes.

import type { ProductDefinition, ProductId } from "../types";

export const PRODUCTS: ProductDefinition[] = [
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

/**
 * Products by id — the single source of truth for a product's name and accent
 * colours. This replaces a PRODUCT_MAP keyed by display name, which silently
 * failed to match the dashed ids the wizard writes.
 */
export const PRODUCT_BY_ID = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p]),
) as Record<ProductId, ProductDefinition>;
