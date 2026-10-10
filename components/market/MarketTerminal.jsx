"use client";

import { useState, useEffect, useMemo, useRef, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { Zap, Clock, Bookmark, Loader2 } from "lucide-react";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../../lib/usersApi";
import { getTokens, getLiveTrades } from "../../lib/tradingApi";

export const TOKENS_DATA = []; // Deprecated: mock catalog removed Sep 2026 — live data via lib/tradingApi.js (GET /tokens, GET /traders/leaderboard).

// Memoized SVG sparkline: re-renders only when this token's points change or
// its own hover index changes — not on every 2s tick of a different token.
const Sparkline = memo(function Sparkline({
  tokenId,
  points,
  isPositive,
  price,
  hoveredIndex,
  onHover,
  onLeave,
}) {
  const width = 100;
  const height = 30;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * (width - 8) + 4;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return { x, y, val };
  });

  const isHovered = hoveredIndex >= 0;
  const activeCoord = isHovered && coords[hoveredIndex] ? coords[hoveredIndex] : null;

  return (
    <div className="relative group py-1">
      <svg
        width={width}
        height={height}
        className="overflow-visible cursor-crosshair"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const relX = e.clientX - rect.left;
          const idx = Math.max(0, Math.min(points.length - 1, Math.round((relX / width) * (points.length - 1))));
          onHover(tokenId, idx);
        }}
        onMouseLeave={onLeave}
      >
        <polyline
          fill="none"
          stroke={isPositive ? "#78dfc0" : "#ff4b60"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ")}
        />
        {activeCoord && (
          <circle cx={activeCoord.x} cy={activeCoord.y} r="3.5" fill="#ffffff" stroke={isPositive ? "#78dfc0" : "#ff4b60"} strokeWidth="2" />
        )}
      </svg>

      {isHovered && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#0d111b] border border-[#8174ff]/40 text-[#8174ff] text-[10px] font-mono px-2 py-0.5 rounded-md shadow-xl pointer-events-none whitespace-nowrap z-20">
          ${(price * (1 + (points[hoveredIndex] - points[0]) * 0.005)).toFixed(6)}
        </div>
      )}
    </div>
  );
});

