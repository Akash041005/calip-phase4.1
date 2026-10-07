// Local watchlist store (V1, frontend-only).
// Key is versioned separately from auth so reconnecting the backend later
// only requires swapping these functions for apiFetch calls.
import { MOCK_STARTUPS } from "./startups";

const STORAGE_KEY = "calip.watchlist.v1";

// Demo seed so Profile/Watchlist show companies on first run (mock only).
// Seeded once: afterwards the stored array is authoritative, so removing
// everything stays empty.
const SEED_IDS = ["mock-nova-pay", "mock-voltgrid", "mock-fleetai"];

function readIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_IDS));
      return [...SEED_IDS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(ids) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage may be unavailable; in-memory behavior still works per call.
  }
}

export function mockGetWatchlist() {
  const ids = readIds();
  const items = ids
    .map((id) => MOCK_STARTUPS.find((s) => s._id === id))
    .filter(Boolean);
  return { items, total: items.length };
}

export function mockAddToWatchlist(startupId) {
  const ids = readIds();
  if (!MOCK_STARTUPS.some((s) => s._id === startupId)) {
    throw new Error("Startup not found in mock catalog.");
  }
  if (!ids.includes(startupId)) writeIds([...ids, startupId]);
  return { ok: true, startupId };
}

export function mockRemoveFromWatchlist(startupId) {
  writeIds(readIds().filter((id) => id !== startupId));
  return { ok: true, startupId };
}
