import { apiFetch } from "./apiClient";
import { isMockEnabled } from "./mock/enabled";
import { mockDelay } from "./mock/delay";
import { mockParticipationHistory } from "./mock/content";

export async function getParticipationHistory() {
  if (isMockEnabled()) {
    await mockDelay();
    return mockParticipationHistory();
  }
  return apiFetch("/participation/history", { auth: true });
}
