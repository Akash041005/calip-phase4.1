import { apiFetch } from "./apiClient";
import { isMockEnabled } from "./mock/enabled";
import { mockDelay } from "./mock/delay";
import { mockTrendingNews } from "./mock/content";

export async function getTrendingNews(category = "All", page = 1, limit = 10) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockTrendingNews(category, page, limit);
  }
  const params = new URLSearchParams();
  if (category && category !== "All") params.set("category", category);
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/news/trending${qs}`);
}

export async function createAdminNews(newsData) {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true, news: newsData };
  }
  return apiFetch("/admin/news", {
    method: "POST",
    auth: true,
    body: newsData,
  });
}

export async function updateAdminNews(id, newsData) {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true, id, news: newsData };
  }
  return apiFetch(`/admin/news/${id}`, {
    method: "PUT",
    auth: true,
    body: newsData,
  });
}

export async function deleteAdminNews(id) {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true, id };
  }
  return apiFetch(`/admin/news/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
