import { apiFetch } from "./apiClient";
import { isMockEnabled } from "./mock/enabled";
import { mockDelay } from "./mock/delay";

export async function uploadStartup(formData) {
  if (isMockEnabled()) {
    await mockDelay(500);
    return { ok: true, _id: "mock-startup-new" };
  }
  return apiFetch("/startups/upload", { method: "POST", formData });
}
