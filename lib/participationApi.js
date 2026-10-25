import { apiFetch } from "./apiClient";

export async function getParticipationHistory() {
  return apiFetch("/participation/history", { auth: true });
}
