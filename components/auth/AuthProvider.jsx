"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  connectWallet,
  getWalletChainId,
  signWalletMessage,
  subscribeToAccountsChanged,
  subscribeToDisconnect,
  WalletError,
  WALLET_ERROR_CODES,
} from "../../lib/wallet";
import {
  requestNonce,
  verifyWallet,
  fetchProfile,
  logoutWallet,
  refreshAccessToken,
  recordSessionActivity,
} from "../../lib/authApi";
import {
  readStoredSession,
  writeStoredSession,
  clearStoredSession,
  touchStoredSession,
  subscribeToSessionChanges,
  SESSION_MAX_AGE_MS,
  SESSION_IDLE_TIMEOUT_MS,
} from "../../lib/tokenStore";
import { onAuthFailure, onTokenRefreshed, ApiError, setAccessToken as setApiAccessToken } from "../../lib/apiClient";
import { isMockEnabled } from "../../lib/mock/enabled";
import { mockLogin } from "../../lib/mock/auth";
import { disconnectSocket, updateSocketToken } from "../../lib/socketClient";

const AuthContext = createContext(null);

export const AUTH_STATUS = {
  IDLE: "idle",
  CONNECTING: "connecting",
  SIGNING: "signing",
  AUTHENTICATING: "authenticating",
  AUTHENTICATED: "authenticated",
};

const walletErrorMessages = {
  [WALLET_ERROR_CODES.NOT_INSTALLED]:
    "No compatible wallet detected. Install MetaMask or another Ethereum wallet and try again.",
  [WALLET_ERROR_CODES.CONNECTION_REJECTED]:
    "Wallet connection was rejected. Approve the connection request to continue.",
  [WALLET_ERROR_CODES.CONNECTION_FAILED]:
    "Could not connect to your wallet. Please try again.",
  [WALLET_ERROR_CODES.SIGNATURE_REJECTED]:
    "Message signature was rejected. Approve the signature request to sign in.",
  [WALLET_ERROR_CODES.SIGN_FAILED]:
    "Could not sign the message. Please try again.",
};

function normalizeAddress(address) {
  return typeof address === "string" ? address.toLowerCase() : "";
}

function buildError(error) {
  if (error instanceof WalletError) {
    return {
      code: error.code,
      message: walletErrorMessages[error.code] || error.message,
    };
  }
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return { code: "NETWORK", message: error.message };
    }
    if (error.status === 429) {
      return {
        code: "RATE_LIMIT",
        message: "Too many attempts. Please try again in a few minutes.",
      };
    }
    return {
      code: "API",
      message: error.message || "Something went wrong. Please try again.",
    };
  }
  return { code: "UNKNOWN", message: "Something went wrong. Please try again." };
}

