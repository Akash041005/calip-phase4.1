import { apiFetch } from "./apiClient";

export async function getAIInsights(startupId) {
  return apiFetch(`/insights/${startupId}`, { auth: true });
}

export async function getStartupMetrics(startupId) {
  return apiFetch(`/oracle/metrics/${startupId}`);
}
