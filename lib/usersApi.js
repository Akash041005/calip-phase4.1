import { apiFetch } from "./apiClient";

export async function getWatchlist() {
  return apiFetch("/users/watchlist", { auth: true });
}

export async function addToWatchlist(startupId) {
  return apiFetch("/users/watchlist", { method: "POST", auth: true, body: { startupId } });
}

export async function removeFromWatchlist(startupId) {
  return apiFetch(`/users/watchlist/${startupId}`, { method: "DELETE", auth: true });
}

export async function getSessions() {
  return apiFetch("/users/sessions", { auth: true });
}

export async function deleteSession(sessionId) {
  return apiFetch(`/users/sessions/${sessionId}`, { method: "DELETE", auth: true });
}

export async function getLoginActivity() {
  return apiFetch("/users/login-activity", { auth: true });
}

export async function deleteAccount() {
  return apiFetch("/users/", { method: "DELETE", auth: true });
}

export async function getWallets() {
  return apiFetch("/users/wallets", { auth: true });
}

export async function addWallet(payload) {
  return apiFetch("/users/wallets", { method: "POST", auth: true, body: payload });
}

export async function removeWallet(address) {
  return apiFetch(`/users/wallets/${address}`, { method: "DELETE", auth: true });
}

export async function setPrimaryWallet(address) {
  return apiFetch(`/users/wallets/${address}/primary`, { method: "PATCH", auth: true });
}

export async function getKyc() {
  return apiFetch("/users/kyc", { auth: true });
}

export async function getNotifications(page = 1, limit = 20) {
  return apiFetch(`/users/notifications/?page=${page}&limit=${limit}`, { auth: true });
}

export async function getUnreadCount() {
  return apiFetch("/users/notifications/unread-count", { auth: true });
}

export async function markNotificationRead(id) {
  return apiFetch(`/users/notifications/read/${id}`, { method: "PATCH", auth: true });
}

export async function markAllNotificationsRead() {
  return apiFetch("/users/notifications/read-all", { method: "PATCH", auth: true });
}

export async function deleteNotification(id) {
  return apiFetch(`/users/notifications/${id}`, { method: "DELETE", auth: true });
}

export async function getPreferences() {
  return apiFetch("/users/preferences", { auth: true });
}

export async function updatePreferences(payload) {
  return apiFetch("/users/preferences", { method: "PUT", auth: true, body: payload });
}

export async function updateSecurity(payload) {
  return apiFetch("/users/security", { method: "PUT", auth: true, body: payload });
}
