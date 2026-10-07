import { apiFetch } from "./apiClient";
import { isMockEnabled } from "./mock/enabled";
import { mockDelay } from "./mock/delay";
import { mockAIInsights, mockStartupMetrics } from "./mock/content";

export async function getAIInsights(startupId) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockAIInsights(startupId);
  }
  return apiFetch(`/insights/${startupId}`, { auth: true });
}

export async function getStartupMetrics(startupId) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockStartupMetrics(startupId);
  }
  return apiFetch(`/oracle/metrics/${startupId}`);
}
