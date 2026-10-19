import { apiFetch } from "./apiClient";
import { isMockEnabled } from "./mock/enabled";
import { mockDelay } from "./mock/delay";

export async function submitGeneralEnquiry({ name, email, subject, message }) {
  if (isMockEnabled()) {
    await mockDelay(400);
    return { success: true, message: "Enquiry submitted successfully" };
  }
  return apiFetch("/enquiry", {
    method: "POST",
    body: { name, email, subject, message },
  });
}

export async function submitInvestorContact({ name, email, organization, ticketSize, interests, message }) {
  if (isMockEnabled()) {
    await mockDelay(400);
    return { success: true, message: "Investor inquiry submitted successfully" };
  }
  return apiFetch("/contact/investor", {
    method: "POST",
    body: { name, email, organization, ticketSize, interests, message },
  });
}
