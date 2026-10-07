// Mock content/analytics/portfolio/participation/presales/news (V1).
// Minimal shapes matching what dashboard, insights and activity UI consume.
import { MOCK_STARTUPS } from "./startups";

export function mockPortfolioSummary() {
  return {
    summary: { currentValue: 125000, profitLoss: 18000, roi: 16.8 },
    holdings: [
      { startupId: "mock-nova-pay", tokensHeld: 5000 },
      { startupId: "mock-voltgrid", tokensHeld: 2000 },
    ],
  };
}

export function mockPortfolioHistory() {
  return {
    data: [
      { month: "Jan", value: 0 },
      { month: "Feb", value: 12000 },
      { month: "Mar", value: 18500 },
      { month: "Apr", value: 24000 },
      { month: "May", value: 31000 },
      { month: "Jun", value: 45000 },
    ],
  };
}

export function mockPortfolioAllocation() {
  return {
    data: [
      { sector: "FinTech", percentage: 35 },
      { sector: "AI & ML", percentage: 28 },
      { sector: "CleanTech", percentage: 22 },
      { sector: "HealthTech", percentage: 15 },
    ],
  };
}

export function mockPerformanceSummary() {
  return { summary: { totalInvested: 107000, currentValue: 125000, roi: 16.8 } };
}

export function mockParticipationHistory() {
  return {
    data: [
      {
        _id: "mock-part-1",
        status: "confirmed",
        tokens: 5000,
        amount: 6250,
        createdAt: "2026-09-08T10:00:00.000Z",
        presaleId: { title: "NovaPay community round" },
      },
    ],
  };
}

export function mockAnalyticsStartup(id) {
  return { startupId: id, aiScore: 86, views: 1840, trend: "up" };
}

export function mockTrending() {
  return {
    data: [
      { startupName: "NovaPay", industrySector: "FinTech", aiScore: 94 },
      { startupName: "FleetAI", industrySector: "AI & ML", aiScore: 91 },
      { startupName: "VoltGrid", industrySector: "CleanTech", aiScore: 89 },
    ],
  };
}

export function mockAIInsights(startupId) {
  return {
    startupId,
    summary: "Demo insight: steady traction in a large domestic market. Verify all claims independently.",
    strengths: ["Clear problem statement", "Early user interest"],
    risks: ["Limited public data", "Market execution risk"],
  };
}

export function mockStartupMetrics(startupId) {
  return { startupId, views: 1200, watchers: 84 };
}

function mockPresale(startupId, status, tokenPrice, totalTokens, soldTokens, description) {
  const s = MOCK_STARTUPS.find((x) => x._id === startupId);
  return {
    _id: `mock-presale-${startupId.replace(/^mock-/, "")}-${status}`,
    startupId: {
      _id: s._id,
      startupName: s.startupName,
      industrySector: s.industrySector,
    },
    description: description || s.description,
    status,
    tokenPrice,
    totalTokens,
    soldTokens,
  };
}

const MOCK_ACTIVE_PRESALES = [
  mockPresale("mock-nova-pay", "active", 42, 100000, 62350, "Live community round for NovaPay merchant-credit rails."),
  mockPresale("mock-voltgrid", "active", 35, 80000, 31200, "Live allocation for VoltGrid battery-swap micro-grids."),
  mockPresale("mock-fleetai", "active", 58, 120000, 89400, "Live round for FleetAI mid-mile routing models."),
];

const MOCK_UPCOMING_PRESALES = [
  mockPresale("mock-medisync", "upcoming", 28, 60000, 0, "Upcoming clinic-network round opening soon."),
  mockPresale("mock-orbitlabs", "upcoming", 64, 50000, 0, "Upcoming ground-station kit allocation."),
];

const MOCK_COMPLETED_PRESALES = [
  mockPresale("mock-craftkart", "completed", 18, 40000, 40000, "Fully subscribed artisan storefront round."),
  mockPresale("mock-swaadbox", "completed", 22, 45000, 38250, "Closed cloud-kitchen expansion round."),
];

const MOCK_PRESALE_BIDS = [
  { _id: "mock-bid-1", bidAmount: 50000, tokenAmount: 100, createdAt: "2026-09-08T10:00:00.000Z" },
  { _id: "mock-bid-2", bidAmount: 25000, tokenAmount: 50, createdAt: "2026-09-07T10:00:00.000Z" },
];

// Deterministic per-presale bid ladder (newest last). Shape mirrors
// GET /presales/:id/bids so the UI needs no changes on reconnect.
export function mockPresaleBids(presaleId = "") {
  let h = 2166136261;
  for (let i = 0; i < presaleId.length; i++) {
    h ^= presaleId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h |= 0;
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const base = 20000 + (h % 60000);
  const count = 5 + (h % 4);
  const now = Date.now();
  const bids = [];
  let amount = base;
  for (let i = 0; i < count; i++) {
    amount = Math.round(amount * (1.04 + rand() * 0.12));
    const tokens = 20 + Math.round(rand() * 180);
    const addr = `0x${(h % 0xffff).toString(16).padStart(4, "0")}…${(i * 7919 % 0xffff).toString(16).padStart(4, "0")}`;
    bids.push({
      _id: `mock-bid-${presaleId}-${i}`,
      bidder: addr,
      bidAmount: amount,
      tokenAmount: tokens,
      createdAt: new Date(now - (count - i) * 7 * 3600000).toISOString(),
    });
    h = (h + 0x9e3779b9) | 0;
  }
  return bids;
}

export function mockPresales() {
  return {
    active: MOCK_ACTIVE_PRESALES,
    upcoming: MOCK_UPCOMING_PRESALES,
    completed: MOCK_COMPLETED_PRESALES,
    bids: MOCK_PRESALE_BIDS,
  };
}

export function mockTrendingNews() {
  return {
    items: [
      { _id: "mock-news-1", title: "Demo: UPI credit rails gain pace", category: "FinTech" },
      { _id: "mock-news-2", title: "Demo: Battery swapping pilots expand", category: "CleanTech" },
    ],
    total: 2,
  };
}
