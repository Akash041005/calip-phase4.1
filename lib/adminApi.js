import { API_BASE_URL } from "./config";

const ADMIN_TOKEN_KEY = "calip.admin.token.v1";
const ADMIN_SESSION_KEY = "calip.admin.session.v1";

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

export function getAdminSession() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAdminSession(session) {
  if (typeof window === "undefined") return;
  if (session) {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

export function clearAdminAuth() {
  setAdminToken(null);
  setAdminSession(null);
}

export async function adminFetch(endpoint, options = {}) {
  const { method = "GET", body, auth = true } = options;
  const headers = { "Content-Type": "application/json" };
  
  if (auth) {
    const token = getAdminToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      clearAdminAuth();
      if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login?expired=1";
      }
    }
    const errMsg = data?.error?.message || data?.message || `Admin request failed: ${response.status}`;
    throw new Error(errMsg);
  }
  return data;
}

// ── Auth ──
export async function adminLogin(email, password) {
  const res = await adminFetch("/admin/v1/auth/password", {
    method: "POST",
    auth: false,
    body: { email, password },
  });

  const payload = res?.data ?? res;
  if (payload.accessToken) {
    setAdminToken(payload.accessToken);
    setAdminSession(payload.admin || { email, role: "SUPER_ADMIN" });
  }
  return payload;
}

export async function getAdminSessionProfile() {
  return adminFetch("/admin/v1/auth/session");
}

export async function touchAdminActivity() {
  return adminFetch("/admin/v1/auth/session/activity", { method: "POST" });
}

export async function adminLogout() {
  try {
    await adminFetch("/admin/v1/auth/session", { method: "DELETE" });
  } finally {
    clearAdminAuth();
  }
  return { success: true };
}

// ── Dashboard Summary & Activity ──
export async function getAdminDashboardSummary() {
  return adminFetch("/admin/v1/dashboard/summary");
}

export async function getAdminDashboardActivity() {
  return adminFetch("/admin/v1/dashboard/activity");
}

// ── Startups Review & Moderation ──
export async function getAdminStartups(params = {}) {
  const query = new URLSearchParams(params).toString();
  return adminFetch(`/admin/v1/startups${query ? `?${query}` : ""}`);
}

export async function getAdminStartupDetail(startupId) {
  return adminFetch(`/admin/v1/startups/${startupId}`);
}

export async function approveAdminStartup(startupId, { reason, version } = {}) {
  return adminFetch(`/admin/v1/startups/${startupId}/proceed`, {
    method: "POST",
    body: { reason: reason || "Approved to proceed after review", version },
  });
}

export async function launchAdminAuction(startupId, payload) {
  return adminFetch(`/admin/v1/startups/${startupId}/launch-auction`, {
    method: "POST",
    body: payload,
  });
}

export async function rejectAdminStartup(startupId, reasonOrOptions) {
  const body = typeof reasonOrOptions === "object"
    ? { reason: reasonOrOptions.reason || "Application rejected after review", version: reasonOrOptions.version }
    : { reason: reasonOrOptions || "Application rejected after review" };

  return adminFetch(`/admin/v1/startups/${startupId}/reject`, {
    method: "POST",
    body,
  });
}

export async function requestStartupInfo(startupId, message) {
  return adminFetch(`/admin/v1/startups/${startupId}/request-information`, {
    method: "POST",
    body: { message },
  });
}

export async function toggleStartupVerification(startupId, key, value) {
  return adminFetch(`/admin/v1/startups/${startupId}/verification`, {
    method: "PATCH",
    body: { itemKey: key, result: value, key, value },
  });
}

// ── Fundraises & Auctions ──
export async function getAdminFundraises() {
  return adminFetch("/admin/v1/fundraises");
}

export async function closeAdminFundraise(fundraiseId) {
  return adminFetch(`/admin/v1/fundraises/${fundraiseId}/close`, { method: "POST" });
}

export async function triggerTokenCreation(fundraiseId) {
  return adminFetch(`/admin/v1/fundraises/${fundraiseId}/token-creation`, { method: "POST" });
}

// ── Audit Events ──
export async function getAdminAuditEvents(params = {}) {
  const query = new URLSearchParams(params).toString();
  return adminFetch(`/admin/v1/audit-events${query ? `?${query}` : ""}`);
}
