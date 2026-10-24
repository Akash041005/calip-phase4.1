import { API_BASE_URL } from "./config";
import { isMockEnabled } from "./mock/enabled";
import { mockDelay } from "./mock/delay";

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
  if (isMockEnabled()) {
    await mockDelay(400);
    const mockAdmin = {
      _id: "admin-super-1",
      email: email || "admin@calip.io",
      displayName: "Vismay Admin",
      role: "SUPER_ADMIN",
      permissions: ["*"],
    };
    const mockToken = "mock-admin-jwt-token";
    setAdminToken(mockToken);
    setAdminSession(mockAdmin);
    return { success: true, accessToken: mockToken, admin: mockAdmin };
  }

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
  if (isMockEnabled()) {
    return { success: true, admin: getAdminSession() };
  }
  return adminFetch("/admin/v1/auth/session");
}

export async function touchAdminActivity() {
  if (isMockEnabled()) return { success: true };
  return adminFetch("/admin/v1/auth/session/activity", { method: "POST" });
}

export async function adminLogout() {
  if (isMockEnabled()) {
    clearAdminAuth();
    return { success: true };
  }
  try {
    await adminFetch("/admin/v1/auth/session", { method: "DELETE" });
  } finally {
    clearAdminAuth();
  }
  return { success: true };
}

// ── Dashboard Summary & Activity ──
export async function getAdminDashboardSummary() {
  if (isMockEnabled()) {
    await mockDelay(300);
    return {
      success: true,
      stats: {
        totalUsers: 1420,
        pendingStartups: 8,
        activeFundraises: 3,
        totalVolume: 42850000,
        queuedJobs: 2,
      },
    };
  }
  return adminFetch("/admin/v1/dashboard/summary");
}

export async function getAdminDashboardActivity() {
  if (isMockEnabled()) {
    await mockDelay(250);
    return {
      success: true,
      items: [
        { _id: "act-1", action: "STARTUP_APPROVED", actor: "admin@calip.io", entity: "Startup", target: "NovaPay", createdAt: new Date(Date.now() - 3600000).toISOString() },
        { _id: "act-2", action: "CHECKLIST_UPDATED", actor: "admin@calip.io", entity: "Startup", target: "AgriVerse", createdAt: new Date(Date.now() - 7200000).toISOString() },
        { _id: "act-3", action: "FUNDRAISE_CLOSED", actor: "admin@calip.io", entity: "Fundraise", target: "MediSync Presale", createdAt: new Date(Date.now() - 86400000).toISOString() },
      ],
    };
  }
  return adminFetch("/admin/v1/dashboard/activity");
}

// ── Startups Review & Moderation ──
export async function getAdminStartups(params = {}) {
  if (isMockEnabled()) {
    await mockDelay(350);
    return {
      success: true,
      data: [
        {
          _id: "sp-1",
          startupName: "NovaPay Protocol",
          founderName: "Alex Vance",
          email: "alex@novapay.io",
          status: "pending",
          fundingStage: "Seed",
          industrySector: "DeFi / FinTech",
          currentStartupValuation: "$12.5M",
          verificationChecklist: { kycVerified: true, legalIncorporation: true, techAudit: false, financialProof: true },
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          _id: "sp-2",
          startupName: "FleetAI Logistics",
          founderName: "Elena Rostova",
          email: "elena@fleetai.io",
          status: "under_review",
          fundingStage: "Series A",
          industrySector: "AI / Robotics",
          currentStartupValuation: "$28.0M",
          verificationChecklist: { kycVerified: true, legalIncorporation: true, techAudit: true, financialProof: false },
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        },
        {
          _id: "sp-3",
          startupName: "AgriVerse Decentralized",
          founderName: "Kofi Mensah",
          email: "kofi@agriverse.earth",
          status: "approved",
          fundingStage: "Pre-Seed",
          industrySector: "AgriTech",
          currentStartupValuation: "$6.2M",
          verificationChecklist: { kycVerified: true, legalIncorporation: true, techAudit: true, financialProof: true },
          createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        },
      ],
      total: 3,
    };
  }
  const query = new URLSearchParams(params).toString();
  return adminFetch(`/admin/v1/startups${query ? `?${query}` : ""}`);
}

