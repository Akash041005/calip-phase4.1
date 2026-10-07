// Mock marketplace data (V1, frontend-only, DEMO).
// Shapes mirror the real /marketplace responses. Marketplace UI itself is
// intentionally not finalized; these mocks only keep existing screens working.
import { MOCK_STARTUPS } from "./startups";

function startupRef(id) {
  const s = MOCK_STARTUPS.find((x) => x._id === id);
  return {
    _id: s._id,
    startupName: s.startupName,
    industrySector: s.industrySector,
    stage: s.startupStage,
    startupStage: s.startupStage,
  };
}

const MOCK_LISTINGS = [
  {
    _id: "mock-listing-1",
    sellerId: { username: "demo_founder", walletAddress: "0xMock7a11ceC4l1pD3m0F0und3r0001" },
    startupId: startupRef("mock-nova-pay"),
    availableTokens: 40000,
    totalTokens: 100000,
    pricePerToken: 1.25,
    currency: "USDT",
    listingType: "SELL",
    status: "OPEN",
    createdAt: "2026-09-02T10:00:00.000Z",
    updatedAt: "2026-09-09T10:00:00.000Z",
  },
  {
    _id: "mock-listing-2",
    sellerId: { username: "volt_builder", walletAddress: "0xVolt...Gr05" },
    startupId: startupRef("mock-voltgrid"),
    availableTokens: 15000,
    totalTokens: 50000,
    pricePerToken: 2.1,
    currency: "USDC",
    listingType: "SELL",
    status: "OPEN",
    createdAt: "2026-08-28T10:00:00.000Z",
    updatedAt: "2026-09-07T10:00:00.000Z",
  },
  {
    _id: "mock-listing-3",
    sellerId: { username: "orbit_lab", walletAddress: "0xOrbit...La08" },
    startupId: startupRef("mock-orbitlabs"),
    availableTokens: 8000,
    totalTokens: 25000,
    pricePerToken: 3.4,
    currency: "USDT",
    listingType: "AUCTION",
    status: "PARTIALLY_FILLED",
    createdAt: "2026-08-20T10:00:00.000Z",
    updatedAt: "2026-09-05T10:00:00.000Z",
  },
];

const MOCK_HISTORY = [
  {
    _id: "mock-trade-1",
    startupName: "NovaPay",
    totalTokens: 5000,
    pricePerToken: 1.25,
    listingType: "SELL",
    status: "FILLED",
    createdAt: "2026-09-08T10:00:00.000Z",
    updatedAt: "2026-09-08T10:00:00.000Z",
  },
  {
    _id: "mock-trade-2",
    startupName: "VoltGrid",
    totalTokens: 2000,
    pricePerToken: 2.1,
    listingType: "SELL",
    status: "PARTIALLY_FILLED",
    createdAt: "2026-09-06T10:00:00.000Z",
    updatedAt: "2026-09-06T10:00:00.000Z",
  },
];

export function mockGetListings() {
  return { listings: MOCK_LISTINGS, total: MOCK_LISTINGS.length };
}

export function mockGetListingDetails(listingId) {
  return MOCK_LISTINGS.find((l) => l._id === listingId) || null;
}

export function mockCreateListing() {
  return { ok: true, _id: "mock-listing-new" };
}

export function mockBuyTokens() {
  return { ok: true };
}

export function mockCancelListing() {
  return { ok: true };
}

export function mockGetTradeHistory() {
  return { items: MOCK_HISTORY, rows: MOCK_HISTORY, total: MOCK_HISTORY.length };
}
