import { apiFetch } from "./apiClient";

export async function getTrendingNews(category = "All", page = 1, limit = 10) {
  try {
    const params = new URLSearchParams();
    if (category && category !== "All") params.set("category", category);
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await apiFetch(`/news/trending${qs}`);
    return res || { data: [] };
  } catch {
    return { data: [] };
  }
}

export async function createAdminNews(newsData) {
  return apiFetch("/admin/news", {
    method: "POST",
    auth: true,
    body: newsData,
  });
}

export async function updateAdminNews(id, newsData) {
  return apiFetch(`/admin/news/${id}`, {
    method: "PUT",
    auth: true,
    body: newsData,
  });
}

export async function deleteAdminNews(id) {
  return apiFetch(`/admin/news/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
