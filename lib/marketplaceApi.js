import { apiFetch } from "./apiClient";
import { isMockEnabled } from "./mock/enabled";
import { mockDelay } from "./mock/delay";
import {
  mockGetListings,
  mockGetListingDetails,
  mockCreateListing,
  mockBuyTokens,
  mockCancelListing,
  mockGetTradeHistory,
} from "./mock/marketplace";

export async function getListings(page = 1, limit = 20) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockGetListings(page, limit);
  }
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const res = await apiFetch(`/marketplace/listings?${params.toString()}`, { auth: false });
    return res || { data: { listings: [], total: 0 } };
  } catch {
    return { data: { listings: [], total: 0 } };
  }
}

export async function getListingDetails(listingId) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockGetListingDetails(listingId);
  }
  try {
    const res = await apiFetch(`/marketplace/${listingId}`, { auth: false });
    return res || null;
  } catch {
    return null;
  }
}

export async function createListing({ startupId, paymentToken, tokenAmount, pricePerToken }) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockCreateListing({ startupId, paymentToken, tokenAmount, pricePerToken });
  }
  return apiFetch("/marketplace/list", {
    method: "POST",
    auth: true,
    body: { startupId, paymentToken, tokenAmount, pricePerToken },
  });
}

export async function buyTokens({ listingId, tokenAmount, maxPaymentAmount }) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockBuyTokens({ listingId, tokenAmount, maxPaymentAmount });
  }
  return apiFetch("/marketplace/buy", {
    method: "POST",
    auth: true,
    body: { listingId, tokenAmount, maxPaymentAmount },
  });
}

export async function updateListingPrice(listingId, pricePerToken) {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true, listingId, pricePerToken };
  }
  return apiFetch(`/marketplace/${listingId}/price`, {
    method: "PUT",
    auth: true,
    body: { pricePerToken },
  });
}

export async function cancelListing(listingId) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockCancelListing(listingId);
  }
  return apiFetch(`/marketplace/${listingId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function getTradeHistory(page = 1, limit = 20) {
  if (isMockEnabled()) {
    await mockDelay();
    return mockGetTradeHistory(page, limit);
  }
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const res = await apiFetch(`/marketplace/history?${params.toString()}`, { auth: false });
    return res || { data: { trades: [], total: 0 } };
  } catch {
    return { data: { trades: [], total: 0 } };
  }
}