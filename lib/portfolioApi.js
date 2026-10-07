import { apiFetch } from "./apiClient";
import { isMockEnabled } from "./mock/enabled";
import { mockDelay } from "./mock/delay";
import {
  mockPortfolioSummary,
  mockPortfolioHistory,
  mockPortfolioAllocation,
  mockPerformanceSummary,
  mockParticipationHistory,
  mockTrending,
} from "./mock/content";

export async function getPortfolioSummary() {
  if (isMockEnabled()) {
    await mockDelay();
    return mockPortfolioSummary();
  }
  return apiFetch("/portfolio/summary", { auth: true });
}

export async function getPortfolioHistory() {
  if (isMockEnabled()) {
    await mockDelay();
    return mockPortfolioHistory();
  }
  return apiFetch("/portfolio/history", { auth: true });
}

export async function getPortfolioAllocation() {
  if (isMockEnabled()) {
    await mockDelay();
    return mockPortfolioAllocation();
  }
  return apiFetch("/portfolio/allocation", { auth: true });
}

export async function getPerformanceSummary(from, to) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockPerformanceSummary(from, to);
  }
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/performance/summary${qs}`, { auth: true });
}

export async function getPortfolioActivity() {
  if (isMockEnabled()) {
    await mockDelay();
    return mockParticipationHistory();
  }
  return apiFetch("/participation/history", { auth: true });
}

export async function getPortfolioRecommendations() {
  if (isMockEnabled()) {
    await mockDelay();
    return mockTrending();
  }
  return apiFetch("/analytics/trending", { auth: true });
}

// Backward compatibility aliases
export const getPortfolioStats = getPortfolioSummary;
export const getPortfolioChart = getPortfolioHistory;
export const getPortfolioSectors = getPortfolioAllocation;
