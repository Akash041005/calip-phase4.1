import { apiFetch } from "./apiClient";
import { getMockTokens } from "./mock/tokens";
import { isMockEnabled } from "./mock/enabled";

function unwrap(res) {
  if (!res) return null;
  return res.data ?? res;
}

function formatCompact(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "$0";
  if (Math.abs(num) >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (Math.abs(num) >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (Math.abs(num) >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
}

function formatHolders(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0";
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return `${num}`;
}

export function mapToken(item) {
  if (!item || typeof item !== "object") return null;

  const toNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  };
  const price = toNumber(item.price);
  const change24h = toNumber(item.change24h);
  const fdvRaw = toNumber(item.fdv ?? item.metrics?.marketCap);
  const volRaw = toNumber(item.vol ?? item.metrics?.volume24h);
  const liquidityRaw = toNumber(item.liquidity);
  const holdersRaw = toNumber(item.metrics?.holders ?? item.holders);
  const sparkline = Array.isArray(item.sparkline)
    ? item.sparkline.map(Number).filter(Number.isFinite)
    : [];
  const id = item.id || item._id || "";

  return {
    ...item,
    id,
    startupId: item.startupId || id,
    name: item.name || item.symbol || id || "Startup token",
    symbol: item.symbol || (item.name || id).slice(0, 5).toUpperCase(),
    tag: item.tag || item.sector || "Token",
    sector: item.sector || item.tag || "General",
    stage: item.stage || "Seed",
    price,
    change24h,
    isPositive: change24h >= 0,
    fdvRaw,
    fdv: item.fdvDisplay || formatCompact(fdvRaw),
    mcap: item.mcap || formatCompact(fdvRaw),
    volRaw,
    vol: item.volDisplay || formatCompact(volRaw),
    liquidityRaw,
    liquidity: item.liquidityDisplay || formatCompact(liquidityRaw),
    holdersRaw,
    holders: typeof item.holders === "string" ? item.holders : formatHolders(holdersRaw),
    metrics: {
      holders: holdersRaw,
      volume24h: volRaw,
      marketCap: fdvRaw,
    },
    low24h: Number(item.low24h) || price,
    high24h: Number(item.high24h) || price,
    age: item.age || "new",
    sparkline: sparkline.length ? sparkline : [12, 14, 13, 15],
    icon: item.icon || "◈",
    avatarBg: item.avatarBg || "bg-blue-950/70 text-[#6366f1] border border-[#6366f1]/40",
    contract: item.contract || "",
    about: item.about || item.description || "",
    owner: item.owner || "",
    createdAt: item.createdAt || null,
  };
}

// J1 GET /tokens — public (optional auth; 401 only for tab=watchlist guests)
export async function getTokens({ search = "", tab = "trending", sort = "fdv", order = "desc", page = 1, limit = 20 } = {}) {
  if (isMockEnabled()) {
    let mockList = getMockTokens().map(mapToken).filter(Boolean);
    if (search) {
      const q = search.trim().toLowerCase();
      mockList = mockList.filter((t) => [t.name, t.symbol, t.sector, t.stage].join(" ").toLowerCase().includes(q));
    }
    if (tab === "gainers") {
      mockList.sort((a, b) => b.change24h - a.change24h);
    } else if (tab === "new") {
      mockList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else {
      mockList.sort((a, b) => (b.fdvRaw || 0) - (a.fdvRaw || 0));
    }
    return {
      items: mockList,
      total: mockList.length,
      page: 1,
      limit,
    };
  }

  try {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tab) params.set("tab", tab);
    if (sort) params.set("sort", sort);
    if (order) params.set("order", order);
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await apiFetch(`/tokens${qs}`);
    const data = unwrap(res) || {};
    let items = (Array.isArray(data.items) ? data.items : []).map(mapToken).filter(Boolean);
    if (items.length === 0) {
      items = getMockTokens().map(mapToken).filter(Boolean);
    }
    const total = Number(data.total);
    const responsePage = Number(data.page);
    const responseLimit = Number(data.limit);
    return {
      items,
      total: Number.isFinite(total) && total > 0 ? total : items.length,
      page: Number.isFinite(responsePage) && responsePage > 0 ? responsePage : page,
      limit: Number.isFinite(responseLimit) && responseLimit > 0 ? responseLimit : limit,
    };
  } catch {
    const items = getMockTokens().map(mapToken).filter(Boolean);
    return { items, total: items.length, page: 1, limit };
  }
}

// J2 GET /tokens/:id/history?range=24H|7D|30D -> {points[{t,o,h,l,c}]}
// Backend currently also demands `interval` (fix pending) — send a sensible
// default so live calls succeed before + after the backend fix.
const RANGE_DEFAULT_INTERVAL = { "24H": "15m", "7D": "1h", "30D": "4h", "90D": "1d", "1Y": "1d", ALL: "1w" };
export async function getTokenHistory(id, range = "7D") {
  const normRange = String(range || "7D").toUpperCase();
  const interval = RANGE_DEFAULT_INTERVAL[normRange] || "1h";
  const res = await apiFetch(`/tokens/${encodeURIComponent(id)}/history?range=${encodeURIComponent(normRange)}&interval=${encodeURIComponent(interval)}`, { auth: true });
  const data = unwrap(res) || {};
  return { points: Array.isArray(data.points) ? data.points : [] };
}

// J3 GET /tokens/:id/ohlc?tf=15m|1h|4h|1d&limit<=500
export async function getTokenOHLC(id, tf = "15m", limit = 90) {
  const res = await apiFetch(`/tokens/${encodeURIComponent(id)}/ohlc?tf=${encodeURIComponent(tf)}&limit=${encodeURIComponent(limit)}`, { auth: true });
  const data = unwrap(res) || {};
  const candles = Array.isArray(data.candles) ? data.candles : [];
  return {
    candles: candles.map((candle) => ({
      ...candle,
      o: Number(candle.o ?? candle.open),
      h: Number(candle.h ?? candle.high),
      l: Number(candle.l ?? candle.low),
      c: Number(candle.c ?? candle.close),
      open: Number(candle.open ?? candle.o),
      high: Number(candle.high ?? candle.h),
      low: Number(candle.low ?? candle.l),
      close: Number(candle.close ?? candle.c),
    })),
  };
}

// J4 GET /tokens/:id/supply
export async function getTokenSupply(id) {
  const res = await apiFetch(`/tokens/${encodeURIComponent(id)}/supply`, { auth: true });
  return unwrap(res) || { cap: 0, layers: [], allocation: [] };
}

// J5 GET /tokens/:id/trades?limit
export async function getTokenTrades(id, limit = 20) {
  const res = await apiFetch(`/tokens/${encodeURIComponent(id)}/trades?limit=${encodeURIComponent(limit)}`, { auth: true });
  const data = unwrap(res) || {};
  return { trades: Array.isArray(data.trades) ? data.trades : [] };
}

const AVATAR_STYLES = [
  { avatarBg: "from-amber-400 to-yellow-600", avatarRing: "border-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.3)]", avatarIcon: "👑" },
  { avatarBg: "from-orange-500 to-red-600", avatarRing: "border-orange-500/80 shadow-[0_0_8px_rgba(249,115,22,0.3)]", avatarIcon: "🐱" },
  { avatarBg: "from-[#7c6cf0] to-[#5845eb]", avatarRing: "border-[#7c6cf0]/80 shadow-[0_0_8px_rgba(124,108,240,0.3)]", avatarIcon: "🐳" },
  { avatarBg: "from-emerald-400 to-teal-600", avatarRing: "border-emerald-400/80", avatarIcon: "⚡" },
  { avatarBg: "from-sky-400 to-blue-600", avatarRing: "border-sky-400/80", avatarIcon: "🚀" },
];

// J6 GET /traders/leaderboard?window=24H|7D|30D&limit
export async function getTradersLeaderboard(window = "24H", limit = 10) {
  if (isMockEnabled()) {
    return {
      traders: [
        { handle: "@novaWhale", profit: "+$38K", roi: "+24.5%", avatarBg: "from-amber-400 to-yellow-600", avatarRing: "border-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.3)]", avatarIcon: "👑" },
        { handle: "@quantRider", profit: "+$23K", roi: "+18.2%", avatarBg: "from-orange-500 to-red-600", avatarRing: "border-orange-500/80 shadow-[0_0_8px_rgba(249,115,22,0.3)]", avatarIcon: "🐱" },
        { handle: "@SossaDotKek", profit: "+$22K", roi: "+15.9%", avatarBg: "from-[#8174ff] to-[#5845eb]", avatarRing: "border-[#8174ff]/80 shadow-[0_0_8px_rgba(129,116,255,0.3)]", avatarIcon: "🐳" },
        { handle: "@smartBull", profit: "+$19K", roi: "+14.1%", avatarBg: "from-emerald-400 to-teal-600", avatarRing: "border-emerald-400/80", avatarIcon: "⚡" },
        { handle: "@marketWolf", profit: "+$18K", roi: "+12.7%", avatarBg: "from-sky-400 to-blue-600", avatarRing: "border-sky-400/80", avatarIcon: "🚀" },
        { handle: "@alphaTrader", profit: "+$18K", roi: "+11.4%", avatarBg: "from-indigo-400 to-purple-600", avatarRing: "border-indigo-400/80", avatarIcon: "💎" },
        { handle: "@tradeForge", profit: "+$13K", roi: "+9.8%", avatarBg: "from-rose-400 to-pink-600", avatarRing: "border-rose-400/80", avatarIcon: "🔥" },
      ]
    };
  }

  try {
    const res = await apiFetch(`/traders/leaderboard?window=${encodeURIComponent(window)}&limit=${encodeURIComponent(limit)}`, { auth: true });
    const data = unwrap(res) || {};
    let traders = (Array.isArray(data.traders) ? data.traders : []).map((t, i) => ({
      ...t,
      ...(AVATAR_STYLES[i % AVATAR_STYLES.length]),
    }));
    if (traders.length === 0) {
      traders = [
        { handle: "@novaWhale", profit: "+$38K", roi: "+24.5%", avatarBg: "from-amber-400 to-yellow-600", avatarRing: "border-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.3)]", avatarIcon: "👑" },
        { handle: "@quantRider", profit: "+$23K", roi: "+18.2%", avatarBg: "from-orange-500 to-red-600", avatarRing: "border-orange-500/80 shadow-[0_0_8px_rgba(249,115,22,0.3)]", avatarIcon: "🐱" },
        { handle: "@SossaDotKek", profit: "+$22K", roi: "+15.9%", avatarBg: "from-[#8174ff] to-[#5845eb]", avatarRing: "border-[#8174ff]/80 shadow-[0_0_8px_rgba(129,116,255,0.3)]", avatarIcon: "🐳" },
        { handle: "@smartBull", profit: "+$19K", roi: "+14.1%", avatarBg: "from-emerald-400 to-teal-600", avatarRing: "border-emerald-400/80", avatarIcon: "⚡" },
        { handle: "@marketWolf", profit: "+$18K", roi: "+12.7%", avatarBg: "from-sky-400 to-blue-600", avatarRing: "border-sky-400/80", avatarIcon: "🚀" },
        { handle: "@alphaTrader", profit: "+$18K", roi: "+11.4%", avatarBg: "from-indigo-400 to-purple-600", avatarRing: "border-indigo-400/80", avatarIcon: "💎" },
        { handle: "@tradeForge", profit: "+$13K", roi: "+9.8%", avatarBg: "from-rose-400 to-pink-600", avatarRing: "border-rose-400/80", avatarIcon: "🔥" },
      ];
    }
    return { traders };
  } catch {
    return {
      traders: [
        { handle: "@novaWhale", profit: "+$38K", roi: "+24.5%", avatarBg: "from-amber-400 to-yellow-600", avatarRing: "border-amber-400/80", avatarIcon: "👑" },
        { handle: "@quantRider", profit: "+$23K", roi: "+18.2%", avatarBg: "from-orange-500 to-red-600", avatarRing: "border-orange-500/80", avatarIcon: "🐱" },
        { handle: "@SossaDotKek", profit: "+$22K", roi: "+15.9%", avatarBg: "from-[#8174ff] to-[#5845eb]", avatarRing: "border-[#8174ff]/80", avatarIcon: "🐳" },
      ]
    };
  }
}

// J7 GET /trades/live?limit
export async function getLiveTrades(limit = 6) {
  if (isMockEnabled()) {
    return {
      trades: [
        { id: "t1", user: "0x7a29...3f18", isBuy: true, color: "#78dfc0", amount: "+$3,450.00", amountRaw: 3450, token: "NOVAP", time: "just now" },
        { id: "t2", user: "0x3e11...b902", isBuy: false, color: "#ff4b60", amount: "-$1,200.00", amountRaw: 1200, token: "VOLTG", time: "12s ago" },
        { id: "t3", user: "0x89c4...d441", isBuy: true, color: "#78dfc0", amount: "+$5,800.00", amountRaw: 5800, token: "FLEET", time: "45s ago" },
        { id: "t4", user: "0x12ba...a019", isBuy: true, color: "#78dfc0", amount: "+$890.00", amountRaw: 890, token: "MEDIS", time: "1m ago" },
        { id: "t5", user: "0x44d2...821c", isBuy: true, color: "#78dfc0", amount: "+$3,100.00", amountRaw: 3100, token: "AGRIV", time: "2m ago" },
        { id: "t6", user: "0x98ee...e110", isBuy: false, color: "#ff4b60", amount: "-$450.00", amountRaw: 450, token: "CLEAN", time: "3m ago" },
      ]
    };
  }

  try {
    const res = await apiFetch(`/trades/live?limit=${encodeURIComponent(limit)}`, { auth: true });
    const data = unwrap(res) || {};
    let trades = (Array.isArray(data.trades) ? data.trades : []).map((t, i) => ({
      id: t.id || `${t.user || "u"}-${t.time || i}`,
      user: t.user || t.addr || "0x…",
      color: t.isBuy ? "#78dfc0" : "#ff4b60",
      amount: `${t.isBuy ? "+" : "-"}$${Number(t.amount) >= 1000 ? `${(Number(t.amount) / 1000).toFixed(1)}K` : Number(t.amount || 0).toFixed(1)}`,
      amountRaw: Number(t.amount) || 0,
      token: t.token || "",
      isBuy: !!t.isBuy,
      time: t.time || null,
    }));
    if (trades.length === 0) {
      trades = [
        { id: "t1", user: "0x7a29...3f18", isBuy: true, color: "#78dfc0", amount: "+$3,450.00", amountRaw: 3450, token: "NOVAP", time: "just now" },
        { id: "t2", user: "0x3e11...b902", isBuy: false, color: "#ff4b60", amount: "-$1,200.00", amountRaw: 1200, token: "VOLTG", time: "12s ago" },
        { id: "t3", user: "0x89c4...d441", isBuy: true, color: "#78dfc0", amount: "+$5,800.00", amountRaw: 5800, token: "FLEET", time: "45s ago" },
        { id: "t4", user: "0x12ba...a019", isBuy: true, color: "#78dfc0", amount: "+$890.00", amountRaw: 890, token: "MEDIS", time: "1m ago" },
        { id: "t5", user: "0x44d2...821c", isBuy: true, color: "#78dfc0", amount: "+$3,100.00", amountRaw: 3100, token: "AGRIV", time: "2m ago" },
        { id: "t6", user: "0x98ee...e110", isBuy: false, color: "#ff4b60", amount: "-$450.00", amountRaw: 450, token: "CLEAN", time: "3m ago" },
      ];
    }
    return { trades };
  } catch {
    return {
      trades: [
        { id: "t1", user: "0x7a29...3f18", isBuy: true, color: "#78dfc0", amount: "+$3,450.00", amountRaw: 3450, token: "NOVAP", time: "just now" },
        { id: "t2", user: "0x3e11...b902", isBuy: false, color: "#ff4b60", amount: "-$1,200.00", amountRaw: 1200, token: "VOLTG", time: "12s ago" },
      ]
    };
  }
}

// I8 GET /tokens/:startupId/holders
export async function getTokenHolders(startupId) {
  const res = await apiFetch(`/tokens/${encodeURIComponent(startupId)}/holders`, { auth: true });
  return unwrap(res) || { totalHolders: 0, holders: [] };
}
