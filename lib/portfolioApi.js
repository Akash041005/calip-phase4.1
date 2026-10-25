import { apiFetch } from "./apiClient";

export async function getPortfolioSummary() {
  return apiFetch("/portfolio/summary", { auth: true });
}

export async function getPortfolioHistory() {
  return apiFetch("/portfolio/history", { auth: true });
}

export async function getPortfolioAllocation() {
  return apiFetch("/portfolio/allocation", { auth: true });
}

export async function getPerformanceSummary(from, to) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/performance/summary${qs}`, { auth: true });
}

export async function getPortfolioActivity() {
  return apiFetch("/participation/history", { auth: true });
}

export async function getPortfolioRecommendations() {
  return apiFetch("/analytics/trending", { auth: true });
}

// Backward compatibility aliases
export const getPortfolioStats = getPortfolioSummary;
export const getPortfolioChart = getPortfolioHistory;
export const getPortfolioSectors = getPortfolioAllocation;
