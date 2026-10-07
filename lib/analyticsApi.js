import { apiFetch } from "./apiClient";
import { isMockEnabled } from "./mock/enabled";
import { mockDelay } from "./mock/delay";
import { mockAnalyticsStartup, mockTrending } from "./mock/content";
import { MOCK_STARTUPS } from "./mock/startups";

export async function getAnalyticsStartup(id) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockAnalyticsStartup(id);
  }
  return apiFetch(`/analytics/startups/${id}`, { auth: true });
}

export async function getTrending() {
  if (isMockEnabled()) {
    await mockDelay();
    return mockTrending();
  }
  return apiFetch("/analytics/trending", { auth: true });
}

export async function getLeaderboard() {
  if (isMockEnabled()) {
    await mockDelay();
    return { data: mockTrending().data };
  }
  return apiFetch("/analytics/leaderboard", { auth: true });
}

export async function getFundingBySector() {
  if (isMockEnabled()) {
    await mockDelay();
    return {
      data: [
        { sector: "FinTech", total: 45000000 },
        { sector: "AI & ML", total: 61000000 },
        { sector: "CleanTech", total: 52000000 },
      ],
    };
  }
  return apiFetch("/analytics/funding-by-sector", { auth: true });
}

export async function getDealStages() {
  if (isMockEnabled()) {
    await mockDelay();
    return { data: [{ stage: "Seed", count: 6 }, { stage: "Pre-Seed", count: 4 }] };
  }
  return apiFetch("/analytics/deal-stages", { auth: true });
}

export async function getMonthlyActivity() {
  if (isMockEnabled()) {
    await mockDelay();
    return { data: [{ month: "Sep", count: 12 }] };
  }
  return apiFetch("/analytics/monthly-activity", { auth: true });
}

export async function getStartupComparison(ids = []) {
  if (isMockEnabled()) {
    await mockDelay();
    const list = Array.isArray(ids) && ids.length > 0
      ? MOCK_STARTUPS.filter((s) => ids.includes(s._id))
      : MOCK_STARTUPS.slice(0, 4);
    return { data: list };
  }
  const idsStr = Array.isArray(ids) ? ids.join(",") : ids;
  return apiFetch(`/analytics/startup-comparison?ids=${encodeURIComponent(idsStr)}`, { auth: true });
}
