import { apiFetch } from "./apiClient";
import { isMockEnabled } from "./mock/enabled";
import { mockDelay } from "./mock/delay";
import { mockGetMyStartups } from "./mock/startups";

export async function getMyStartups() {
  if (isMockEnabled()) {
    await mockDelay();
    return mockGetMyStartups();
  }
  return apiFetch("/startups", { auth: true });
}

export async function updateStartup(id, data) {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true, _id: id, ...data };
  }
  return apiFetch(`/startups/${id}`, { method: "PATCH", body: data, auth: true });
}

export async function deleteStartup(id) {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true, _id: id };
  }
  return apiFetch(`/startups/${id}`, { method: "DELETE", auth: true });
}

