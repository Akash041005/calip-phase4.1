import { apiFetch } from "./apiClient";

export async function submitGeneralEnquiry({ name, email, subject, message }) {
  return apiFetch("/enquiry", {
    method: "POST",
    body: { name, email, subject, message },
  });
}

export async function submitInvestorContact({ name, email, organization, ticketSize, interests, message }) {
  return apiFetch("/contact/investor", {
    method: "POST",
    body: { name, email, organization, ticketSize, interests, message },
  });
}
