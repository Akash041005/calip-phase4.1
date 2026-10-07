import { API_BASE_URL } from "./config";
import { readStoredSession, writeStoredSession, clearStoredSession } from "./tokenStore";

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body || null;
  }
}

const listeners = {
  authFailure: new Set(),
  tokenRefreshed: new Set(),
};

export function onAuthFailure(handler) {
  listeners.authFailure.add(handler);
  return () => {
    listeners.authFailure.delete(handler);
  };
}

export function onTokenRefreshed(handler) {
  listeners.tokenRefreshed.add(handler);
  return () => {
    listeners.tokenRefreshed.delete(handler);
  };
}

function getAccessToken() {
  return readStoredSession()?.accessToken || null;
}

function extractMessage(body) {
  if (!body) return null;
  if (typeof body.message === "string" && body.message) return body.message;
  if (typeof body.error === "string" && body.error) return body.error;
  if (Array.isArray(body.errors) && body.errors.length > 0) {
    const first = body.errors[0];
    if (typeof first?.msg === "string" && first.msg) return first.msg;
  }
  return null;
}

async function toApiError(response, fallbackMessage) {
  let body = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON body — fall through to defaults.
  }
  const message =
    extractMessage(body) || fallbackMessage || `Request failed with status ${response.status}`;
  return new ApiError(message, response.status, body);
}

// Single-flight lock: concurrent 401s share one /auth/refresh call instead of
// firing N refreshes + N tokenRefreshed broadcasts (N auth-context re-renders).
let refreshPromise = null;

async function attemptRefresh() {
  if (refreshPromise) {
    try {
      return await refreshPromise;
    } catch {
      return false;
    }
  }
  const session = readStoredSession();
  if (!session?.refreshToken) return false;

  refreshPromise = (async () => {

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
      cache: "no-store",
    });
  } catch {
    return false;
  }

  if (!response.ok) return false;

  let parsed = null;
  try {
    parsed = await response.json();
  } catch {
    return false;
  }

  if (!parsed || typeof parsed.accessToken !== "string" || !parsed.accessToken) return false;

  writeStoredSession({ ...session, accessToken: parsed.accessToken });
  listeners.tokenRefreshed.forEach((handler) => handler({ accessToken: parsed.accessToken }));
  return true;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function apiFetch(path, options = {}) {
  const { method = "GET", body, formData, auth = false, retry = true } = options;

  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  // formData (multipart) intentionally sets no Content-Type — the browser adds the boundary.

  const token = auth ? getAccessToken() : null;
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  const payload = formData !== undefined ? formData : body !== undefined ? JSON.stringify(body) : undefined;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: payload,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Network error. Please check your connection and try again.",
      0,
      null
    );
  }

  if (response.status === 401 && auth && retry) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      return apiFetch(path, { ...options, retry: false });
    }
    clearStoredSession();
    listeners.authFailure.forEach((handler) => handler());
    throw await toApiError(response, "Your session has expired. Please sign in again.");
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}
