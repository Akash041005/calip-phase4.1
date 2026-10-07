import { apiFetch } from "./apiClient";
import { isMockEnabled } from "./mock/enabled";
import { mockDelay } from "./mock/delay";
import { mockRequestNonce, mockLogin, mockLogout } from "./mock/auth";
import { mockFetchProfile } from "./mock/user";

export async function requestNonce(walletAddress) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockRequestNonce(walletAddress);
  }
  return apiFetch("/auth/nonce", { method: "POST", auth: false, body: { walletAddress } });
}

export async function verifyWallet(walletAddress, signature) {
  if (isMockEnabled()) {
    await mockDelay();
    const { session } = mockLogin();
    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      role: session.role,
    };
  }
  return apiFetch("/auth/verify", { method: "POST", auth: false, body: { walletAddress, signature } });
}

export async function refreshAccessToken(refreshToken) {
  if (isMockEnabled()) {
    await mockDelay();
    return { accessToken: "mock-access-token-calip-v1" };
  }
  return apiFetch("/auth/refresh", { method: "POST", auth: false, retry: false, body: { refreshToken } });
}

export async function logoutWallet(walletAddress) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockLogout(walletAddress);
  }
  return apiFetch("/auth/logout", { method: "POST", auth: false, retry: false, body: { walletAddress } });
}

export async function fetchProfile() {
  if (isMockEnabled()) {
    await mockDelay();
    return mockFetchProfile();
  }
  return apiFetch("/users/profile", { auth: true });
}

export async function updateUserProfile(formData) {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true, user: mockFetchProfile().user };
  }
  return apiFetch("/users/profile", { method: "PUT", auth: true, formData });
}

export async function updateUserSecurity(payload) {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true, security: payload };
  }
  return apiFetch("/users/security", { method: "PUT", auth: true, body: payload });
}
