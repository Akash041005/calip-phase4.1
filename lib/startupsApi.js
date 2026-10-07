import { apiFetch } from "./apiClient";
import { isMockEnabled } from "./mock/enabled";
import { mockDelay } from "./mock/delay";
import { mockSearchStartups, mockGetStartupById } from "./mock/startups";

export async function searchStartups(keyword = "", page = 1, limit = 50) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockSearchStartups(keyword, page, limit);
  }
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (keyword) params.set("keyword", keyword);
  return apiFetch(`/startups/search?${params.toString()}`);
}

export async function getStartupById(id) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockGetStartupById(id);
  }
  return apiFetch(`/startups/${id}`);
}
