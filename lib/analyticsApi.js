import { apiFetch } from "./apiClient";

export async function getAnalyticsStartup(id) {
  return apiFetch(`/analytics/startups/${id}`, { auth: false });
}

export async function getTrending() {
  return apiFetch("/analytics/trending", { auth: false });
}

export async function getLeaderboard() {
  return apiFetch("/analytics/leaderboard", { auth: false });
}

export async function getFundingBySector() {
  return apiFetch("/analytics/funding-by-sector", { auth: false });
}

export async function getDealStages() {
  return apiFetch("/analytics/deal-stages", { auth: false });
}

export async function getMonthlyActivity() {
  return apiFetch("/analytics/monthly-activity", { auth: false });
}

export async function getStartupComparison(ids = []) {
  const idsStr = Array.isArray(ids) ? ids.join(",") : ids;
  return apiFetch(`/analytics/startup-comparison?ids=${encodeURIComponent(idsStr)}`, { auth: false });
}
