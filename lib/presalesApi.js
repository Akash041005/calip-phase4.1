import { apiFetch } from "./apiClient";
import { isMockEnabled } from "./mock/enabled";
import { mockDelay } from "./mock/delay";
import { mockPresales, mockPresaleBids } from "./mock/content";

export function isPresaleOpenForBidding(presale, now = Date.now()) {
  if (presale?.status !== "active") return false;
  const startDate = presale?.startDate ? new Date(presale.startDate).getTime() : null;
  const endDate = presale?.endDate ? new Date(presale.endDate).getTime() : null;

  if (Number.isFinite(endDate) && now > endDate) return false;
  if (Number.isFinite(startDate) && startDate > now + 60000) return false;
  return true;
}

export function isPresaleEnded(presale, now = Date.now()) {
  if (presale?.status === "completed" || presale?.status === "cancelled") return true;
  const endDate = new Date(presale?.endDate).getTime();
  return Number.isFinite(endDate) && endDate < now;
}

export async function getActivePresales() {
  if (isMockEnabled()) {
    await mockDelay();
    return { data: mockPresales().active };
  }
  try {
    const res = await apiFetch("/presales/active", { auth: false });
    const list = res?.data ?? (Array.isArray(res) ? res : []);
    return { data: Array.isArray(list) ? list : [] };
  } catch {
    return { data: [] };
  }
}

export async function getUpcomingPresales() {
  if (isMockEnabled()) {
    await mockDelay();
    return { data: mockPresales().upcoming };
  }
  try {
    const res = await apiFetch("/presales/upcoming", { auth: false });
    const list = res?.data ?? (Array.isArray(res) ? res : []);
    return { data: Array.isArray(list) ? list : [] };
  } catch {
    return { data: [] };
  }
}

export async function getCompletedPresales() {
  if (isMockEnabled()) {
    await mockDelay();
    return { data: mockPresales().completed };
  }
  try {
    const res = await apiFetch("/presales/completed", { auth: false });
    const list = res?.data ?? (Array.isArray(res) ? res : []);
    return { data: Array.isArray(list) ? list : [] };
  } catch {
    return { data: [] };
  }
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
  try {
    const res = await apiFetch(`/presales/${presaleId}/bids`, { auth: false });
    const list = res?.data ?? (Array.isArray(res) ? res : []);
    return { data: Array.isArray(list) ? list : [] };
  } catch {
    return { data: [] };
  }
}

export async function getPresaleById(presaleId) {
  try {
    const res = await apiFetch(`/presales/${presaleId}`, { auth: false });
    return res?.data ?? res;
  } catch {
    return null;
  }
}

export async function getPresaleByStartupId(startupId) {
  try {
    const res = await apiFetch(`/presales/startup/${startupId}`, { auth: false });
    return res?.data ?? res;
  } catch {
    return null;
  }
}