// Memoized table row: all props are primitives or stable callbacks, so only
// the ticked token (new object identity) re-renders per 2s tick — the other
// ~19 rows skip rendering entirely. Critical for low-end devices.
const TokenRow = memo(function TokenRow({
  t,
  needle,
  isFlashing,
  flashDirection,
  hoveredIndex,
  isWatched,
  isToggling,
  onToggleWatchlist,
  onNavigate,
  onSparkHover,
  onSparkLeave,
}) {
  const flashColor = flashDirection === "up" ? "bg-[#8174ff]/15" : "bg-rose-500/15";

  return (
    <tr
      onClick={() => onNavigate(t.id)}
      className={`hover:bg-[#151c2c] transition-colors cursor-pointer group ${
        isFlashing ? flashColor : ""
      }`}
    >
      <td className="p-3.5 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[13.5px] font-bold bg-[#141b2a] border border-white/[0.08] text-[#8174ff] shadow-sm">
            {t.symbol?.slice(0, 2) || t.icon || "◈"}
          </div>
          <div>
            <div className="font-semibold text-[#f4f5fb] text-[13.5px] leading-tight group-hover:text-[#8174ff] transition">
              {t.name}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#737d91] mt-0.5 font-mono">
              <span className="font-semibold text-[#a6adbf]">{t.symbol}</span>
              <span>·</span>
              <span className="text-[#8174ff] font-sans">{t.tag}</span>
            </div>
          </div>
        </div>
      </td>

      <td className="p-3.5 sm:p-4">
        <div className={`font-mono font-semibold text-[13px] transition-colors ${
          isFlashing && flashDirection === "up" ? "text-[#78dfc0]" : isFlashing ? "text-rose-400" : "text-white"
        }`}>
          ${t.price < 0.01 ? t.price.toFixed(6) : t.price.toFixed(4)}
        </div>
        <div className={`font-mono text-[11px] font-semibold ${t.isPositive ? "text-[#78dfc0]" : "text-rose-500"}`}>
          {t.isPositive ? "+" : ""}{t.change24h.toFixed(2)}%
        </div>
      </td>

      <td className="p-3.5 sm:p-4 font-mono font-semibold text-[#a6adbf] text-[13px]">{t.fdv}</td>
      <td className="p-3.5 sm:p-4 font-mono font-semibold text-[#a6adbf] text-[13px]">{t.vol}</td>
      <td className="p-3.5 sm:p-4">
        <Sparkline
          tokenId={t.id}
          points={t.sparkline}
          isPositive={t.isPositive}
          price={t.price}
          hoveredIndex={hoveredIndex}
          onHover={onSparkHover}
          onLeave={onSparkLeave}
        />
      </td>

      <td className="p-3.5 sm:p-4">
        <div className="w-[110px]">
          <div className="relative h-1.5 w-full bg-white/[0.08] rounded-full mb-1">
            <div
              className="absolute -top-0.5 w-2.5 h-2.5 rounded-full bg-[#8174ff] shadow-[0_0_8px_rgba(129,116,255,0.7)]"
              style={{ left: `${needle}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[#737d91]">
            <span>${t.low24h}</span>
            <span>${t.high24h}</span>
          </div>
        </div>
      </td>

      <td className="p-3.5 sm:p-4 font-mono font-semibold text-[#a6adbf] text-[13px]">{t.liquidity}</td>
      <td className="p-3.5 sm:p-4 text-[#737d91] text-[12px]">{t.age}</td>

      <td className="p-3.5 sm:p-4">
        <div className="font-mono font-semibold text-[#f4f5fb] text-[13px]">{t.holders}</div>
        <div className={`text-[10.5px] font-mono ${(t.holdersDelta || "").startsWith("+") ? "text-[#78dfc0]" : "text-rose-500"}`}>
          {(t.holdersDelta || "").startsWith("+") ? (+t.holdersDelta).toFixed(1) + "+" : (t.holdersDelta || "-")}
        </div>
      </td>

      <td className="p-3.5 sm:p-4 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={(e) => onToggleWatchlist(e, t)}
            disabled={isToggling}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full border transition-all ${
              isWatched
                ? "bg-[#8174ff]/20 border-[#8174ff]/60 text-[#8174ff] shadow-[0_0_12px_rgba(129,116,255,0.25)]"
                : "bg-white/[0.04] border-white/[0.08] text-[#737d91] hover:text-white hover:border-[#8174ff]/40"
            }`}
            title={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
          >
            {isToggling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Bookmark
                className={`w-3.5 h-3.5 ${isWatched ? "fill-[#8174ff]" : ""}`}
              />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(t.id);
            }}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#8174ff]/15 border border-[#8174ff]/35 text-[#8174ff] hover:bg-[#8174ff] hover:text-white transition-all shadow-[0_0_10px_rgba(129,116,255,0.15)]"
            title="View Company Detail"
          >
            <Zap className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default function MarketTerminal() {
  const router = useRouter();
  // Live backend tokens (J1). TOKENS_DATA below is deprecated and no longer
  // used as render source — kept only for the named export.
  const [tokens, setTokens] = useState([]);
  const [tokensLoading, setTokensLoading] = useState(true);
  const [tokensError, setTokensError] = useState("");
  // Mirror of tokens for the interval so the updater stays pure (no nested
  // setState inside setTokens) and we can compute flash state outside.
  const tokensRef = useRef([]);
  const flashTimeoutRef = useRef(null);
  const hoverRafRef = useRef(0);
  useEffect(() => {
    tokensRef.current = tokens;
  }, [tokens]);
  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      if (hoverRafRef.current) cancelAnimationFrame(hoverRafRef.current);
    };
  }, []);
  const [activeTab, setActiveTab] = useState("trending");
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [flashingId, setFlashingId] = useState(null); // { id, direction: 'up' | 'down' }
  const [hoveredSpark, setHoveredSpark] = useState(null); // { id, index, price }
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const [togglingWatchlistId, setTogglingWatchlistId] = useState(null);
  // Mirror for stable watchlist toggle callback (avoids recreating the
  // handler + re-rendering rows on every watchlistIds change).
  // NOTE: must sit AFTER watchlistIds declaration (TDZ otherwise).
  const watchlistIdsRef = useRef(watchlistIds);
  useEffect(() => {
    watchlistIdsRef.current = watchlistIds;
  }, [watchlistIds]);

  // Sync Watchlist from backend
  useEffect(() => {
    let cancelled = false;
    async function fetchUserWatchlist() {
      try {
        const res = await getWatchlist();
        if (cancelled) return;
        const items = res?.items || res?.data?.items || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
        const ids = new Set();
        items.forEach((item) => {
          if (item._id) ids.add(item._id);
          if (item.id) ids.add(item.id);
          if (item.symbol) ids.add(item.symbol.toLowerCase());
          if (item.startupName) ids.add(item.startupName.toLowerCase());
        });
        setWatchlistIds(ids);
      } catch {
        // Guest mode fallback
      }
    }
    fetchUserWatchlist();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleWatchlist = useCallback(async (e, tokenItem) => {
    e.stopPropagation();
    const targetId = tokenItem.id || tokenItem._id;
    if (!targetId) return;

    setTogglingWatchlistId(targetId);
    const currentIds = watchlistIdsRef.current;
    const isCurrentlyWatched =
      currentIds.has(targetId) ||
      (tokenItem.symbol && currentIds.has(tokenItem.symbol.toLowerCase())) ||
      (tokenItem.name && currentIds.has(tokenItem.name.toLowerCase()));

    try {
      if (isCurrentlyWatched) {
        await removeFromWatchlist(targetId);
        setWatchlistIds((prev) => {
          const next = new Set(prev);
          next.delete(targetId);
          if (tokenItem.symbol) next.delete(tokenItem.symbol.toLowerCase());
          if (tokenItem.name) next.delete(tokenItem.name.toLowerCase());
          return next;
        });
      } else {
        await addToWatchlist(targetId);
        setWatchlistIds((prev) => {
          const next = new Set(prev);
          next.add(targetId);
          if (tokenItem.symbol) next.add(tokenItem.symbol.toLowerCase());
          if (tokenItem.name) next.add(tokenItem.name.toLowerCase());
          return next;
        });
      }
    } catch (err) {
      console.error("Watchlist action failed:", err);
    } finally {
      setTogglingWatchlistId(null);
    }
  }, []);

  const [liveTrades, setLiveTrades] = useState([]);
  const [tradesError, setTradesError] = useState("");

  // Live token list (J1) + live trades feed (J7). Tokens refresh on
  // tab/search change and every 30s; trades poll every 10s.
  useEffect(() => {
    let cancelled = false;
    const backendTab = activeTab === "watchlist" ? "trending" : activeTab;
    getTokens({ tab: backendTab, limit: 100 })
      .then((res) => {
        if (cancelled) return;
        setTokens(res.items || []);
        setTokensError("");
        setTokensLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setTokensError("Could not load tokens from the backend.");
        setTokensLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeTab]);

  useEffect(() => {
    let cancelled = false;
    let interval;
    async function pollTrades() {
      try {
        const res = await getLiveTrades(6);
        if (!cancelled && res.trades && res.trades.length > 0) setLiveTrades(res.trades);
      } catch {
        if (!cancelled) setTradesError("Live trades unavailable.");
      }
    }
    pollTrades();
    interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      pollTrades();
    }, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Periodic token refresh (30s) with price-flash on change.
  useEffect(() => {
    const backendTab = activeTab === "watchlist" ? "trending" : activeTab;
    const interval = setInterval(async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await getTokens({ tab: backendTab, limit: 100 });
        const next = res.items || [];
        if (next.length === 0) return;
        const prevById = new Map(tokensRef.current.map((t) => [t.id, t]));
        let flash = null;
        next.forEach((t) => {
          const prev = prevById.get(t.id);
          if (prev && prev.price !== t.price) flash = { id: t.id, direction: t.price >= prev.price ? "up" : "down" };
        });
        setTokens(next);
        if (flash) {
          setFlashingId(flash);
          if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
          flashTimeoutRef.current = setTimeout(() => setFlashingId(null), 800);
        }
      } catch {
        // Keep last good list on refresh failure.
      }
    }, 30000);
    return () => {
      clearInterval(interval);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, [activeTab]);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredTokens = useMemo(() => {
    let list = [...tokens];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q));
    }
    if (activeTab === "top") {
      list.sort((a, b) => b.fdvRaw - a.fdvRaw);
    } else if (activeTab === "gainers") {
      list = list.filter((t) => t.change24h > 0).sort((a, b) => b.change24h - a.change24h);
    } else if (activeTab === "new") {
      list = list.filter((t) => t.age.includes("w") || t.age.includes("1mo"));
    } else if (activeTab === "watchlist") {
      list = list.filter((t) =>
        watchlistIds.has(t.id) ||
        (t.symbol && watchlistIds.has(t.symbol.toLowerCase())) ||
        (t.name && watchlistIds.has(t.name.toLowerCase()))
      );
    }

    if (sortCol) {
      list.sort((a, b) => {
        const aVal = a[sortCol];
        const bVal = b[sortCol];
        return sortAsc ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
      });
    }
    return list;
  }, [tokens, activeTab, sortCol, sortAsc, searchQuery, watchlistIds]);

  // Stable unless sorting actually changes (avoids new fn identity per render).
  const handleSort = useCallback((col) => {
    if (sortCol === col) {
      setSortAsc((prevAsc) => !prevAsc);
    } else {
      setSortCol(col);
      setSortAsc(false);
    }
  }, [sortCol]);

  // Throttled sparkline hover: rAF + equality guard so per-pixel mousemove
  // produces at most one render per frame and no render when index is unchanged.
  const handleSparkHover = useCallback((tokenId, index) => {
    if (hoverRafRef.current) return;
    hoverRafRef.current = requestAnimationFrame(() => {
      hoverRafRef.current = 0;
      setHoveredSpark((prev) => {
        if (prev?.id === tokenId && prev?.index === index) return prev;
        return { id: tokenId, index };
      });
    });
  }, []);

  // Stable navigation callback for memoized rows (inline arrows would break memo).
  const handleNavigateToToken = useCallback((tokenId) => {
    router.push(`/insights/${tokenId}`);
  }, [router]);

  const clearSparkHover = useCallback(() => setHoveredSpark(null), []);

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 text-[#f8fafc]">
      {/* ZONE 1: TOP 4 OVERVIEW CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 1. Trending */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111723]/90 p-4.5 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_40px_rgba(100,90,223,0.04)] hover:border-[#8174ff]/35 transition-all">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-[13.5px] font-bold text-white flex items-center gap-2">
              <span className="cl-mint-dot" />
              Trending
            </h3>
            <span className="text-[11px] font-mono font-semibold text-[#8174ff] uppercase tracking-wider">Top 4</span>
          </div>
          <div className="grid grid-cols-3 text-[10.5px] uppercase tracking-wider text-[#737d91] font-semibold border-b border-white/[0.06] pb-2 mb-2.5">
            <span>Name</span>
            <span className="text-right">FDV</span>
            <span className="text-right">24H Δ</span>
          </div>
          <div className="space-y-2.5">
            {tokens.slice(0, 4).map((t) => (
              <div
                key={t.id}
                onClick={() => router.push(`/insights/${t.id}`)}
                className="flex items-center justify-between text-[12.5px] hover:text-[#8174ff] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#161d2d] flex items-center justify-center text-[10px] font-bold text-[#8174ff]">
                    {t.symbol?.slice(0, 2)}
                  </span>
                  <span className="font-semibold text-[#f4f5fb] group-hover:text-[#8174ff] transition">{t.symbol}</span>
                </div>
                <span className="text-[#a6adbf] font-mono text-[12px]">{t.fdv}</span>
                <span className={`font-mono text-[11px] font-semibold ${t.isPositive ? "text-[#78dfc0]" : "text-rose-500"}`}>
                  {t.isPositive ? "+" : ""}{t.change24h.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Just Graduated */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111723]/90 p-4.5 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_40px_rgba(100,90,223,0.04)] hover:border-[#8174ff]/35 transition-all">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-[13.5px] font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8174ff]" />
              Just Graduated
            </h3>
            <span
              onClick={() => router.push("/marketplace")}
              className="text-[11px] text-[#8174ff] flex items-center font-semibold hover:underline cursor-pointer"
            >
              Upcoming &gt;
            </span>
          </div>
          <div className="grid grid-cols-3 text-[10.5px] uppercase tracking-wider text-[#737d91] font-semibold border-b border-white/[0.06] pb-2 mb-2.5">
            <span>Name</span>
            <span className="text-right">FDV</span>
            <span className="text-right">24H Δ</span>
          </div>
          <div className="space-y-2.5">
            {tokens.slice(4, 8).map((t) => (
              <div
                key={t.id}
                onClick={() => router.push(`/insights/${t.id}`)}
                className="flex items-center justify-between text-[12.5px] hover:text-[#8174ff] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#161d2d] flex items-center justify-center text-[10px] font-bold text-[#8174ff]">
                    {t.symbol?.slice(0, 2)}
                  </span>
                  <span className="font-semibold text-[#f4f5fb] group-hover:text-[#8174ff] transition">{t.symbol}</span>
                </div>
                <span className="text-[#a6adbf] font-mono text-[12px]">{t.fdv}</span>
                <span className={`font-mono text-[11px] font-semibold ${t.isPositive ? "text-[#78dfc0]" : "text-rose-500"}`}>
                  {t.isPositive ? "+" : ""}{t.change24h.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Gainers */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111723]/90 p-4.5 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_40px_rgba(100,90,223,0.04)] hover:border-[#8174ff]/35 transition-all">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-[13.5px] font-bold text-white flex items-center gap-2">
              <span className="cl-mint-dot" />
              Gainers
            </h3>
            <span className="text-[11px] font-mono font-semibold text-[#78dfc0] uppercase tracking-wider">Top %</span>
          </div>
          <div className="grid grid-cols-3 text-[10.5px] uppercase tracking-wider text-[#737d91] font-semibold border-b border-white/[0.06] pb-2 mb-2.5">
            <span>Name</span>
            <span className="text-right">FDV</span>
            <span className="text-right">24H Δ</span>
          </div>
          <div className="space-y-2.5">
            {[...tokens].filter((t) => t.isPositive).slice(0, 4).map((t) => (
              <div
                key={t.id}
                onClick={() => router.push(`/insights/${t.id}`)}
                className="flex items-center justify-between text-[12.5px] hover:text-[#78dfc0] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#161d2d] flex items-center justify-center text-[10px] font-bold text-[#78dfc0]">
                    {t.symbol?.slice(0, 2)}
                  </span>
                  <span className="font-semibold text-[#f4f5fb] group-hover:text-[#78dfc0] transition">{t.symbol}</span>
                </div>
                <span className="text-[#a6adbf] font-mono text-[12px]">{t.fdv}</span>
                <span className="font-mono text-[11px] font-semibold text-[#78dfc0]">+{t.change24h.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Live Trades */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111723]/90 p-4.5 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_40px_rgba(100,90,223,0.04)] hover:border-[#8174ff]/35 transition-all">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-[13.5px] font-bold text-white flex items-center gap-2">
              <span className="cl-mint-dot" />
              Live Trades
            </h3>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#78dfc0] bg-[#78dfc0]/10 border border-[#78dfc0]/30 px-2.5 py-0.5 rounded-full">
              Real-time
            </span>
          </div>
          <div className="grid grid-cols-2 text-[10.5px] uppercase tracking-wider text-[#737d91] font-semibold border-b border-white/[0.06] pb-2 mb-2.5">
            <span>User</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="space-y-2">
            {liveTrades.length === 0 ? (
              <p className="py-4 text-center text-[12px] text-[#737d91]">
                {tradesError || "Waiting for live trades…"}
              </p>
            ) : (
            liveTrades.slice(0, 4).map((tr) => (
              <div key={tr.id} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: tr.color }}></span>
                  <span className="font-mono text-[#a6adbf] text-[11.5px]">{tr.user}</span>
                </div>
                <span className={`font-mono font-semibold text-[11.5px] ${tr.isBuy ? "text-[#78dfc0]" : "text-rose-500"}`}>
                  {tr.amount}
                </span>
              </div>
            )))}
          </div>
        </div>
      </section>

      {/* ZONE 2: TOOLBAR WITH SEARCH & TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] p-1 rounded-full backdrop-blur-md">
            {["trending", "top", "gainers", "new", "watchlist"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-[12.5px] font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-[#6a60e7]/30 to-[#8174ff]/30 border border-[#8174ff]/50 text-white shadow-[0_0_14px_rgba(129,116,255,0.22)]"
                    : "text-[#a6adbf] hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Instant Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search 20+ startups & tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-[36px] w-[230px] rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-[12.5px] text-white placeholder-[#737d91] outline-none transition focus:border-[#8174ff]/50 focus:bg-white/[0.06]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button className="inline-flex h-[36px] items-center gap-1.5 px-4 rounded-full border border-white/[0.08] bg-white/[0.04] text-[12px] font-semibold text-[#a6adbf] hover:border-white/[0.2] hover:text-white transition">
            <Clock className="w-3.5 h-3.5 text-[#737d91]" />
            <span>24H ▾</span>
          </button>
          <button className="inline-flex h-[36px] items-center gap-1.5 px-4 rounded-full border border-[rgba(169,159,255,0.35)] bg-[rgba(118,108,255,0.14)] text-[12px] font-semibold text-[#edeaff] shadow-[0_0_14px_rgba(118,108,255,0.18)] transition">
            <Zap className="w-3.5 h-3.5 text-[#8174ff]" />
            <span className="font-bold">{filteredTokens.length} Tokens</span>
          </button>
        </div>
      </div>

      {/* ZONE 3: TOKEN MARKET TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111723]/90 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-md">
        <table className="w-full border-collapse text-left text-[13px] min-w-[980px]">
          <thead>
            <tr className="border-b border-white/[0.06] text-[10.5px] font-semibold text-[#737d91] uppercase tracking-wider bg-white/[0.02]">
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("name")}>Name</th>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("price")}>Price / %Δ</th>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("fdvRaw")}>FDV</th>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("volRaw")}>Vol</th>
              <th className="p-4">Last 24h</th>
              <th className="p-4">24h Range</th>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("liquidityRaw")}>Liquidity</th>
              <th className="p-4">Age</th>
              <th className="p-4">Holders</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredTokens.map((t) => {
              const needle = Math.max(
                5,
                Math.min(95, (((t.price - t.low24h) / (t.high24h - t.low24h || 1)) * 100).toFixed(0))
              );
              const isFlashing = flashingId?.id === t.id;
              const isWatched =
                watchlistIds.has(t.id) ||
                (t.symbol && watchlistIds.has(t.symbol.toLowerCase())) ||
                (t.name && watchlistIds.has(t.name.toLowerCase()));

              return (
                <TokenRow
                  key={t.id}
                  t={t}
                  needle={needle}
                  isFlashing={isFlashing}
                  flashDirection={isFlashing ? flashingId.direction : null}
                  hoveredIndex={hoveredSpark?.id === t.id ? hoveredSpark.index : -1}
                  isWatched={isWatched}
                  isToggling={togglingWatchlistId === t.id}
                  onToggleWatchlist={handleToggleWatchlist}
                  onNavigate={handleNavigateToToken}
                  onSparkHover={handleSparkHover}
                  onSparkLeave={clearSparkHover}
                />
              );
            })}
            {tokensLoading ? (
              <tr>
                <td colSpan={10} className="py-14 text-center text-neutral-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#8174ff] mb-2" />
                  <p className="text-[13px] text-[#737d91]">Loading tokens from the network…</p>
                </td>
              </tr>
            ) : tokensError && filteredTokens.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-neutral-400">
                  <p className="text-[13px] text-rose-400">{tokensError}</p>
                </td>
              </tr>
            ) : filteredTokens.length === 0 && (
              <tr>
                <td colSpan={10} className="py-14 text-center text-neutral-400">
                  {activeTab === "watchlist" ? (
                    <div className="flex flex-col items-center gap-2">
                      <Bookmark className="w-6 h-6 text-[#8174ff]/60" />
                      <p className="font-semibold text-white">Your Watchlist is empty</p>
                      <p className="text-[12.5px] text-[#737d91]">Bookmark any startup token from the table to track it here.</p>
                    </div>
                  ) : (
                    <p className="text-[13px] text-[#737d91]">No matching companies found for &ldquo;{searchQuery}&rdquo;</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ZONE 4: PAGINATION */}
      <div className="flex items-center justify-center gap-1.5 mt-6">
        <button className="h-8 px-3 rounded-full text-[12px] font-semibold text-[#737d91] hover:text-white transition">Prev</button>
        <button className="w-8 h-8 rounded-full bg-[#8174ff]/20 border border-[#8174ff]/50 text-white font-bold shadow-[0_0_12px_rgba(129,116,255,0.25)] text-[12px]">1</button>
        <button className="w-8 h-8 rounded-full border border-white/[0.08] bg-white/[0.03] text-[#737d91] hover:text-white hover:border-[#8174ff]/30 transition text-[12px]">2</button>
        <span className="text-[#737d91] text-xs px-1">...</span>
        <button className="w-8 h-8 rounded-full border border-white/[0.08] bg-white/[0.03] text-[#737d91] hover:text-white hover:border-[#8174ff]/30 transition text-[12px]">10</button>
        <button className="h-8 px-3 rounded-full text-[12px] font-semibold text-[#737d91] hover:text-white transition">Next</button>
      </div>
    </div>
  );
}
