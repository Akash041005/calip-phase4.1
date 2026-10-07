import { apiFetch } from "./apiClient";
import { isMockEnabled } from "./mock/enabled";
import { mockDelay } from "./mock/delay";
import {
  mockGetWatchlist,
  mockAddToWatchlist,
  mockRemoveFromWatchlist,
} from "./mock/watchlist";
import {
  mockGetSessions,
  mockGetWallets,
  mockGetNotifications,
  mockGetUnreadCount,
  mockGetKyc,
  mockGetPreferences,
} from "./mock/user";

export async function getWatchlist() {
  if (isMockEnabled()) {
    await mockDelay();
    return mockGetWatchlist();
  }
  return apiFetch("/users/watchlist", { auth: true });
}

export async function addToWatchlist(startupId) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockAddToWatchlist(startupId);
  }
  return apiFetch("/users/watchlist", { method: "POST", auth: true, body: { startupId } });
}

export async function removeFromWatchlist(startupId) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockRemoveFromWatchlist(startupId);
  }
  return apiFetch(`/users/watchlist/${startupId}`, { method: "DELETE", auth: true });
}

export async function getSessions() {
  if (isMockEnabled()) {
    await mockDelay();
    return mockGetSessions();
  }
  return apiFetch("/users/sessions", { auth: true });
}

export async function deleteSession(sessionId) {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true, sessionId };
  }
  return apiFetch(`/users/sessions/${sessionId}`, { method: "DELETE", auth: true });
}

export async function getLoginActivity() {
  if (isMockEnabled()) {
    await mockDelay();
    return { items: [] };
  }
  return apiFetch("/users/login-activity", { auth: true });
}

export async function deleteAccount() {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true };
  }
  return apiFetch("/users/", { method: "DELETE", auth: true });
}

export async function getWallets() {
  if (isMockEnabled()) {
    await mockDelay();
    return mockGetWallets();
  }
  return apiFetch("/users/wallets", { auth: true });
}

export async function addWallet(payload) {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true, wallet: payload };
  }
  return apiFetch("/users/wallets", { method: "POST", auth: true, body: payload });
}

export async function removeWallet(address) {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true, address };
  }
  return apiFetch(`/users/wallets/${address}`, { method: "DELETE", auth: true });
}

export async function setPrimaryWallet(address) {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true, address };
  }
  return apiFetch(`/users/wallets/${address}/primary`, { method: "PATCH", auth: true });
}

export async function getKyc() {
  if (isMockEnabled()) {
    await mockDelay();
    return mockGetKyc();
  }
  return apiFetch("/users/kyc", { auth: true });
}

export async function getNotifications(page = 1, limit = 20) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockGetNotifications(page, limit);
  }
  return apiFetch(`/users/notifications/?page=${page}&limit=${limit}`, { auth: true });
}

export async function getUnreadCount() {
  if (isMockEnabled()) {
    await mockDelay();
    return mockGetUnreadCount();
  }
  return apiFetch("/users/notifications/unread-count", { auth: true });
}

export async function markNotificationRead(id) {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true, id };
  }
  return apiFetch(`/users/notifications/read/${id}`, { method: "PATCH", auth: true });
}

export async function markAllNotificationsRead() {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true };
  }
  return apiFetch("/users/notifications/read-all", { method: "PATCH", auth: true });
}

export async function deleteNotification(id) {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true, id };
  }
  return apiFetch(`/users/notifications/${id}`, { method: "DELETE", auth: true });
}

export async function getPreferences() {
  if (isMockEnabled()) {
    await mockDelay();
    return mockGetPreferences();
  }
  return apiFetch("/users/preferences", { auth: true });
}

export async function updatePreferences(payload) {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true, preferences: payload };
  }
  return apiFetch("/users/preferences", { method: "PUT", auth: true, body: payload });
}

export async function updateSecurity(payload) {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true, security: payload };
  }
  return apiFetch("/users/security", { method: "PUT", auth: true, body: payload });
}
