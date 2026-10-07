const STORAGE_KEY = "calip.auth.v1";

export function readStoredSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.accessToken || !parsed.refreshToken) return null;
    return {
      accessToken: String(parsed.accessToken),
      refreshToken: String(parsed.refreshToken),
      walletAddress: parsed.walletAddress ? String(parsed.walletAddress) : null,
      role: parsed.role || "user",
    };
  } catch {
    return null;
  }
}

export function writeStoredSession(session) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage errors (private mode, quota) — in-memory state still works.
  }
}

export function clearStoredSession() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}
