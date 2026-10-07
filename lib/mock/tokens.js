// Mock token catalog for the Marketplace DESIGN prototype (V1).
//
// Derived from MOCK_STARTUPS so every token maps 1:1 to a startup and the
// existing watchlist store (keyed by startup _id) works unchanged. All series
// are deterministic (seeded by token id) so renders are stable. When the
// backend arrives, replace getMockTokens()/getMockTokenById() with API calls
// returning the same shape — components need no changes.

import { MOCK_STARTUPS } from "./startups";

const FOUNDERS = [
  "Aarav Mehta",
  "Priya Nair",
  "Rohan Iyer",
  "Sneha Kulkarni",
  "Vikram Rao",
  "Ananya Das",
  "Karan Shah",
  "Divya Menon",
  "Arjun Patel",
  "Ishita Verma",
];

const BASE_PRICES = [4.25, 1.1, 2.8, 0.65, 3.9, 1.5, 0.85, 5.6, 1.9, 4.7];
const BASE_CHANGES = [18.42, 6.2, -2.4, 11.8, 4.1, -5.6, 2.2, 9.7, -1.3, 14.6];
// Hours since creation, staggered so index 0 is the latest token.
const CREATED_HOURS_AGO = [6, 26, 49, 73, 97, 130, 170, 210, 250, 300];

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Deterministic OHLC candles ending in the direction of `changePct`.
// Each candle: { o, h, l, c } in walk units (not prices — scale at render).
export function mockCandles(seedStr, count = 24, changePct = 5) {
  const rand = mulberry32(hashSeed(`${seedStr}-candles`));
  const drift = changePct / 100 / count;
  let open = 100;
  const out = [];
  for (let i = 0; i < count; i++) {
    const close = open * (1 + drift + (rand() - 0.48) * 0.035);
    const high = Math.max(open, close) * (1 + rand() * 0.012);
    const low = Math.min(open, close) * (1 - rand() * 0.012);
    out.push({
      o: Number(open.toFixed(2)),
      h: Number(high.toFixed(2)),
      l: Number(low.toFixed(2)),
      c: Number(close.toFixed(2)),
    });
    open = close;
  }
  return out;
}

// Random-walk series of `points` ending in the direction of `changePct`.
export function mockSeries(seedStr, points = 18, changePct = 5) {
  const rand = mulberry32(hashSeed(seedStr));
  const drift = changePct / 100 / points;
  let value = 100;
  const out = [];
  for (let i = 0; i < points; i++) {
    value += value * (drift + (rand() - 0.48) * 0.03);
    out.push(Number(value.toFixed(2)));
  }
  return out;
}

function buildToken(startup, index) {
  const change24h = BASE_CHANGES[index % BASE_CHANGES.length];
  const createdAt = new Date(Date.now() - CREATED_HOURS_AGO[index % CREATED_HOURS_AGO.length] * 3600000).toISOString();
  return {
    id: `tok-${startup._id.replace(/^mock-/, "")}`,
    startupId: startup._id,
    name: startup.startupName,
    symbol: startup.symbol,
    sector: startup.industrySector,
    stage: startup.startupStage,
    price: BASE_PRICES[index % BASE_PRICES.length],
    change24h,
    sparkline: mockSeries(startup._id, 18, change24h),
    createdAt,
    founder: FOUNDERS[index % FOUNDERS.length],
    about: startup.description,
    metrics: {
      holders: 400 + ((hashSeed(startup._id) % 2400)),
      volume24h: Math.round(startup.currentStartupValuation * 0.004),
      marketCap: startup.currentStartupValuation,
    },
  };
}

const MOCK_TOKENS = MOCK_STARTUPS.map(buildToken);

export function getMockTokens() {
  return MOCK_TOKENS;
}

export function getMockTokenById(id) {
  return MOCK_TOKENS.find((t) => t.id === id) || null;
}

export function getLatestMockToken() {
  return [...MOCK_TOKENS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
}
