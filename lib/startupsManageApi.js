import { apiFetch } from "./apiClient";

export async function getMyStartups() {
  return apiFetch("/startups", { auth: true });
}

export async function updateStartup(id, data) {
  return apiFetch(`/startups/${id}`, { method: "PATCH", body: data, auth: true });
}

export async function deleteStartup(id) {
  return apiFetch(`/startups/${id}`, { method: "DELETE", auth: true });
}
