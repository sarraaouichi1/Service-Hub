import type { AppNotification } from "../types";
import { ok } from "./client";
import { store } from "./store";

export function listNotifications(): Promise<AppNotification[]> {
  return ok(store.notifications);
}

export async function markAllRead(): Promise<AppNotification[]> {
  store.notifications = store.notifications.map((notif) => ({ ...notif, read: true }));
  return ok(store.notifications);
}
