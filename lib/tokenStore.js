const STORAGE_KEY = "calip.auth.v2";
export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const SESSION_IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000;

function getSessionFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    window.localStorage.removeItem("calip.auth.v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.walletAddress) return null;
    return {
      walletAddress: String(parsed.walletAddress),
      sessionId: String(parsed.sessionId || ""),
      role: parsed.role || "user",
      expiresAt: Number(parsed.expiresAt) || 0,
      lastActivityAt: Number(parsed.lastActivityAt) || 0,
    };
  } catch {
    return null;
  }
}

export function readStoredSession() {
  const session = getSessionFromStorage();
  if (!session) return null;
  const now = Date.now();
  if (
    !session.sessionId || !session.expiresAt || session.expiresAt <= now ||
    !session.lastActivityAt || now - session.lastActivityAt >= SESSION_IDLE_TIMEOUT_MS
  ) {
    clearStoredSession();
    return null;
  }
  return session;
}

export function writeStoredSession(session) {
  if (typeof window === "undefined" || !session?.walletAddress) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      walletAddress: String(session.walletAddress),
      sessionId: String(session.sessionId || ""),
      role: session.role || "user",
      expiresAt: Number(session.expiresAt),
      lastActivityAt: Number(session.lastActivityAt) || Date.now(),
    }));
  } catch {
    // The server session remains authoritative if browser storage is unavailable.
  }
}

export function touchStoredSession(now = Date.now()) {
  const session = readStoredSession();
  if (!session) return null;
  const updated = { ...session, lastActivityAt: now };
  writeStoredSession(updated);
  return updated;
}

export function clearStoredSession() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    // Clear the previous browser-stored bearer-token format during migration.
    window.localStorage.removeItem("calip.auth.v1");
  } catch {
    // Ignore storage errors.
  }
}

export function subscribeToSessionChanges(handler) {
  if (typeof window === "undefined") return () => {};
  const listener = (event) => {
    if (event.key === STORAGE_KEY || event.key === null) handler();
  };
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}
