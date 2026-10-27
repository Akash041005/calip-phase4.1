import { apiFetch } from "./apiClient";

export async function searchStartups(keyword = "", page = 1, limit = 50) {
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (keyword) params.set("keyword", keyword);
    const res = await apiFetch(`/startups/search?${params.toString()}`);
    return res || { data: { startups: [], total: 0 } };
  } catch {
    return { data: { startups: [], total: 0 } };
  }
}

export async function getStartupById(id) {
  try {
    const res = await apiFetch(`/startups/${id}`);
    return res || null;
  } catch {
    return null;
  }
}
