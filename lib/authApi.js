import { apiFetch } from "./apiClient";

export async function requestNonce(walletAddress, chainId) {
  return apiFetch("/auth/nonce", { method: "POST", auth: false, body: { walletAddress, chainId } });
}

export async function verifyWallet(walletAddress, signature) {
  return apiFetch("/auth/verify", { method: "POST", auth: false, body: { walletAddress, signature } });
}

export async function refreshAccessToken(tokenParam) {
  const token = typeof tokenParam === "string" && tokenParam ? tokenParam : undefined;
  const body = token ? { refreshToken: token } : undefined;
  return apiFetch("/auth/refresh", { method: "POST", auth: false, retry: false, body });
}

export async function logoutWallet() {
  return apiFetch("/auth/logout", { method: "POST", auth: true, body: {} });
}

export async function recordSessionActivity() {
  return apiFetch("/auth/activity", { method: "POST", auth: true });
}

export async function fetchProfile() {
  return apiFetch("/users/profile", { auth: true });
}

export async function updateUserProfile(formData) {
  return apiFetch("/users/profile", { method: "PUT", auth: true, formData });
}

export async function updateUserSecurity(payload) {
  return apiFetch("/users/security", { method: "PUT", auth: true, body: payload });
}
