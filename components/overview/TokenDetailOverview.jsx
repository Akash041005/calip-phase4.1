"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Rocket,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Coins,
  TrendingUp,
  ExternalLink,
  Users,
  Award,
  Sparkles,
} from "lucide-react";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../../lib/usersApi";
import { getTokens, getTokenOHLC, getTokenSupply, getTokenTrades, getTokenHolders } from "../../lib/tradingApi";
import { getPresaleByStartupId, getPresaleBids, placePresaleBid } from "../../lib/presalesApi";
import { useAuth } from "../auth/AuthProvider";
import TokenTradePanel from "../marketplace/TokenTradePanel";
import { useTheme } from "../auth/ThemeProvider";

const DONUT_PALETTE = ["#38bdf8", "#f59e0b", "#10b981", "#64748b", "#06b6d4", "#a855f7"];
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
  const { isDark } = useTheme();
  const { user, address, isAuthenticated, openConnectModal } = useAuth();

  // 1. Live token check — backend is the sole source of truth
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

  // 2. Real Presale / Auction check for this startup
  const targetId = startupData?._id || startupData?.id || tokenId;
  const startupId = startupData?._id || liveToken?.startupId || targetId;

  const [presale, setPresale] = useState(null);
  const [presaleLoading, setPresaleLoading] = useState(true);
  const [presaleBids, setPresaleBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [biddingSubmitting, setBiddingSubmitting] = useState(false);
  const [bidSuccess, setBidSuccess] = useState("");
  const [bidError, setBidError] = useState("");

  const refreshPresale = useCallback(async () => {
    if (!startupId) return;
    try {
      const p = await getPresaleByStartupId(startupId);
      setPresale(p || null);
      if (p?._id) {
        const bidsRes = await getPresaleBids(p._id);
        const list = Array.isArray(bidsRes) ? bidsRes : bidsRes?.data || [];
        setPresaleBids(Array.isArray(list) ? list : []);
      }
    } catch {
      // ignore
    } finally {
      setPresaleLoading(false);
    }
  }, [startupId]);

  useEffect(() => {
    refreshPresale();
  }, [refreshPresale]);

  const matchedToken = liveToken || { ...PLACEHOLDER_TOKEN, id: tokenId };

  const token = useMemo(() => ({
    ...matchedToken,
    name: startupData?.startupName || matchedToken.name,
    symbol: startupData?.symbol || (startupData?.startupName ? startupData.startupName.slice(0, 5).toUpperCase() : matchedToken.symbol),
    tag: startupData?.industrySector || startupData?.category || matchedToken.tag,
    about: startupData?.startupDescription || startupData?.description || matchedToken.about,
    mcap: startupData?.currentStartupValuation
      ? !isNaN(Number(startupData.currentStartupValuation))
        ? `₹ ${Number(startupData.currentStartupValuation).toLocaleString("en-IN")}`
        : startupData.currentStartupValuation
      : matchedToken.mcap,
    owner: startupData?.founderAddress || startupData?.ownerAddress || matchedToken.owner,
  }), [matchedToken, startupData]);

  // 3. Watchlist Integration (Real Backend)
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState("idle");
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
    return () => { cancelled = true; };
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
        setWatchlistError("Failed to add");
        setWatchlistStatus("error");
        setTimeout(() => setWatchlistStatus("idle"), 2500);
      }
    }
  };

  // 4. Handle Placing an Auction Bid directly from this page
  const handlePlaceAuctionBid = async (e) => {
    if (e) e.preventDefault();
    if (!presale?._id) return;
    if (!isAuthenticated) {
      openConnectModal?.();
      return;
    }

    const amount = Number(bidAmount);
    if (!amount || amount <= 0) {
      setBidError("Please enter a valid investment amount.");
      return;
    }

    const minInv = Number(presale.minInvestment) || 0;
    const maxInv = Number(presale.maxInvestment) || 0;

    if (minInv > 0 && amount < minInv) {
      setBidError(`Minimum bid is ₹${minInv.toLocaleString("en-IN")}`);
      return;
    }
    if (maxInv > 0 && amount > maxInv) {
      setBidError(`Maximum bid is ₹${maxInv.toLocaleString("en-IN")}`);
      return;
    }

    const tokenPrice = Number(presale.tokenPrice) || 1;
    const tokens = Math.floor(amount / tokenPrice);
    if (tokens <= 0) {
      setBidError("Calculated tokens must be greater than zero.");
      return;
    }

    setBiddingSubmitting(true);
    setBidError("");
    setBidSuccess("");

    try {
      await placePresaleBid(presale._id, {
        bidAmount: amount,
        tokenAmount: tokens,
      });
      setBidSuccess(`✅ Commitment of ₹${amount.toLocaleString("en-IN")} recorded! You will receive ~${tokens.toLocaleString()} tokens upon successful auction close.`);
      setBidAmount("");
      await refreshPresale();
    } catch (err) {
      setBidError(err?.message || "Failed to place bid");
    } finally {
      setBiddingSubmitting(false);
    }
  };

  // Secondary Trading State (used only when liveToken is true)
  const [candles, setCandles] = useState([]);
  const [candlesLoading, setCandlesLoading] = useState(true);
  const [candlesError, setCandlesError] = useState("");
  const [livePrice, setLivePrice] = useState(0);
  const [priceFlash, setPriceFlash] = useState(null);
  const [activeTab, setActiveTab] = useState("recents");
  const [activeTf, setActiveTf] = useState("15m");
  const [liveTokenTrades, setLiveTokenTrades] = useState([]);
  const [tokenSupply, setTokenSupply] = useState(null);
  const [tokenHolders, setTokenHolders] = useState(null);

  useEffect(() => {
    if (!liveToken) return;
    let cancelled = false;
    getTokenOHLC(tokenId, activeTf, 90)
      .then((res) => {
        if (cancelled) return;
        const raw = res?.candles || [];
        setCandles(raw);
        if (raw.length > 0) setLivePrice(raw[raw.length - 1].close);
        setCandlesError(raw.length === 0 ? "No secondary trades recorded yet." : "");
      })
      .catch(() => {
        if (!cancelled) setCandlesError("Could not load candles from backend.");
      })
      .finally(() => {
        if (!cancelled) setCandlesLoading(false);
      });

    getTokenTrades(tokenId, 10).then((res) => {
      if (!cancelled) setLiveTokenTrades(res.trades || []);
    }).catch(() => {});

    getTokenSupply(tokenId).then((res) => {
      if (!cancelled) setTokenSupply(res);
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [liveToken, tokenId, activeTf]);

  // Derived startup details
  const startupName = startupData?.startupName || token.name || "Startup Dossier";
  const startupStage = startupData?.stage || startupData?.status || "pending";
  const isAuctionLive = presale?.status === "active";
  const targetRaise = (presale?.totalTokens || 0) * (presale?.tokenPrice || 0);
  const raisedAmount = presale?.raisedAmount ?? ((presale?.soldTokens || 0) * (presale?.tokenPrice || 0));
  const softCapAmount = targetRaise * 0.7; // 70% soft cap rule
  const progressPercent = targetRaise > 0 ? Math.min(100, (raisedAmount / targetRaise) * 100) : 0;
  const isSoftCapMet = raisedAmount >= softCapAmount && softCapAmount > 0;
  const calculatedTokens = bidAmount && presale?.tokenPrice ? Math.floor(Number(bidAmount) / presale.tokenPrice) : 0;

  // =========================================================================
  // VIEW A: PRE-TOKEN / COMMUNITY AUCTION VIEW (When no secondary token exists)
  // Platform Policy:
  // No fake secondary market charts, mock order books, or fake ticker prices
  // before the community auction successfully closes and mints a token.
  // =========================================================================
  if (!liveToken) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 pt-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header Navigation & Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-5">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => router.push("/marketplace")}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs dark:border-white/[0.12] dark:bg-[#151824] dark:text-neutral-400 dark:hover:text-white transition cursor-pointer"
              title="Back to Marketplace"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {startupData?.logoUrl ? (
              <img
                src={startupData.logoUrl}
                alt={startupName}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-white/10"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-lg font-bold">
                {startupName.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {startupName}
                </h1>
                <span className="text-sm font-bold text-slate-500 dark:text-neutral-400 font-mono">
                  {token.symbol}
                </span>

                {/* Real Status Badge based on Calip Lifecycle */}
                {isAuctionLive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                    Live Community Auction
                  </span>
                ) : startupStage === "approved" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Vetted & Approved by Calip
                  </span>
                ) : startupStage === "rejected" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold">
                    Application Rejected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    Application Under Review
                  </span>
                )}

                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 text-xs font-medium">
                  {token.tag}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400 font-mono">
                Founder: {startupData?.founderAddress || token.owner || "0x..."}
              </p>
            </div>
          </div>

          {/* Action Header Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleWatchlistToggle}
              disabled={watchlistStatus === "adding" || watchlistStatus === "removing"}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition border ${
                isInWatchlist
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 dark:hover:text-rose-400 group"
                  : "cl-btn-primary"
              } disabled:opacity-50 cursor-pointer`}
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
                  <span>Add to Watchlist</span>
                </>
              )}
            </button>

            {startupData?.startupWebsite && (
              <a
                href={startupData.startupWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-xs dark:border-white/[0.12] dark:bg-[#151824] dark:text-neutral-400 dark:hover:text-white transition"
                title="Official Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}

            {startupData?.pitchDeckUrl && (
              <a
                href={startupData.pitchDeckUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-xs dark:border-white/[0.12] dark:bg-[#151824] dark:text-neutral-400 dark:hover:text-white transition"
                title="View Pitch Deck"
              >
                <FileText className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Column (2/3 width): Auction Participation & Company Dossier */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Community Auction Card */}
            {isAuctionLive ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-white via-white to-emerald-500/[0.04] dark:from-[#111318] dark:via-[#111318] dark:to-emerald-950/20 p-6 sm:p-7 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {presale.title || `${startupName} Community Auction Round`}
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">
                      Smart-contract escrow auction on Base Sepolia. Backers commit funds; tokens are generated upon 70% soft-cap success.
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-right font-mono">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Token Price</span>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{Number(presale.tokenPrice).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Key Auction Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#090a0f] p-3.5">
                    <span className="text-[10.5px] font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wider block">Target Goal</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
                      ₹{targetRaise.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#090a0f] p-3.5">
                    <span className="text-[10.5px] font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wider block">Amount Raised</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      ₹{Number(raisedAmount).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#090a0f] p-3.5">
                    <span className="text-[10.5px] font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wider block">Soft Cap (70%)</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                      ₹{softCapAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#090a0f] p-3.5">
                    <span className="text-[10.5px] font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wider block">Deadline</span>
                    <span className="text-xs sm:text-sm font-bold font-mono text-slate-700 dark:text-neutral-300 mt-0.5 block truncate">
                      {presale.endDate ? new Date(presale.endDate).toLocaleDateString() : "30 Days"}
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar with 70% Soft Cap Gate Marker */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600 dark:text-neutral-400 font-semibold">
                      Auction Progress: <strong className="text-slate-900 dark:text-white">{progressPercent.toFixed(1)}%</strong>
                    </span>
                    <span className={isSoftCapMet ? "text-emerald-500 font-bold" : "text-amber-500 font-medium"}>
                      {isSoftCapMet ? "✓ Soft Cap Reached (Token Creation Guaranteed)" : "Soft Cap Requirement: 70%"}
                    </span>
                  </div>

                  <div className="relative h-3.5 w-full rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                    {/* 70% Soft Cap line indicator */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                      style={{ left: "70%" }}
                      title="70% Soft Cap Threshold"
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 dark:text-neutral-500">
                    <span>₹0</span>
                    <span className="text-amber-500 font-semibold">| 70% Soft Cap Gate</span>
                    <span>₹{targetRaise.toLocaleString("en-IN")} Hard Cap</span>
                  </div>
                </div>

                {/* Direct Investor Bidding / Commitment Widget */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] dark:bg-emerald-950/10 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Place Investment Commitment
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-neutral-400">
                        Min: ₹{Number(presale.minInvestment || 500).toLocaleString("en-IN")} • Max: ₹{Number(presale.maxInvestment || 50000).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {calculatedTokens > 0 && (
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        Allocates: ~{calculatedTokens.toLocaleString()} {token.symbol}
                      </span>
                    )}
                  </div>

                  <form onSubmit={handlePlaceAuctionBid} className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-sm font-bold">₹</span>
                        <input
                          type="number"
                          min={presale.minInvestment || 1}
                          max={presale.maxInvestment || undefined}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder={`Enter amount (e.g. ${presale.minInvestment || 1000})`}
                          className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#090a0f] pl-8 pr-4 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {isAuthenticated ? (
                        <button
                          type="submit"
                          disabled={biddingSubmitting || !bidAmount}
                          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md disabled:opacity-50 cursor-pointer"
                        >
                          {biddingSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Signing Commitment...</span>
                            </>
                          ) : (
                            <>
                              <Coins className="w-4 h-4" />
                              <span>Commit Funds to Auction</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openConnectModal?.()}
                          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-6 py-2.5 text-xs font-bold hover:opacity-90 transition shadow-md cursor-pointer"
                        >
                          Connect Wallet to Bid
                        </button>
                      )}
                    </div>

                    {/* Quick amount presets */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">Presets:</span>
                      {[1000, 2500, 5000, 10000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setBidAmount(String(preset))}
                          className="rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 px-2 py-0.5 text-[11px] font-mono text-slate-700 dark:text-neutral-300 transition"
                        >
                          ₹{preset.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    {/* Feedback Messages */}
                    {bidSuccess && (
                      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{bidSuccess}</span>
                      </div>
                    )}
                    {bidError && (
                      <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{bidError}</span>
                      </div>
                    )}
                  </form>
                </div>

                {/* Real Recent Commitments Table */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Recent Investor Bids ({presaleBids.length})
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">Authoritative Ledger</span>
                  </div>

                  {presaleBids.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#090a0f] p-4 text-center text-xs text-slate-500 dark:text-neutral-400">
                      No bids submitted yet. Be the first backer in this community auction!
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl overflow-hidden bg-slate-50/50 dark:bg-[#090a0f]">
                      {presaleBids.slice(0, 5).map((b, idx) => (
                        <div key={b._id || idx} className="p-3 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-slate-800 dark:text-neutral-200">
                              {b.walletAddress ? `${b.walletAddress.slice(0, 6)}...${b.walletAddress.slice(-4)}` : "Backer"}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {b.createdAt ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{Number(b.bidAmount).toLocaleString("en-IN")}
                            </span>
                            <span className="text-[11px] text-slate-500 ml-2">
                              ({Number(b.tokenAmount).toLocaleString()} {token.symbol})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Pre-Auction Status Notice (When startup is reviewed/approved but auction not launched yet) */
              <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-white via-white to-indigo-500/[0.04] dark:from-[#111318] dark:via-[#111318] dark:to-indigo-950/20 p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {startupStage === "approved"
                        ? "Primary Auction Scheduled"
                        : startupStage === "rejected"
                        ? "Application Rejected"
                        : "Application Curation In Progress"}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                      {startupStage === "approved"
                        ? "This startup has been vetted and approved. The founder or administrator will launch the community auction round shortly."
                        : startupStage === "rejected"
                        ? (startupData?.rejectionReason || startupData?.adminFeedback || "This startup application was reviewed and rejected by the platform administrators.")
                        : "Calip administrators review team credentials, valuation, and utility specifications prior to authorizing an auction round."}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#090a0f] p-4 text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white block mb-1">
                    🛡️ Calip Protocol Regulatory Safeguard:
                  </strong>
                  Secondary market decentralized trading, live order books, and candlestick charts will unlock only after the primary community auction completes successfully and meets the 70% soft-cap funding threshold. No mock or synthetic pricing is presented.
                </div>
              </div>
            )}

            {/* Executive Summary & Detailed Description */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Company Overview & Executive Summary
              </h3>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-neutral-300">
                {startupData?.description || token.about || "No executive summary supplied for this startup dossier."}
              </p>
            </div>

            {/* Utility Token Value Proposition */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-violet-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Token Utility Specification
                </h3>
              </div>

              <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4 text-xs text-violet-900 dark:text-violet-300 leading-relaxed">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">Stated Backer Benefits:</p>
                <p>
                  {startupData?.tokenUtility || startupData?.utilityStatement || "Early platform beta access, monthly founder townhalls, VIP product discounts, and governance signaling."}
                </p>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Disclaimer: Utility tokens on Calip grant platform privileges, product discounts, and community access. They do not constitute company shares, voting equity, dividend claims, or investment contracts.
              </p>
            </div>
          </div>

          {/* Right Sidebar (1/3 width): Key Facts, Founder Info & Escrow Safeguards */}
          <div className="space-y-6">
            {/* Startup Key Metrics */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Fundraising & Financials
              </h3>

              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#090a0f] p-3.5">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold block">Target Raise Goal</span>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {targetRaise > 0
                      ? `₹${targetRaise.toLocaleString("en-IN")}`
                      : startupData?.targetGoal || startupData?.fundraisingGoal
                        ? !isNaN(Number(startupData.targetGoal || startupData.fundraisingGoal))
                          ? `₹${Number(startupData.targetGoal || startupData.fundraisingGoal).toLocaleString("en-IN")}`
                          : (startupData.targetGoal || startupData.fundraisingGoal)
                        : "To be announced"}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#090a0f] p-3.5">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold block">Current Startup Valuation</span>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
                    {startupData?.currentStartupValuation
                      ? !isNaN(Number(startupData.currentStartupValuation))
                        ? `₹${Number(startupData.currentStartupValuation).toLocaleString("en-IN")}`
                        : startupData.currentStartupValuation
                      : "Under ₹1 Cr"}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#090a0f] p-3.5">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold block">Legal Entity</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-neutral-200 mt-0.5 block">
                    {startupData?.companyRegistrationType || "Private Limited / C-Corp"}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#090a0f] p-3.5">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold block">Industry Category</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-neutral-200 mt-0.5 block">
                    {token.tag}
                  </span>
                </div>
              </div>
            </div>

            {/* Founder & Evidence Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Founder Credentials
              </h3>

              <div className="space-y-2 text-xs">
                <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#090a0f] p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Founder Wallet</span>
                  <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white truncate block mt-0.5">
                    {startupData?.founderAddress || token.owner || "0x..."}
                  </span>
                </div>

                {startupData?.pitchDeckUrl && (
                  <a
                    href={startupData.pitchDeckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      View Pitch Deck (PDF)
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Escrow Safeguard Disclosure */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] space-y-2 text-xs text-slate-500 dark:text-neutral-400">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Participant Protection
              </h4>
              <p className="leading-relaxed">
                All auction commitments are held in transparent smart contracts on Base. In accordance with platform safeguard policies, if the 70% soft-cap threshold is not attained by the auction deadline, participants can claim a 100% refund of their contributed funds directly from escrow.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW B: SECONDARY MARKET DEX TERMINAL (Only when a real liveToken exists)
  // =========================================================================
  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-4 sm:px-6 lg:px-8 space-y-4">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/marketplace")}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/[0.12] dark:bg-[#151824] dark:text-neutral-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{token.name}</h1>
              <span className="text-xs font-mono font-bold text-slate-500">{token.symbol}</span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-500">
                Secondary DEX
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Contract: {token.contract || "Base Sepolia SPT"}</p>
          </div>
        </div>

        <button
          onClick={handleWatchlistToggle}
          className="cl-btn-primary px-4 py-1.5 text-xs font-semibold"
        >
          {isInWatchlist ? "✓ In Watchlist" : "+ Add to Watchlist"}
        </button>
      </div>

      {/* 3-Column Trading Terminal */}
      <div className="grid min-w-0 grid-cols-1 gap-4 items-start xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        {/* Trades Column */}
        <aside className="hidden lg:flex flex-col rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-white/[0.12] dark:bg-[#151824]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Live Trades (Base L2)</h3>
          <div className="space-y-2 text-xs font-mono">
            {liveTokenTrades.length === 0 ? (
              <p className="text-slate-500 text-center py-6">No secondary trades recorded yet.</p>
            ) : (
              liveTokenTrades.map((tr, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-white/[0.04]">
                  <span className={tr.isBuy ? "text-emerald-500" : "text-rose-500"}>
                    {tr.isBuy ? "BUY" : "SELL"} {Number(tr.amount).toLocaleString()}
                  </span>
                  <span className="text-slate-400">@ ${Number(tr.price).toFixed(4)}</span>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Center Area: Price & Interactive Candlestick Chart */}
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-white/[0.12] dark:bg-[#151824]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block">Price / Market</span>
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  ${livePrice > 0 ? livePrice.toFixed(4) : "Market Open"}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs">
                {["15m", "1h", "4h", "1d"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveTf(tf)}
                    className={`px-2 py-1 rounded ${activeTf === tf ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold" : "text-slate-500"}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[300px] w-full rounded-xl bg-slate-50 dark:bg-[#090a0f] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center">
              {candles.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono">
                  {candlesLoading ? "Querying Base L2 indexing engine..." : "No candlestick transactions recorded on Base L2 yet."}
                </p>
              ) : (
                <p className="text-xs text-emerald-500 font-mono">
                  {candles.length} confirmed trading candles loaded from Base L2.
                </p>
              )}
            </div>
          </div>

          {/* Token About & Utility */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">About {token.name}</h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-neutral-300">
              {token.about || "Utility token minted following successful primary community auction on Calip."}
            </p>
          </div>
        </section>

        {/* Right Column: Trade Panel & Overview */}
        <aside className="space-y-4">
          <TokenTradePanel token={token} startupId={startupId} />

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Token Supply & Liquidity</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Token Cap</span>
                <span className="font-bold text-slate-900 dark:text-white">{tokenSupply?.cap ? Number(tokenSupply.cap).toLocaleString() : "10,000,000"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Network</span>
                <span className="font-bold text-emerald-500">Base Sepolia</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
