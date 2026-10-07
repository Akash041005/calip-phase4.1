import { apiFetch } from "./apiClient";
import { isMockEnabled } from "./mock/enabled";
import { mockDelay } from "./mock/delay";
import { mockPresales, mockPresaleBids } from "./mock/content";

export async function getActivePresales() {
  if (isMockEnabled()) {
    await mockDelay();
    return { data: mockPresales().active };
  }
  return apiFetch("/presales/active", { auth: true });
}

export async function getUpcomingPresales() {
  if (isMockEnabled()) {
    await mockDelay();
    return { data: mockPresales().upcoming };
  }
  return apiFetch("/presales/upcoming", { auth: true });
}

export async function getCompletedPresales() {
  if (isMockEnabled()) {
    await mockDelay();
    return { data: mockPresales().completed };
  }
  return apiFetch("/presales/completed", { auth: true });
}

export async function placePresaleBid(presaleId, { bidAmount, tokenAmount }) {
  if (isMockEnabled()) {
    await mockDelay();
    return { ok: true, presaleId, bidAmount, tokenAmount };
  }
  return apiFetch(`/presales/${presaleId}/bids`, {
    method: "POST",
    auth: true,
    body: { bidAmount, tokenAmount },
  });
}

export async function getPresaleBids(presaleId) {
  if (isMockEnabled()) {
    await mockDelay();
    return { data: mockPresaleBids(presaleId) };
  }
  return apiFetch(`/presales/${presaleId}/bids`, { auth: true });
}
