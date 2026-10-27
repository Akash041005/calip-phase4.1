import { apiFetch } from "./apiClient";

export async function getListings(page = 1, limit = 20) {
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const res = await apiFetch(`/marketplace/listings?${params.toString()}`, { auth: false });
    return res || { data: { listings: [], total: 0 } };
  } catch {
    return { data: { listings: [], total: 0 } };
  }
}

export async function getListingDetails(listingId) {
  try {
    const res = await apiFetch(`/marketplace/${listingId}`, { auth: false });
    return res || null;
  } catch {
    return null;
  }
}

export async function createListing({ startupId, paymentToken, tokenAmount, pricePerToken }) {
  return apiFetch("/marketplace/list", {
    method: "POST",
    auth: true,
    body: { startupId, paymentToken, tokenAmount, pricePerToken },
  });
}

export async function buyTokens({ listingId, tokenAmount, maxPaymentAmount }) {
  return apiFetch("/marketplace/buy", {
    method: "POST",
    auth: true,
    body: { listingId, tokenAmount, maxPaymentAmount },
  });
}

export async function cancelListing(listingId) {
  return apiFetch(`/marketplace/cancel/${listingId}`, {
    method: "POST",
    auth: true,
  });
}

export async function getTradeHistory(page = 1, limit = 20) {
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const res = await apiFetch(`/marketplace/history?${params.toString()}`, { auth: false });
    return res || { data: { trades: [], total: 0 } };
  } catch {
    return { data: { trades: [], total: 0 } };
  }
}