import { apiFetch } from "./apiClient";

export async function uploadStartup(formData) {
  return apiFetch("/startups/upload", { method: "POST", formData, auth: true });
}
