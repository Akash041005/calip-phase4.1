// Mock wallet auth (V1, frontend-only).
// Produces the same session shape the real backend returns so AuthProvider
// and tokenStore need no changes. Reconnect = use real authApi again.
import { writeStoredSession, clearStoredSession } from "../tokenStore";
import { MOCK_USER } from "./user";

export const MOCK_WALLET_ADDRESS = "0xMock7a11ceC4l1pD3m0F0und3r0001";
const MOCK_NONCE = "mock-nonce-calip-v1";

export function mockRequestNonce() {
  return { nonce: MOCK_NONCE };
}

export function mockLogin() {
  const session = {
    accessToken: "mock-access-token-calip-v1",
    refreshToken: "mock-refresh-token-calip-v1",
    walletAddress: MOCK_WALLET_ADDRESS,
    role: "user",
  };
  writeStoredSession(session);
  return { session, user: MOCK_USER };
}

export function mockLogout() {
  clearStoredSession();
  return { ok: true };
}
