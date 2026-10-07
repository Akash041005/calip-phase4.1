"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  ShieldCheck,
  Edit3,
  Globe,
  ArrowDown,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Check,
  Plus,
  Loader2,
} from "lucide-react";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../../lib/usersApi";
import { getTokens, getTokenOHLC, getTokenSupply, getTokenTrades } from "../../lib/tradingApi";

const DONUT_PALETTE = ["#0284c7", "#e67e22", "#d4af37", "#9b5de5", "#7c6cf0", "#fbbf24"];
const DONUT_CIRCUMFERENCE = 402;

const PLACEHOLDER_TOKEN = {
  id: "",
  name: "Loading…",
  symbol: "",
  contract: "",
  tag: "",
  about: "",
  mcap: "",
  owner: "",
  price: 0,
  change24h: 0,
};

export default function TokenDetailOverview({ tokenId = "grid", startupData = null }) {
  const router = useRouter();
  // Live token (J1). No mock fallback — backend is the source of truth.
  const [liveToken, setLiveToken] = useState(null);
  const [tokenMissing, setTokenMissing] = useState(false);
  useEffect(() => {
    let cancelled = false;
    getTokens({ limit: 100 })
      .then((res) => {
        if (cancelled) return;
        const items = res.items || [];
        const found = items.find((t) => t.id === tokenId || t.startupId === tokenId) || null;
        setLiveToken(found);
        setTokenMissing(!found);
      })
      .catch(() => {
        if (!cancelled) setTokenMissing(true);
      });
    return () => { cancelled = true; };
  }, [tokenId]);

  const matchedToken = liveToken || { ...PLACEHOLDER_TOKEN, id: tokenId };

  const token = useMemo(() => ({
    ...matchedToken,
    name: startupData?.startupName || matchedToken.name,
    symbol: startupData?.symbol || (startupData?.startupName ? startupData.startupName.slice(0, 5).toUpperCase() : matchedToken.symbol),
    tag: startupData?.industrySector || matchedToken.tag,
    about: startupData?.startupDescription || startupData?.description || matchedToken.about,
    mcap: startupData?.currentStartupValuation
      ? `₹ ${Number(startupData.currentStartupValuation).toLocaleString("en-IN")}`
      : matchedToken.mcap,
    owner: startupData?.founderAddress || startupData?.ownerAddress || matchedToken.owner,
  }), [matchedToken, startupData]);

  // Watchlist Integration (Real Backend)
  const targetId = startupData?._id || startupData?.id || tokenId;
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState("idle"); // "idle" | "adding" | "added" | "removing" | "error"
  const [watchlistError, setWatchlistError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function checkWatchlist() {
      if (!targetId) return;
      try {
        const res = await getWatchlist();
        if (cancelled) return;
        const items = res?.items || res?.data?.items || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
        const found = items.some((item) => {
          const itemId = item._id || item.id;
          return (
            (itemId && (itemId === targetId || String(itemId) === String(targetId))) ||
            (item.symbol && token.symbol && item.symbol.toLowerCase() === token.symbol.toLowerCase()) ||
            (item.startupName && token.name && item.startupName.toLowerCase() === token.name.toLowerCase())
          );
        });
        setIsInWatchlist(found);
        if (found) setWatchlistStatus("added");
      } catch {
        // Unauthenticated or endpoint unavailable
      }
    }
    checkWatchlist();
    return () => {
      cancelled = true;
    };
  }, [targetId, token.symbol, token.name]);

  const handleWatchlistToggle = async () => {
    if (!targetId) return;
    setWatchlistError("");
    if (isInWatchlist) {
      setWatchlistStatus("removing");
      try {
        await removeFromWatchlist(targetId);
        setIsInWatchlist(false);
        setWatchlistStatus("idle");
      } catch (err) {
        console.error("Failed to remove from watchlist:", err);
        setWatchlistError("Failed to remove");
        setWatchlistStatus("error");
        setTimeout(() => setWatchlistStatus("added"), 2500);
      }
    } else {
      setWatchlistStatus("adding");
      try {
        await addToWatchlist(targetId);
        setIsInWatchlist(true);
        setWatchlistStatus("added");
      } catch (err) {
        console.error("Failed to add to watchlist:", err);
        setWatchlistError("Failed to add");
        setWatchlistStatus("error");
        setTimeout(() => setWatchlistStatus("idle"), 2500);
      }
    }
  };

  // Chart Interactive State — candles come from live OHLC (J3).
  const [candles, setCandles] = useState([]);
  const [candlesLoading, setCandlesLoading] = useState(true);
  const [candlesError, setCandlesError] = useState("");
  const [livePrice, setLivePrice] = useState(0);
  const [priceFlash, setPriceFlash] = useState(null); // 'up' | 'down' | null
  const [activeTab, setActiveTab] = useState("recents");
  const [activeTf, setActiveTf] = useState("15m");
  const [visibleCount, setVisibleCount] = useState(38); // Zoom level
  const [panOffset, setPanOffset] = useState(0); // Pan position
  const [hoveredCandle, setHoveredCandle] = useState(null);
  const [cursorPos, setCursorPos] = useState(null); // { x, y, price }
  const [hoveredDonutSeg, setHoveredDonutSeg] = useState(null);
  const [payAmount, setPayAmount] = useState(100);

  const canvasRef = useRef(null);
  const chartContainerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  // Refs keep interval + hover handlers pure (no setState inside updaters).
  const candlesRef = useRef([]);
  const priceFlashTimeoutRef = useRef(null);
  const cursorRafRef = useRef(0);
  useEffect(() => {
    candlesRef.current = candles;
  }, [candles]);
  useEffect(() => {
    return () => {
      if (priceFlashTimeoutRef.current) clearTimeout(priceFlashTimeoutRef.current);
      if (cursorRafRef.current) cancelAnimationFrame(cursorRafRef.current);
    };
  }, []);

  // Live OHLC fetch (J3) on token/timeframe change + 30s refresh.
  // Replaces the previous random-walk simulation.
  useEffect(() => {
    let cancelled = false;
    let interval;
    async function loadCandles() {
      try {
        const { candles: raw } = await getTokenOHLC(tokenId, activeTf, 90);
        if (cancelled) return;
        if (!raw || raw.length === 0) {
          setCandles([]);
          setCandlesError("No candle data yet for this token.");
        } else {
          const mapped = raw.map((c) => ({
            timestamp: Number(c.timestamp) || Date.now(),
            open: Number(c.open),
            high: Number(c.high),
            low: Number(c.low),
            close: Number(c.close),
            volume: Number(c.volume) || 0,
            isGreen: Number(c.close) >= Number(c.open),
          }));
          setCandles(mapped);
          setCandlesError("");
          setLivePrice(mapped[mapped.length - 1].close);
        }
      } catch {
        if (!cancelled) setCandlesError("Could not load candles from the backend.");
      } finally {
        if (!cancelled) setCandlesLoading(false);
      }
    }
    loadCandles();
    interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      loadCandles();
    }, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
      if (priceFlashTimeoutRef.current) clearTimeout(priceFlashTimeoutRef.current);
    };
  }, [tokenId, activeTf]);

  // Live trades feed (J5).
  const [liveTokenTrades, setLiveTokenTrades] = useState([]);
  useEffect(() => {
    let cancelled = false;
    getTokenTrades(tokenId, 10)
      .then((res) => {
        if (!cancelled) setLiveTokenTrades(res.trades || []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [tokenId]);

  // Live supply + allocation (J4).
  const [tokenSupply, setTokenSupply] = useState(null);
  useEffect(() => {
    let cancelled = false;
    getTokenSupply(tokenId)
      .then((res) => {
        if (!cancelled) setTokenSupply(res);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [tokenId]);

  // Handle timeframe change
  const handleTfChange = (tf) => {
    setActiveTf(tf);
    setPanOffset(0);
  };

  // Zoom handlers
  const handleZoom = useCallback((direction, focusRatio = 0.5) => {
    setVisibleCount((prev) => {
      const step = Math.max(2, Math.floor(prev * 0.18));
      if (direction === "in") {
        return Math.max(14, prev - step);
      } else {
        return Math.min(90, prev + step);
      }
    });
  }, []);

  const handleResetZoom = () => {
    setVisibleCount(38);
    setPanOffset(0);
  };

  // Canvas Drawing Routine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    // Visible candle slice based on pan & zoom
    const totalCount = candles.length;
    const count = Math.min(visibleCount, totalCount);
    const maxOffset = totalCount - count;
    const safeOffset = Math.max(0, Math.min(maxOffset, panOffset));
    const startIdx = totalCount - count - safeOffset;
    const visibleCandles = candles.slice(startIdx, startIdx + count);

    if (visibleCandles.length === 0) return;

    // Price scaling
    const lows = visibleCandles.map((c) => c.low);
    const highs = visibleCandles.map((c) => c.high);
    const minP = Math.min(...lows) * 0.985;
    const maxP = Math.max(...highs) * 1.015;
    const pRange = maxP - minP || 0.0001;

    const rightMargin = 72;
    const bottomMargin = 28;
    const chartWidth = width - rightMargin;
    const chartHeight = height - bottomMargin;

    const toY = (price) => chartHeight - ((price - minP) / pRange) * (chartHeight - 30) - 10;
    const toPrice = (y) => maxP - ((y - 10) / (chartHeight - 30)) * pRange;

    // Grid lines & price labels
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fillStyle = "#5e6f85";
    ctx.font = "10px JetBrains Mono";
    ctx.textAlign = "right";

    const numPriceLines = 6;
    for (let i = 0; i <= numPriceLines; i++) {
      const p = minP + (i / numPriceLines) * pRange;
      const y = toY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      ctx.fillText(p < 0.01 ? p.toFixed(6) : p.toFixed(4), width - 8, y + 3);
    }

    // Candle geometry
    const candleSlot = chartWidth / count;
    const candleBodyWidth = Math.max(3, candleSlot * 0.65);

    // Draw Volume bars
    const maxVol = Math.max(...visibleCandles.map((c) => c.volume), 1);
    visibleCandles.forEach((c, i) => {
      const x = i * candleSlot + candleSlot / 2;
      const vHeight = (c.volume / maxVol) * 44;
      ctx.fillStyle = c.isGreen ? "rgba(124, 108, 240, 0.22)" : "rgba(255, 75, 96, 0.22)";
      ctx.fillRect(x - candleBodyWidth / 2, chartHeight - vHeight, candleBodyWidth, vHeight);
    });

    // Draw Candlesticks
    visibleCandles.forEach((c, i) => {
      const x = i * candleSlot + candleSlot / 2;
      const openY = toY(c.open);
      const closeY = toY(c.close);
      const highY = toY(c.high);
      const lowY = toY(c.low);

      const color = c.isGreen ? "#6366f1" : "#ff4b60";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      // Wick
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Body
      const topY = Math.min(openY, closeY);
      const bHeight = Math.max(2, Math.abs(closeY - openY));
      ctx.fillRect(x - candleBodyWidth / 2, topY, candleBodyWidth, bHeight);
    });

    // Current live price horizontal indicator
    const lastCandle = visibleCandles[visibleCandles.length - 1];
    const liveY = toY(lastCandle.close);

    ctx.strokeStyle = "#6366f1";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, liveY);
    ctx.lineTo(chartWidth, liveY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Live price tag on right scale
    ctx.fillStyle = "#7c6cf0";
    ctx.fillRect(chartWidth, liveY - 9, rightMargin - 4, 18);
    ctx.fillStyle = "#070a0f";
    ctx.font = "bold 10px JetBrains Mono";
    ctx.textAlign = "center";
    ctx.fillText(lastCandle.close.toFixed(6), chartWidth + rightMargin / 2 - 2, liveY + 3.5);

    // Crosshair & Hover Tooltip
    if (cursorPos && cursorPos.x < chartWidth && cursorPos.y < chartHeight) {
      const { x, y } = cursorPos;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.setLineDash([3, 3]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, chartHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price indicator on Y-axis
      const hoverPrice = toPrice(y);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(chartWidth, y - 9, rightMargin - 4, 18);
      ctx.strokeStyle = "#818cf8";
      ctx.strokeRect(chartWidth, y - 9, rightMargin - 4, 18);
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px JetBrains Mono";
      ctx.textAlign = "center";
      ctx.fillText(hoverPrice.toFixed(6), chartWidth + rightMargin / 2 - 2, y + 3.5);

      // Find hovered candle — draw-only. State updates live in
      // handleMouseMove (rAF-throttled); calling setState inside this draw
      // effect caused an extra render per mousemove/frame.
      const candleIdx = Math.floor(x / candleSlot);
      if (candleIdx >= 0 && candleIdx < visibleCandles.length) {
        const hCandle = hoveredCandle || visibleCandles[candleIdx];

        // Date pill on X-axis
        const d = new Date(hCandle.timestamp);
        const dateStr = `${d.getDate()} ${d.toLocaleString("default", { month: "short" })} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(x - 45, chartHeight + 4, 90, 18);
        ctx.strokeStyle = "#818cf8";
        ctx.strokeRect(x - 45, chartHeight + 4, 90, 18);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(dateStr, x, chartHeight + 16);
      }
    }
  }, [candles, visibleCount, panOffset, cursorPos, hoveredCandle]);

  useEffect(() => {
    const element = chartContainerRef.current || canvasRef.current;
    if (!element) return undefined;

    const handleWheel = (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleZoom(event.deltaY < 0 ? "in" : "out");
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, [handleZoom]);

  const handleMouseDown = (event) => {
    if (event.button !== 0) return;
    isDraggingRef.current = true;
    dragStartXRef.current = event.clientX;
    dragStartOffsetRef.current = panOffset;
    setCursorPos(null);
  };

  const handleMouseMove = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (isDraggingRef.current) {
      const count = Math.min(visibleCount, candlesRef.current.length);
      if (count === 0) return;
      const slotWidth = (rect.width - 72) / count;
      const offset = Math.max(0, dragStartOffsetRef.current + Math.round((dragStartXRef.current - event.clientX) / slotWidth));
      setPanOffset((current) => (current === offset ? current : offset));
      return;
    }

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (cursorRafRef.current) return;
    cursorRafRef.current = requestAnimationFrame(() => {
      cursorRafRef.current = 0;
      setCursorPos({ x, y });

      const allCandles = candlesRef.current;
      const count = Math.min(visibleCount, allCandles.length);
      if (count === 0) {
        setHoveredCandle(null);
        return;
      }
      const maxOffset = allCandles.length - count;
      const safeOffset = Math.max(0, Math.min(maxOffset, panOffset));
      const startIndex = allCandles.length - count - safeOffset;
      const visibleCandles = allCandles.slice(startIndex, startIndex + count);
      const slotWidth = (rect.width - 72) / count;
      const hovered = visibleCandles[Math.floor(x / slotWidth)] || null;
      setHoveredCandle((current) => current?.timestamp === hovered?.timestamp ? current : hovered);
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    setCursorPos(null);
    setHoveredCandle(null);
  };

  const virtualPrice = 1.25;
  const receiveAmount = (payAmount * virtualPrice) / (livePrice || 0.00143);

  // Active stats for header (either hovered candle or latest candle)
  const displayCandle = hoveredCandle || candles[candles.length - 1];
  const deltaPct = displayCandle
    ? (((displayCandle.close - displayCandle.open) / displayCandle.open) * 100).toFixed(2)
    : "0.00";
  const isCandleGreen = displayCandle ? displayCandle.close >= displayCandle.open : true;

  // Allocation donut driven by live supply (J4). No hardcoded fallback.
  const donutSegments = useMemo(() => {
    const alloc = tokenSupply?.allocation;
    if (!Array.isArray(alloc) || alloc.length === 0) return [];
    let acc = 0;
    return alloc.map((a, i) => {
      const pct = Number(a.pct) || 0;
      const seg = {
        title: a.title || `Tranche ${i + 1}`,
        desc: "",
        amount: Number(a.amount) >= 1e6 ? `${(Number(a.amount) / 1e6).toFixed(1)}M` : `${Number(a.amount || 0).toLocaleString()}`,
        pct,
        color: DONUT_PALETTE[i % DONUT_PALETTE.length],
        dash: (pct / 100) * DONUT_CIRCUMFERENCE,
        offset: -(acc / 100) * DONUT_CIRCUMFERENCE,
      };
      acc += pct;
      return seg;
    });
  }, [tokenSupply]);
  const supplyLayers = useMemo(() => {
    if (!Array.isArray(tokenSupply?.layers)) return [];
    return tokenSupply.layers
      .map((layer, index) => ({
        label: layer.label || `Allocation ${index + 1}`,
        amount: Number(layer.amount) || 0,
        color: DONUT_PALETTE[index % DONUT_PALETTE.length],
      }))
      .filter((layer) => layer.amount > 0);
  }, [tokenSupply]);
  const supplyCap = Number(tokenSupply?.cap) || supplyLayers.reduce((sum, layer) => sum + layer.amount, 0);
  const supplyCapLabel = tokenSupply?.cap
    ? `${(Number(tokenSupply.cap) / 1e9).toFixed(1)}B Cap`
    : "Cap not published";

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-6 text-[#f8fafc]">
      {/* ASSET HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#1a2436] bg-[#0f1520] text-neutral-400 hover:text-white hover:bg-[#141d2c] transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-9 h-9 rounded-lg bg-[#151f2e] border border-[#24354c] flex items-center justify-center text-[18px]">
            ▦
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[20px] font-extrabold text-white tracking-tight">{token.name}</h1>
            <span className="text-[13px] font-bold text-neutral-400">{token.symbol}</span>
            <span
              onClick={() => navigator.clipboard.writeText(token.contract)}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-[#1a2436] text-[12px] font-mono text-neutral-400 hover:text-[#7c6cf0] cursor-pointer transition"
              title="Click to copy contract"
            >
              {token.contract}
              <Copy className="w-3 h-3" />
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#7c6cf0]/10 border border-[#7c6cf0]/30 text-[#7c6cf0] text-[12px] font-semibold">
              {token.tag}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Watchlist Action */}
          <button
            onClick={handleWatchlistToggle}
            disabled={watchlistStatus === "adding" || watchlistStatus === "removing"}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition border ${
              isInWatchlist
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 group"
                : "bg-[#6366F1]/10 border-[#6366F1]/30 text-[#818cf8] hover:bg-[#6366F1] hover:text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isInWatchlist ? "Click to remove from Watchlist" : "Add to your Watchlist"}
          >
            {watchlistStatus === "adding" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Adding...</span>
              </>
            ) : watchlistStatus === "removing" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Removing...</span>
              </>
            ) : isInWatchlist ? (
              <>
                <Check className="w-3.5 h-3.5 group-hover:hidden" />
                <span className="group-hover:hidden">✓ In Watchlist</span>
                <span className="hidden group-hover:inline">Remove</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add to Watchlist</span>
              </>
            )}
          </button>
          {watchlistError && (
            <span className="text-[11px] text-rose-400 font-medium">{watchlistError}</span>
          )}

          <div className="h-5 w-px bg-[#1a2436] mx-1" />

          <button className="w-8 h-8 rounded-lg border border-[#1a2436] bg-[#0f1520] text-neutral-400 hover:text-white flex items-center justify-center" title="Verified">
            <ShieldCheck className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg border border-[#1a2436] bg-[#0f1520] text-neutral-400 hover:text-white flex items-center justify-center" title="Edit Metadata">
            <Edit3 className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg border border-[#1a2436] bg-[#0f1520] text-neutral-400 hover:text-white flex items-center justify-center" title="Official Website">
            <Globe className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg border border-[#1a2436] bg-[#0f1520] text-neutral-400 hover:text-white flex items-center justify-center" title="X / Twitter">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </button>
        </div>
      </div>

      {/* 3-COLUMN WORKSPACE */}
      {tokenMissing && !liveToken && (
        <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-[12.5px] text-amber-300">
          This token isn&apos;t on the backend yet — showing startup info only. Charts, trades and allocation will appear once it&apos;s listed via <span className="font-mono">GET /tokens</span>.
        </p>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_340px] gap-4 items-start">
        {/* COLUMN 1: TRADES FEED */}
        <aside className="hidden lg:flex flex-col rounded-[14px] border border-[#1a2436] bg-[#0f1520] p-4 shadow-xl">
          <h3 className="text-[14px] font-bold text-white mb-2">Trades</h3>
          <div className="flex items-center gap-4 border-b border-[#1a2436] pb-2 mb-3">
            <button
              onClick={() => setActiveTab("recents")}
              className={`text-[12.5px] font-semibold relative pb-1 transition ${
                activeTab === "recents" ? "text-[#7c6cf0]" : "text-neutral-500 hover:text-white"
              }`}
            >
              Recents
              {activeTab === "recents" && <span className="absolute bottom-[-9px] left-0 w-full h-0.5 bg-[#7c6cf0]"></span>}
            </button>
            <button
              onClick={() => setActiveTab("yours")}
              className={`text-[12.5px] font-semibold transition ${
                activeTab === "yours" ? "text-[#7c6cf0]" : "text-neutral-500 hover:text-white"
              }`}
            >
              Yours
            </button>
          </div>

          <div className="space-y-3 font-mono text-[12px]">
            {liveTokenTrades.length === 0 ? (
              <p className="py-2 text-center font-sans text-[12px] text-[#5e6f85]">
                No trades yet for this token.
              </p>
            ) : (
            liveTokenTrades.map((tr, idx) => (
              <div key={tr.addr ? `${tr.addr}-${idx}` : idx} className="border-b border-white/[0.03] pb-2.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ background: tr.isBuy ? "#7c6cf0" : "#f43f5e" }}></span>
                    <span className="text-neutral-400">{tr.addr}</span>
                  </div>
                  <span className={`font-semibold ${tr.isBuy ? "text-[#7c6cf0]" : "text-rose-500"}`}>
                    {tr.isBuy ? "+" : "-"}{Number(tr.amount).toLocaleString()} {token.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                  <span>{tr.time ? new Date(tr.time).toLocaleString() : ""}</span>
                  <span>@ ${Number(tr.price).toFixed(6)}</span>
                </div>
              </div>
            )))}
          </div>
        </aside>

        {/* COLUMN 2: CENTER AREA (CHART, ABOUT, TEAM, ALLOCATION, SUPPLY, FORUM) */}
        <section className="space-y-4">
          {/* 1. Interactive Candlestick Chart */}
          <div className="rounded-[14px] border border-[#1a2436] bg-[#0f1520] p-5 shadow-xl relative">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-baseline gap-2.5">
                <span
                  className={`text-[28px] font-extrabold font-mono text-white tracking-tight transition-colors duration-300 ${
                    priceFlash === "up" ? "text-[#7c6cf0]" : priceFlash === "down" ? "text-rose-400" : ""
                  }`}
                >
                  ${(displayCandle ? displayCandle.close : livePrice).toFixed(6)}
                </span>
                <span className={`text-[14px] font-bold font-mono ${isCandleGreen ? "text-[#7c6cf0]" : "text-rose-500"}`}>
                  {isCandleGreen ? "+" : ""}{deltaPct}%
                </span>
              </div>

              {/* Chart Actions: Zoom In, Zoom Out, Reset */}
              <div className="flex items-center gap-1.5 bg-[#121927] border border-[#1a2436] px-2 py-1 rounded-lg text-[12px]">
                <button
                  onClick={() => handleZoom("in")}
                  className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/10"
                  title="Zoom In (or scroll wheel)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleZoom("out")}
                  className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/10"
                  title="Zoom Out (or scroll wheel)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/10"
                  title="Reset View"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Timeframe & Display Toggles */}
            <div className="flex flex-wrap items-center justify-between border-y border-[#1a2436] py-2 mb-3 text-[12px]">
              <div className="flex items-center gap-1">
                {["15m", "1h", "4h", "1d"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => handleTfChange(tf)}
                    className={`px-2.5 py-1 rounded font-semibold transition ${
                      activeTf === tf ? "bg-white/15 text-white shadow-sm" : "text-neutral-500 hover:text-white"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
                <span className="text-neutral-600 mx-1">|</span>
                <span className="text-neutral-400 font-semibold cursor-pointer">fx Indicators</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-semibold text-white">Price / MCAP</span>
                <div className="inline-flex bg-[#121927] border border-[#1a2436] rounded p-0.5 text-[11px] font-bold">
                  <span className="px-2 py-0.5 bg-[#202b3d] text-white rounded">USD</span>
                  <span className="px-2 py-0.5 text-neutral-500 cursor-pointer">VIRTUAL</span>
                </div>
              </div>
            </div>

            {/* Canvas Viewport with Pan, Zoom & Hover Tracking */}
            <div
              ref={chartContainerRef}
              style={{ touchAction: "none", overscrollBehavior: "contain" }}
              className="relative w-full h-[320px] bg-[#0a0e14] rounded-lg border border-white/[0.03] overflow-hidden select-none cursor-crosshair"
            >
              {/* Dynamic OHLC Bar on Top */}
              <div className="absolute top-2 left-3 right-3 text-[11px] font-mono text-neutral-400 pointer-events-none z-10 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-white font-bold">{token.symbol}/USD</span> · {activeTf} · GeckoTerminal{" "}
                  <span className="text-[#7c6cf0]">●</span>
                </div>
                {displayCandle && (
                  <div className="flex items-center gap-3 text-[10.5px]">
                    <span>O: <strong className="text-white">{displayCandle.open.toFixed(6)}</strong></span>
                    <span>H: <strong className="text-white">{displayCandle.high.toFixed(6)}</strong></span>
                    <span>L: <strong className="text-white">{displayCandle.low.toFixed(6)}</strong></span>
                    <span>C: <strong className={isCandleGreen ? "text-[#7c6cf0]" : "text-rose-400"}>{displayCandle.close.toFixed(6)}</strong></span>
                    <span>Vol: <strong className="text-white">{displayCandle.volume}K</strong></span>
                  </div>
                )}
              </div>

              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{ touchAction: "none", overscrollBehavior: "contain" }} className="w-full h-full block"
              />
              {(candlesLoading || candles.length === 0) && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <p className="rounded-lg border border-white/10 bg-[#111827]/90 px-4 py-2 text-[12px] text-[#94a3b8]">
                    {candlesLoading ? "Loading candles…" : (candlesError || "No candle data yet for this token.")}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 mt-2.5">
              <span>💡 Scroll wheel to zoom in/out · Click & drag to pan history</span>
              <span>powered by <strong className="text-[#7c6cf0]">Calip · GeckoTerminal</strong></span>
            </div>
          </div>

          {/* 2. About Card */}
          <div className="rounded-[14px] border border-[#1a2436] bg-[#0f1520] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[15px] font-bold text-white">About</h3>
              <span className="text-[12px] text-[#7c6cf0] cursor-pointer">See more ▾</span>
            </div>
            <p className="text-[13px] leading-relaxed text-neutral-300">
              {token.about}
            </p>
          </div>

          {/* 3. Team Card */}
          <div className="rounded-[14px] border border-[#1a2436] bg-[#0f1520] p-5 shadow-xl">
            <h3 className="text-[15px] font-bold text-white mb-3">Team</h3>
            <div className="inline-flex items-center gap-2.5 bg-[#121927] border border-[#1a2436] px-3.5 py-2 rounded-lg">
              <span className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-xs">▦</span>
              <span className="font-mono text-[13px] text-white">{token.owner}</span>
              <span className="text-[11px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-500/40 px-2 py-0.5 rounded-full">
                Owner
              </span>
            </div>
          </div>

          {/* 4. Allocation Donut Section with Hover Tooltip */}
          <div className="rounded-[14px] border border-[#1a2436] bg-[#0f1520] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-white">Allocation</h3>
              <span className="text-[11.5px] text-[#7c6cf0] bg-[#7c6cf0]/10 px-2.5 py-0.5 rounded-full">
                {supplyCapLabel}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {donutSegments.length === 0 ? (
                <p className="w-full py-8 text-center text-[12.5px] text-[#5e6f85]">
                  Allocation not published for this token yet.
                </p>
              ) : (
              <>
              <div className="relative w-40 h-40 flex-shrink-0 cursor-pointer">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  {donutSegments.map((seg, i) => (
                    <circle
                      key={seg.title}
                      cx="80"
                      cy="80"
                      r="64"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth={hoveredDonutSeg === i ? "24" : "19"}
                      strokeDasharray={`${seg.dash} ${402 - seg.dash}`}
                      strokeDashoffset={seg.offset}
                      onMouseEnter={() => setHoveredDonutSeg(i)}
                      onMouseLeave={() => setHoveredDonutSeg(null)}
                      className="transition-all duration-200 cursor-pointer"
                    />
                  ))}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                    {hoveredDonutSeg !== null ? donutSegments[hoveredDonutSeg].title.slice(0, 14) : "Total"}
                  </span>
                  <span className="text-[18px] font-extrabold font-mono text-white">
                    {hoveredDonutSeg !== null ? `${donutSegments[hoveredDonutSeg].pct}%` : supplyCapLabel}
                  </span>
                </div>
              </div>

              <div className="space-y-3 flex-1 w-full text-[12.5px]">
                {donutSegments.map((item, i) => (
                  <div
                    key={item.title}
                    onMouseEnter={() => setHoveredDonutSeg(i)}
                    onMouseLeave={() => setHoveredDonutSeg(null)}
                    className={`flex items-start justify-between gap-2 p-1 rounded-md transition ${
                      hoveredDonutSeg === i ? "bg-white/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background: item.color }} />
                      <div>
                        <div className="font-semibold text-white leading-tight">{item.title}</div>
                        <div className="text-[11px] text-neutral-500">{item.desc}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-white">{item.amount}</div>
                      <div className="text-[11px] text-neutral-500">{item.pct}%</div>
                    </div>
                  </div>
                ))}
              </div>
              </>
              )}
            </div>
          </div>

          {/* 5. Supply allocation from the backend token supply record */}
          <div className="rounded-[14px] border border-[#1a2436] bg-[#0f1520] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-white">Supply by category</h3>
              <span className="text-[11px] text-[#5e6f85] font-mono">{supplyCapLabel}</span>
            </div>

            {supplyLayers.length === 0 ? (
              <p className="rounded-lg border border-white/5 bg-[#0a0e14] px-4 py-8 text-center text-[12.5px] text-[#5e6f85]">
                Supply breakdown isn&apos;t available for this token yet.
              </p>
            ) : (
              <div className="space-y-4 rounded-lg border border-white/[0.03] bg-[#0a0e14] p-4">
                {supplyLayers.map((layer) => {
                  const percentage = supplyCap > 0 ? Math.min(100, (layer.amount / supplyCap) * 100) : 0;
                  return (
                    <div key={layer.label}>
                      <div className="mb-1.5 flex items-center justify-between gap-4 text-[12px]">
                        <span className="truncate font-medium text-neutral-300">{layer.label}</span>
                        <span className="shrink-0 font-mono text-neutral-400">
                          {layer.amount.toLocaleString("en-IN")} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: layer.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 6. Forum */}
          <div className="rounded-[14px] border border-[#1a2436] bg-[#0f1520] p-5 shadow-xl">
            <h3 className="text-[15px] font-bold text-white mb-3">Forum</h3>
            <div className="rounded-lg bg-gradient-to-b from-[#121a26] to-[#0e141e] border border-[#1a2436] p-5 text-center flex flex-col items-center gap-3 mb-3">
              <p className="text-[13px] text-neutral-300 max-w-sm">
                Hold at least <strong className="text-white">10,000 ${token.symbol}</strong> or <strong className="text-white">1,000 veVIRTUAL</strong> to join the conversation.
              </p>
              <button
                onClick={() => alert(`Redirecting to swap for $${token.symbol}`)}
                className="px-6 py-2 rounded-xl bg-[#6366F1] text-white font-extrabold text-[13px] hover:shadow-[0_0_16px_rgba(99,102,241,0.4)] transition active:scale-95"
              >
                Buy ${token.symbol}
              </button>
            </div>

            <div className="flex items-start gap-3 bg-[#121927] border border-[#1a2436] p-3 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-[#7c6cf0]/80 flex-shrink-0"></div>
              <div>
                <div className="text-[12px] font-mono text-neutral-400">
                  <span className="text-white font-semibold">0x6E09...45D7</span> · 2 months
                </div>
                <p className="text-[13px] text-neutral-200 mt-0.5">who&apos;s the dev?</p>
              </div>
            </div>
          </div>
        </section>

        {/* COLUMN 3: RIGHT SIDEBAR */}
        <aside className="space-y-4">
          {/* Top Route & Connect Wallet Card (Screenshot 2) */}
          <div className="rounded-[14px] border border-[#1a2436] bg-[#0f1520] p-4 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between text-[12px] text-neutral-400">
              <span className="font-semibold text-neutral-300">Route</span>
              <div className="flex items-center gap-2">
                <button className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition">
                  <Search className="w-3.5 h-3.5" />
                </button>
                <button className="px-3 py-0.5 rounded-full border border-[#6366F1]/40 text-[#6366F1] text-[11.5px] font-semibold bg-[rgba(99,102,241,0.1)] hover:bg-[#6366F1] hover:text-white transition">
                  Login
                </button>
              </div>
            </div>
            <button
              onClick={() => alert("Connecting Web3 Wallet...")}
              className="w-full py-2.5 rounded-xl bg-[#6366F1] text-white font-extrabold text-[13.5px] shadow-[0_0_16px_rgba(99,102,241,0.3)] hover:shadow-[0_0_24px_rgba(99,102,241,0.5)] transition active:scale-[0.99]"
            >
              Connect Wallet
            </button>
          </div>

          {/* 1. Market Overview Card */}
          <div className="rounded-[14px] border border-[#1a2436] bg-[#0f1520] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-bold text-white">Market Overview</h3>
              <span className="text-[11.5px] text-[#7c6cf0] cursor-pointer hover:underline">Mechanics</span>
            </div>
            <div className="grid grid-cols-2 gap-3.5 text-[12px]">
              <div>
                <div className="text-[#5e6f85] uppercase text-[10.5px]">Mcap</div>
                <div className="text-[16px] font-bold font-mono text-white">{token.mcap}</div>
              </div>
              <div>
                <div className="text-[#5e6f85] uppercase text-[10.5px]">FDV</div>
                <div className="text-[16px] font-bold font-mono text-white">{token.fdv}</div>
              </div>
              <div>
                <div className="text-[#5e6f85] uppercase text-[10.5px]">Liq.</div>
                <div className="text-[16px] font-bold font-mono text-white">{token.liquidity}</div>
              </div>
              <div>
                <div className="text-[#5e6f85] uppercase text-[10.5px]">Holders</div>
                <div className="text-[16px] font-bold font-mono text-white">{token.holders}</div>
              </div>
              <div className="col-span-2">
                <div className="text-[#5e6f85] uppercase text-[10.5px]">24h Vol</div>
                <div className="text-[16px] font-bold font-mono text-white">{token.vol}</div>
              </div>
            </div>
          </div>

          {/* 2. Swap Trade Box */}
          <div className="rounded-[14px] border border-[#1a2436] bg-[#0f1520] p-4 shadow-xl space-y-3">
            <div className="rounded-lg bg-[#121927] border border-[#1a2436] p-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#5e6f85] font-semibold">
                <span>Pay Total</span>
                <div className="flex gap-1">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setPayAmount((500 * pct) / 100)}
                      className="px-2 py-0.5 rounded bg-[#162132] border border-[#22334a] text-neutral-300 hover:text-[#7c6cf0] hover:border-[#7c6cf0]/40 text-[10.5px] font-mono transition"
                    >
                      {pct === 100 ? "Max" : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="bg-transparent border-none outline-none font-mono text-[20px] font-bold text-white w-full"
                />
                <span className="px-2.5 py-1 rounded-full bg-[#1c2636] border border-[#223249] text-[12px] font-bold text-white whitespace-nowrap">
                  🌱 VIRTUAL ▾
                </span>
              </div>
              <div className="text-[11px] font-mono text-neutral-500">${(payAmount * virtualPrice).toFixed(2)}</div>
            </div>

            <div className="flex justify-center -my-1">
              <div className="w-7 h-7 rounded-full bg-[#182333] border border-[#6366F1]/30 flex items-center justify-center text-[#6366F1] shadow-[0_0_8px_rgba(99,102,241,0.2)]">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="rounded-lg bg-[#121927] border border-[#1a2436] p-3 space-y-1.5">
              <span className="text-[11px] text-[#5e6f85] font-semibold">Guaranteed Receive Amount</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[19px] font-bold text-white">{receiveAmount.toFixed(2)}</span>
                <span className="px-2.5 py-1 rounded-full bg-[#1c2636] border border-[#223249] text-[12px] font-bold text-white whitespace-nowrap">
                  ▦ {token.symbol}
                </span>
              </div>
              <div className="text-[11px] font-mono text-neutral-500">${(payAmount * virtualPrice).toFixed(2)}</div>
            </div>

            <div className="flex justify-between text-[11px] text-neutral-500">
              <span>Slippage: <strong className="text-neutral-300">3%</strong></span>
              <span>Price Impact: <strong className="text-neutral-300">--</strong></span>
            </div>

            <button
              onClick={() => alert(`⚡ Order Placed! Swapped for ${token.symbol}`)}
              className="w-full py-3 rounded-xl bg-[#6366F1] text-white font-extrabold text-[14px] hover:shadow-[0_0_20px_rgba(99,102,241,0.45)] transition active:scale-[0.99]"
            >
              Buy ${token.symbol}
            </button>
          </div>

          {/* 3. Holders Card */}
          <div className="rounded-[14px] border border-[#1a2436] bg-[#0f1520] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[14px] font-bold text-white">Holders (1.7K)</h3>
              <span className="text-[11.5px] text-[#7c6cf0] cursor-pointer hover:underline">View top 500</span>
            </div>

            <div className="flex justify-between text-[11.5px] mb-1.5">
              <span className="text-[#7c6cf0] font-semibold">● Top 10: 73.5%</span>
              <span className="text-neutral-500 font-semibold">● Others: 26.5%</span>
            </div>

            <div className="w-full h-1 bg-[#202b3c] rounded-full overflow-hidden mb-3">
              <div className="h-full w-[73.5%] bg-[#7c6cf0]"></div>
            </div>

            <div className="space-y-2 text-[12px] max-h-[220px] overflow-y-auto">
              {[
                { addr: "0xd7c2...cc00", badge: "Unlocker", val: "349.9M GRID", color: "#ef4444" },
                { addr: "0xe289...ee8a", badge: "ACF Vault", val: "189.5M GRID", color: "#6366f1" },
                { addr: "0xa072...0f27", badge: "LP", val: "52.6M GRID", color: "#ec4899" },
                { addr: "0xefc1...7e5f", badge: "ACF Pool", val: "51.3M GRID", color: "#3b82f6" },
                { addr: "0x829d...224a", badge: null, val: "44.8M GRID", color: "#7c6cf0" },
              ].map((h, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: h.color }}></span>
                    <span className="font-mono text-neutral-400">{h.addr}</span>
                    {h.badge && <span className="text-[10px] px-1 rounded bg-white/5 text-neutral-400">{h.badge}</span>}
                  </div>
                  <span className="font-mono font-semibold text-white">{h.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Twitter Feed Card (Matching Screenshot 3) */}
          <div className="rounded-[14px] border border-[#1a2436] bg-[#0f1520] p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[14px] font-bold text-white">Twitter Feed</h3>
              <div className="flex items-center gap-2">
                <button className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition">
                  <Search className="w-3.5 h-3.5" />
                </button>
                <button className="px-2.5 py-0.5 rounded-full border border-[#6366F1]/40 text-[#6366F1] text-[11px] font-semibold bg-[rgba(99,102,241,0.1)] hover:bg-[#6366F1] hover:text-white transition">
                  Login
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-neutral-800 flex items-center justify-center text-[10px]">▦</span>
                  <span className="font-bold text-white">Grid</span>
                  <span className="text-neutral-500">@grid_arena</span>
                </div>
                <span className="text-neutral-500 text-[11px]">Sep 7</span>
              </div>
              <p className="text-[12.5px] text-neutral-300 leading-relaxed">
                Wall Street gets the day off. Crypto doesn&apos;t. Stocks. Crypto. Prediction Markets. Perps. Markets run on different clocks. Traders shouldn&apos;t need different worlds.
              </p>
              <div className="rounded border border-[#1a2436] bg-[#0b0e14] p-3 text-center text-[11px] font-extrabold text-[#7c6cf0] tracking-wider shadow-inner">
                MARKETS DON&apos;T SHARE A CLOCK.<br />THEY SHOULDN&apos;T NEED DIFFERENT WORLDS.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
