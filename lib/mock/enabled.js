// Mock-mode switch — BACKEND-FIRST (Sep 2026).
//
// All lib/*Api modules now hit the real backend by default. Mock files under
// lib/mock/ are kept for reference but are no longer served.
export function isMockEnabled() {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.NEXT_PUBLIC_USE_MOCKS === "true";
}