export async function getAdminStartupDetail(startupId) {
  if (isMockEnabled()) {
    await mockDelay(200);
    return {
      success: true,
      startup: {
        _id: startupId,
        startupName: "NovaPay Protocol",
        founderName: "Alex Vance",
        email: "alex@novapay.io",
        status: "pending",
        description: "Next generation merchant settlement rail on Base L2 delivering sub-second finality with zero gas fees.",
        startupWebsite: "https://novapay.io",
        fundingStage: "Seed",
        industrySector: "DeFi / FinTech",
        currentStartupValuation: 12500000,
        verificationChecklist: { kycVerified: true, legalIncorporation: true, techAudit: false, financialProof: true },
      },
    };
  }
  return adminFetch(`/admin/v1/startups/${startupId}`);
}

export async function approveAdminStartup(startupId, { reason, version } = {}) {
  if (isMockEnabled()) {
    await mockDelay(400);
    return { success: true, message: "Startup approved for listing" };
  }
  return adminFetch(`/admin/v1/startups/${startupId}/proceed`, {
    method: "POST",
    body: { reason: reason || "Approved to proceed after review", version },
  });
}

export async function launchAdminAuction(startupId, payload) {
  if (isMockEnabled()) {
    await mockDelay(400);
    return {
      success: true,
      message: "Auction round launched successfully!",
      presale: {
        _id: `presale-${Date.now()}`,
        startupId,
        ...payload,
        status: "active",
      },
    };
  }
  return adminFetch(`/admin/v1/startups/${startupId}/launch-auction`, {
    method: "POST",
    body: payload,
  });
}

export async function rejectAdminStartup(startupId, reasonOrOptions) {
  if (isMockEnabled()) {
    await mockDelay(400);
    return { success: true, message: "Startup rejected" };
  }
  const body = typeof reasonOrOptions === "object"
    ? { reason: reasonOrOptions.reason || "Application rejected after review", version: reasonOrOptions.version }
    : { reason: reasonOrOptions || "Application rejected after review" };

  return adminFetch(`/admin/v1/startups/${startupId}/reject`, {
    method: "POST",
    body,
  });
}

export async function requestStartupInfo(startupId, message) {
  if (isMockEnabled()) {
    await mockDelay(400);
    return { success: true, message: "Information requested from founder" };
  }
  return adminFetch(`/admin/v1/startups/${startupId}/request-information`, {
    method: "POST",
    body: { message },
  });
}

export async function toggleStartupVerification(startupId, key, value) {
  if (isMockEnabled()) {
    await mockDelay(200);
    return { success: true, key, value };
  }
  return adminFetch(`/admin/v1/startups/${startupId}/verification`, {
    method: "PATCH",
    body: { key, value },
  });
}

// ── Fundraises & Auctions ──
export async function getAdminFundraises() {
  if (isMockEnabled()) {
    await mockDelay(300);
    return {
      success: true,
      fundraises: [
        {
          _id: "fr-1",
          startupName: "NovaPay Protocol",
          targetAmount: 500000,
          raisedAmount: 395000,
          softCapPercent: 70,
          status: "active",
          deadline: new Date(Date.now() + 86400000 * 12).toISOString(),
        },
      ],
    };
  }
  return adminFetch("/admin/v1/fundraises");
}

export async function closeAdminFundraise(fundraiseId) {
  if (isMockEnabled()) {
    await mockDelay(400);
    return { success: true, message: "Fundraise closed and evaluated" };
  }
  return adminFetch(`/admin/v1/fundraises/${fundraiseId}/close`, { method: "POST" });
}

export async function triggerTokenCreation(fundraiseId) {
  if (isMockEnabled()) {
    await mockDelay(500);
    return { success: true, jobId: "job-token-mock-1", message: "Token creation queued" };
  }
  return adminFetch(`/admin/v1/fundraises/${fundraiseId}/token-creation`, { method: "POST" });
}

// ── Audit Events ──
export async function getAdminAuditEvents(params = {}) {
  if (isMockEnabled()) {
    await mockDelay(300);
    return {
      success: true,
      events: [
        { _id: "ev-1", action: "STARTUP_STATUS_CHANGED", actor: "admin@calip.io", entity: "Startup", targetId: "sp-1", outcome: "SUCCESS", timestamp: new Date().toISOString() },
        { _id: "ev-2", action: "TOKEN_CREATION_QUEUED", actor: "admin@calip.io", entity: "Fundraise", targetId: "fr-1", outcome: "SUCCESS", timestamp: new Date(Date.now() - 3600000).toISOString() },
      ],
    };
  }
  const query = new URLSearchParams(params).toString();
  return adminFetch(`/admin/v1/audit-events${query ? `?${query}` : ""}`);
}