export function AuthProvider({ children }) {
  const [status, setStatus] = useState(AUTH_STATUS.IDLE);
  const [walletAddress, setWalletAddress] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const stateRef = useRef(null);
  // Keep latest auth snapshot without running this effect on every render
  // (e.g. accessToken refreshes, error toasts). Only identity fields matter here.
  useEffect(() => {
    stateRef.current = { status, walletAddress, user, role, sessionId };
  }, [status, walletAddress, user, role, sessionId]);

  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const restoreStartedRef = useRef(false);

  const clearError = useCallback(() => setError(null), []);

  const resetSession = useCallback(({ clearStorage = true } = {}) => {
    if (clearStorage) clearStoredSession();
    setAccessToken(null);
    setApiAccessToken(null);
    disconnectSocket();
    setWalletAddress(null);
    setUser(null);
    setRole(null);
    setSessionId(null);
    setStatus(AUTH_STATUS.IDLE);
  }, []);

  const applyError = useCallback((err) => {
    setError(buildError(err));
    setStatus(AUTH_STATUS.IDLE);
  }, []);

  const connectAndAuthenticate = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setError(null);
    try {
      // Explicit development-only mock mode; production always uses wallet signatures.
      if (isMockEnabled()) {
        setStatus(AUTH_STATUS.CONNECTING);
        const { session, user: mockUser } = mockLogin();
        writeStoredSession({
          walletAddress: session.walletAddress,
          sessionId: "mock-session",
          role: session.role,
          expiresAt: Date.now() + SESSION_MAX_AGE_MS,
          lastActivityAt: Date.now(),
        });
        setAccessToken(session.accessToken);
        setApiAccessToken(session.accessToken);
        setWalletAddress(session.walletAddress);
        setRole(session.role);
        setSessionId("mock-session");
        setUser(mockUser);
        if (mountedRef.current) {
          setStatus(AUTH_STATUS.AUTHENTICATED);
          setIsReady(true);
        }
        return true;
      }

      setStatus(AUTH_STATUS.CONNECTING);

      const address = await connectWallet();
      const chainId = await getWalletChainId();

      const nonceBody = await requestNonce(address, chainId);
      const message = nonceBody?.message;
      if (!message) {
        throw new ApiError("The server did not return a secure sign-in challenge.", 0, null);
      }

      setStatus(AUTH_STATUS.SIGNING);
      const signature = await signWalletMessage(message, address);
      if (await getWalletChainId() !== chainId) {
        throw new ApiError("Your wallet network changed during sign-in. Please connect again.", 0, null);
      }

      setStatus(AUTH_STATUS.AUTHENTICATING);
      const verifyBody = await verifyWallet(address, signature);
      const token = verifyBody?.accessToken;
      if (!token) {
        throw new ApiError("The authentication server did not return an access token.", 0, null);
      }
      if (!verifyBody.sessionId || !verifyBody.expiresAt) {
        throw new ApiError(
          "The configured backend is running an older authentication version. Deploy the backend session update so wallet sign-in returns sessionId and expiresAt and sets the HttpOnly refresh cookie.",
          0,
          null
        );
      }

      const sessionExpiresAt = new Date(verifyBody.expiresAt).getTime();
      if (!Number.isFinite(sessionExpiresAt) || sessionExpiresAt <= Date.now()) {
        throw new ApiError("The authentication server returned an invalid session expiry. Update the backend and try again.", 0, null);
      }

      const session = {
        walletAddress: address,
        sessionId: verifyBody.sessionId,
        role: verifyBody.role || "user",
        expiresAt: sessionExpiresAt,
        lastActivityAt: Date.now(),
      };
      writeStoredSession(session);
      setAccessToken(token);
      setApiAccessToken(token);
      setWalletAddress(address);
      setRole(session.role);
      setSessionId(session.sessionId);

      let profile = null;
      try {
        const profileBody = await fetchProfile();
        profile = profileBody?.user ?? profileBody ?? null;
      } catch {
        // A 401 here means the refresh interceptor failed and onAuthFailure
        // already reset the session below; other errors keep the user signed in.
      }
      setUser(profile);

      if (mountedRef.current && readStoredSession()?.walletAddress) {
        setStatus(AUTH_STATUS.AUTHENTICATED);
        setIsReady(true);
        return true;
      }
      return false;
    } catch (err) {
      applyError(err);
      return false;
    } finally {
      busyRef.current = false;
    }
  }, [applyError]);

  const logout = useCallback(async () => {
    busyRef.current = true;
    try {
      await logoutWallet();
    } catch {
      // Best-effort server-side session cleanup; local state always clears.
    } finally {
      resetSession();
      busyRef.current = false;
    }
  }, [resetSession]);

  const updateUser = useCallback((updater) => {
    setUser((prev) =>
      typeof updater === "function" ? updater(prev || {}) : { ...(prev || {}), ...updater }
    );
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const unsubFailure = onAuthFailure(() => {
      if (!mountedRef.current) return;
      setError({
        code: "SESSION_EXPIRED",
        message: "Your session has expired. Please connect your wallet again.",
      });
      resetSession();
    });
    const unsubToken = onTokenRefreshed(({ accessToken: newToken }) => {
      if (mountedRef.current) {
        setAccessToken(newToken);
        updateSocketToken(newToken);
      }
    });
    return () => {
      unsubFailure();
      unsubToken();
    };
  }, [resetSession]);

  useEffect(() => {
    if (restoreStartedRef.current) return;
    restoreStartedRef.current = true;
    (async () => {
      const session = readStoredSession();
      if (!session) {
        setIsReady(true);
        return;
      }
      setWalletAddress(session.walletAddress);
      setRole(session.role || "user");
      setSessionId(session.sessionId);
      try {
        if (isMockEnabled()) {
          const { session: mockSession, user: mockUser } = mockLogin();
          setAccessToken(mockSession.accessToken);
          setApiAccessToken(mockSession.accessToken);
          setUser(mockUser);
        } else {
          const refreshed = await refreshAccessToken();
          if (!refreshed?.accessToken) throw new Error("Session expired");
          if (refreshed.walletAddress?.toLowerCase() !== session.walletAddress.toLowerCase() || refreshed.sessionId !== session.sessionId) {
            throw new Error("Session wallet does not match stored account");
          }
          writeStoredSession({
            ...session,
            expiresAt: Number(refreshed.expiresAt) || session.expiresAt,
          });
          setAccessToken(refreshed.accessToken);
          setApiAccessToken(refreshed.accessToken);
          const profileBody = await fetchProfile();
          setUser(profileBody?.user ?? profileBody ?? null);
        }
        if (mountedRef.current) setStatus(AUTH_STATUS.AUTHENTICATED);
      } catch {
        clearStoredSession();
        setAccessToken(null);
        setApiAccessToken(null);
        setWalletAddress(null);
        setRole(null);
        setSessionId(null);
        setUser(null);
        setStatus(AUTH_STATUS.IDLE);
      } finally {
        if (mountedRef.current) setIsReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (status !== AUTH_STATUS.AUTHENTICATED) return undefined;
    let lastInputAt = readStoredSession()?.lastActivityAt || Date.now();
    let lastHeartbeatAt = Date.now();
    let lastStorageWriteAt = 0;
    const onActivity = () => {
      const now = Date.now();
      lastInputAt = now;
      if (now - lastStorageWriteAt < 30_000) return;
      lastStorageWriteAt = now;
      touchStoredSession(now);
    };
    const activityEvents = ["pointerdown", "keydown", "touchstart", "scroll"];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, onActivity, { passive: true }));
    const timer = window.setInterval(async () => {
      const session = readStoredSession();
      const now = Date.now();
      const lastActivityAt = Math.max(session?.lastActivityAt || 0, lastInputAt);
      if (!session || session.expiresAt <= now || now - lastActivityAt >= SESSION_IDLE_TIMEOUT_MS) {
        await logout();
        setError({ code: "SESSION_EXPIRED", message: "Your session expired. Connect your wallet to continue." });
        return;
      }
      if (document.visibilityState === "visible" && now - lastInputAt < SESSION_IDLE_TIMEOUT_MS && now - lastHeartbeatAt >= 5 * 60 * 1000) {
        try {
          await recordSessionActivity();
          lastHeartbeatAt = now;
          touchStoredSession(now);
        } catch {
          // Transient network errors retry on the next interval.
        }
      }
    }, 15_000);
    return () => {
      window.clearInterval(timer);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, onActivity));
    };
  }, [status, logout, resetSession]);

  useEffect(() => subscribeToSessionChanges(() => {
    const session = readStoredSession();
    if (!session) {
      if (status === AUTH_STATUS.AUTHENTICATED) resetSession();
      return;
    }
    if (status === AUTH_STATUS.AUTHENTICATED && session.sessionId !== sessionId) {
      // Another tab replaced the shared browser session. Do not revoke the new
      // session through the shared refresh cookie; only clear this tab's state.
      resetSession({ clearStorage: false });
      return;
    }
    if (!isReady || status !== AUTH_STATUS.IDLE) return;
    setWalletAddress(session.walletAddress);
    setRole(session.role || "user");
    setSessionId(session.sessionId);
    (async () => {
      try {
        if (isMockEnabled()) {
          const { session: mockSession, user: mockUser } = mockLogin();
          setAccessToken(mockSession.accessToken);
          setApiAccessToken(mockSession.accessToken);
          setUser(mockUser);
        } else {
          const refreshed = await refreshAccessToken();
          if (!refreshed?.accessToken) throw new Error("Session expired");
          if (refreshed.walletAddress?.toLowerCase() !== session.walletAddress.toLowerCase() || refreshed.sessionId !== session.sessionId) {
            throw new Error("Session wallet does not match stored account");
          }
          writeStoredSession({
            ...session,
            expiresAt: Number(refreshed.expiresAt) || session.expiresAt,
          });
          setAccessToken(refreshed.accessToken);
          setApiAccessToken(refreshed.accessToken);
          const profileBody = await fetchProfile();
          setUser(profileBody?.user ?? profileBody ?? null);
        }
        setStatus(AUTH_STATUS.AUTHENTICATED);
      } catch {
        resetSession();
      }
    })();
  }), [isReady, status, sessionId, resetSession]);

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (!mountedRef.current) return;
      const connected = Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;
      const current = stateRef.current;

      if (!connected) {
        if (current.status === AUTH_STATUS.AUTHENTICATED && current.walletAddress) {
          logoutWallet().catch(() => {});
        }
        resetSession();
        return;
      }

      if (
        current.status === AUTH_STATUS.AUTHENTICATED &&
        normalizeAddress(connected) !== normalizeAddress(current.walletAddress)
      ) {
        logoutWallet().catch(() => {});
        resetSession();
      }
    };

    const unsubAccounts = subscribeToAccountsChanged(handleAccountsChanged);
    const unsubDisconnect = subscribeToDisconnect(() => {
      if (!mountedRef.current) return;
      const current = stateRef.current;
      if (current.status === AUTH_STATUS.AUTHENTICATED && current.walletAddress) {
        logoutWallet().catch(() => {});
      }
      resetSession();
    });

    return () => {
      unsubAccounts();
      unsubDisconnect();
    };
  }, [resetSession]);

  const value = useMemo(
    () => ({
      status,
      walletAddress,
      user,
      role,
      accessToken,
      isReady,
      error,
      isAuthenticated: status === AUTH_STATUS.AUTHENTICATED,
      connectAndAuthenticate,
      logout,
      updateUser,
      clearError,
    }),
    [
      status,
      walletAddress,
      user,
      role,
      accessToken,
      isReady,
      error,
      connectAndAuthenticate,
      logout,
      updateUser,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthProvider;

