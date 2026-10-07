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
} from "../../lib/authApi";
import {
  readStoredSession,
  writeStoredSession,
  clearStoredSession,
} from "../../lib/tokenStore";
import { onAuthFailure, onTokenRefreshed, ApiError } from "../../lib/apiClient";
import { isMockEnabled } from "../../lib/mock/enabled";
import { mockLogin } from "../../lib/mock/auth";

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
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [error, setError] = useState(null);

  const stateRef = useRef(null);
  // Keep latest auth snapshot without running this effect on every render
  // (e.g. accessToken refreshes, error toasts). Only identity fields matter here.
  useEffect(() => {
    stateRef.current = { status, walletAddress, user, role };
  }, [status, walletAddress, user, role]);

  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const restoreStartedRef = useRef(false);

  const clearError = useCallback(() => setError(null), []);

  const resetSession = useCallback(() => {
    clearStoredSession();
    setWalletAddress(null);
    setUser(null);
    setRole(null);
    setAccessToken(null);
    setRefreshToken(null);
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
      // Mock mode (V1): one-click demo login, no wallet or backend.
      if (isMockEnabled()) {
        setStatus(AUTH_STATUS.CONNECTING);
        const { session, user: mockUser } = mockLogin();
        setAccessToken(session.accessToken);
        setRefreshToken(session.refreshToken);
        setWalletAddress(session.walletAddress);
        setRole(session.role);
        setUser(mockUser);
        if (mountedRef.current) {
          setStatus(AUTH_STATUS.AUTHENTICATED);
        }
        return;
      }

      setStatus(AUTH_STATUS.CONNECTING);

      const address = await connectWallet();

      const nonceBody = await requestNonce(address);
      const nonce = nonceBody?.nonce;
      if (!nonce) {
        throw new ApiError("The server did not return a nonce.", 0, null);
      }

      setStatus(AUTH_STATUS.SIGNING);
      const message = `Sign this nonce to login: ${nonce}`;
      const signature = await signWalletMessage(message, address);

      setStatus(AUTH_STATUS.AUTHENTICATING);
      const verifyBody = await verifyWallet(address, signature);
      const token = verifyBody?.accessToken;
      const refresh = verifyBody?.refreshToken;
      if (!token || !refresh) {
        throw new ApiError(
          "Authentication failed. The server did not return valid tokens.",
          0,
          null
        );
      }

      const session = {
        accessToken: token,
        refreshToken: refresh,
        walletAddress: address,
        role: verifyBody.role || "user",
      };
      writeStoredSession(session);
      setAccessToken(token);
      setRefreshToken(refresh);
      setWalletAddress(address);
      setRole(session.role);

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
      }
    } catch (err) {
      applyError(err);
    } finally {
      busyRef.current = false;
    }
  }, [applyError]);

  const logout = useCallback(async () => {
    const address = stateRef.current.walletAddress;
    busyRef.current = true;
    try {
      if (address) {
        await logoutWallet(address);
      }
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
    restoreStartedRef.current = false;
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
      if (mountedRef.current) setAccessToken(newToken);
    });
    return () => {
      unsubFailure();
      unsubToken();
    };
  }, [resetSession]);

  useEffect(() => {
    const session = readStoredSession();
    if (!session || restoreStartedRef.current) return;
    restoreStartedRef.current = true;

    (async () => {
      setAccessToken(session.accessToken);
      setRefreshToken(session.refreshToken);
      setWalletAddress(session.walletAddress);
      setRole(session.role || "user");
      try {
        const profileBody = await fetchProfile();
        if (mountedRef.current) {
          setUser(profileBody?.user ?? profileBody ?? null);
          setStatus(AUTH_STATUS.AUTHENTICATED);
        }
      } catch {
        // 401 → the refresh interceptor retries; if refresh fails,
        // onAuthFailure already reset the session to the signed-out state.
      }
    })();
  }, []);

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (!mountedRef.current) return;
      const connected = Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;
      const current = stateRef.current;

      if (!connected) {
        if (current.status === AUTH_STATUS.AUTHENTICATED && current.walletAddress) {
          logoutWallet(current.walletAddress).catch(() => {});
        }
        resetSession();
        return;
      }

      if (
        current.status === AUTH_STATUS.AUTHENTICATED &&
        normalizeAddress(connected) !== normalizeAddress(current.walletAddress)
      ) {
        logoutWallet(current.walletAddress).catch(() => {});
        resetSession();
      }
    };

    const unsubAccounts = subscribeToAccountsChanged(handleAccountsChanged);
    const unsubDisconnect = subscribeToDisconnect(() => {
      if (!mountedRef.current) return;
      const current = stateRef.current;
      if (current.status === AUTH_STATUS.AUTHENTICATED && current.walletAddress) {
        logoutWallet(current.walletAddress).catch(() => {});
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
      refreshToken,
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
      refreshToken,
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

