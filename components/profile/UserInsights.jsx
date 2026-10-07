"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Building2,
  TrendingUp,
  BarChart3,
  Trash2,
  Shield,
  Wallet,
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ArrowLeftRight,
} from "lucide-react";
import Navbar from "../dashboard/Navbar";
import MonthlyReturnsBarChart from "../performance-summary/MonthlyReturnsBarChart";
import AIRecommendationsTable from "../performance-summary/AIRecommendationsTable";
import { useAuth } from "../auth/AuthProvider";
import { fetchProfile } from "../../lib/authApi";
import { getWatchlist, removeFromWatchlist } from "../../lib/usersApi";
import { getMyStartups } from "../../lib/startupsManageApi";
import { getTradeHistory, getListings } from "../../lib/marketplaceApi";

export default function UserInsights() {
  const router = useRouter();
  const { isAuthenticated, walletAddress } = useAuth();

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "watchlist" | "startups" | "activity"

  // Data states
  const [profile, setProfile] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [myStartups, setMyStartups] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [activeListings, setActiveListings] = useState([]);

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingWatchlistId, setRemovingWatchlistId] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [profRes, watchRes, startupsRes, historyRes, listingsRes] = await Promise.allSettled([
          fetchProfile().catch(() => null),
          getWatchlist().catch(() => null),
          getMyStartups().catch(() => null),
          getTradeHistory(1, 10).catch(() => null),
          getListings(1, 10).catch(() => null),
        ]);

        if (cancelled) return;

        if (profRes.status === "fulfilled" && profRes.value) {
          setProfile(profRes.value?.data || profRes.value?.user || profRes.value);
        }

        if (watchRes.status === "fulfilled" && watchRes.value) {
          const items = watchRes.value?.items || watchRes.value?.data?.items || (Array.isArray(watchRes.value?.data) ? watchRes.value.data : Array.isArray(watchRes.value) ? watchRes.value : []);
          setWatchlist(items.filter(Boolean));
        }

        if (startupsRes.status === "fulfilled" && startupsRes.value) {
          const list = startupsRes.value?.data || startupsRes.value?.startups || (Array.isArray(startupsRes.value) ? startupsRes.value : []);
          setMyStartups(list.filter(Boolean));
        }

        if (historyRes.status === "fulfilled" && historyRes.value) {
          const hist = historyRes.value?.data?.trades || historyRes.value?.trades || (Array.isArray(historyRes.value) ? historyRes.value : []);
          setTradeHistory(hist.filter(Boolean));
        }

        if (listingsRes.status === "fulfilled" && listingsRes.value) {
          const lists = listingsRes.value?.data?.listings || listingsRes.value?.listings || (Array.isArray(listingsRes.value) ? listingsRes.value : []);
          setActiveListings(lists.filter(Boolean));
        }
      } catch (err) {
        console.error("Failed to load user insights:", err);
        if (!cancelled) setError("Unable to load all profile insights. Some services may be unavailable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [reloadTrigger]);

  const handleRemoveFromWatchlist = async (id, e) => {
    if (e) e.stopPropagation();
    if (!id) return;
    setRemovingWatchlistId(id);
    try {
      await removeFromWatchlist(id);
      setWatchlist((prev) => prev.filter((item) => (item._id || item.id) !== id));
    } catch (err) {
      console.error("Failed to remove item from watchlist:", err);
    } finally {
      setRemovingWatchlistId(null);
    }
  };

  const displayName = profile?.name || profile?.username || (walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Calip User");
  const memberSince = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Active Member";

  return (
    <div className="min-h-screen bg-[#070a0f] text-[#f8fafc]">
      <Navbar activePage="profile" />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER / COMMAND CENTER BANNER */}
        <div className="relative overflow-hidden rounded-2xl border border-[#1a2436] bg-gradient-to-r from-[#0f172a] via-[#0d1424] to-[#12102e] p-6 sm:p-8 shadow-2xl mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#6366f1]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6366f1] to-[#a855f7] p-0.5 shadow-lg shadow-[#6366f1]/20 flex-shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#0b0e14] flex items-center justify-center text-white font-bold text-2xl">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {displayName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/30">
                    USER INSIGHTS
                  </span>
                  {isAuthenticated && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Connected
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-2 text-[12.5px] text-[#94a3b8]">
                  {walletAddress && (
                    <span className="inline-flex items-center gap-1.5 font-mono">
                      <Wallet className="w-3.5 h-3.5 text-[#6366f1]" />
                      {walletAddress.slice(0, 10)}...{walletAddress.slice(-6)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    Member since {memberSince}
                  </span>
                  {profile?.role && (
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      {profile.role}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS & SEPARATE SETTINGS LINK */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setReloadTrigger((k) => k + 1)}
                className="p-2.5 rounded-xl border border-[#1a2436] bg-[#0f1520] text-neutral-400 hover:text-white hover:border-[#6366f1]/40 transition"
                title="Refresh Insights"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* REAL STATS COUNTERS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/5">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[12px] font-medium text-[#94a3b8] flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-[#6366f1]" />
                Watched Companies
              </div>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                {watchlist.length}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[12px] font-medium text-[#94a3b8] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                My Startups
              </div>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                {myStartups.length}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[12px] font-medium text-[#94a3b8] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                Active Listings
              </div>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                {activeListings.length}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[12px] font-medium text-[#94a3b8] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Market Trades
              </div>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                {tradeHistory.length}
              </div>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-[#1a2436] pb-3 mb-6 overflow-x-auto">
          {[
            { id: "overview", label: "Command Overview", icon: Sparkles },
            { id: "performance", label: "Performance", icon: BarChart3 },
            { id: "watchlist", label: `Watchlist (${watchlist.length})`, icon: Bookmark },
            { id: "startups", label: `My Startups (${myStartups.length})`, icon: Building2 },
            { id: "activity", label: `Marketplace Activity (${tradeHistory.length})`, icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/40 shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENT PANELS */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
            <p className="text-[13px] font-mono text-[#94a3b8]">Loading user insights...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-[13px] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 gap-6">
                {/* WATCHLIST QUICK SUMMARY */}
                <div className="space-y-6">
                  <div className="rounded-xl border border-[#1a2436] bg-[#0f1520] p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-[#6366f1]" />
                        <h2 className="text-[15px] font-bold text-white">Your Watched Companies</h2>
                      </div>
                      <button
                        onClick={() => setActiveTab("watchlist")}
                        className="text-[12px] font-semibold text-[#818cf8] hover:underline inline-flex items-center gap-1"
                      >
                        View all ({watchlist.length})
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {watchlist.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-[#1a2436] rounded-lg">
                        <Bookmark className="w-8 h-8 text-[#5e6f85] mx-auto mb-2" />
                        <p className="text-[13.5px] font-medium text-neutral-300">No companies in your watchlist yet</p>
                        <p className="text-[12px] text-[#5e6f85] mt-1">Discover companies on the Dashboard and click &ldquo;+ Add to Watchlist&rdquo;.</p>
                        <button
                          onClick={() => router.push("/")}
                          className="mt-4 px-4 py-1.5 rounded-lg bg-[#6366f1] text-white text-[12px] font-semibold hover:bg-[#4f46e5] transition"
                        >
                          Explore Dashboard
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/[0.04]">
                        {watchlist.slice(0, 5).map((item, idx) => {
                          const itemId = item._id || item.id;
                          return (
                            <div
                              key={itemId || `quick-${idx}`}
                              onClick={() => router.push(`/insights/${itemId || item.symbol?.toLowerCase()}`)}
                              className="py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-lg cursor-pointer transition group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#182233] border border-[#23354c] flex items-center justify-center font-bold text-[13px] text-[#818cf8]">
                                  {item.symbol
                                    ? item.symbol.slice(0, 2).toUpperCase()
                                    : (item.startupName || item.name || "?").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-white text-[13.5px] group-hover:text-[#818cf8] transition">
                                    {item.startupName || item.name || "Company"}
                                  </div>
                                  <div className="text-[11.5px] text-[#94a3b8] flex items-center gap-2">
                                    <span>{item.symbol || "AGENT"}</span>
                                    {item.industrySector && (
                                      <>
                                        <span>·</span>
                                        <span className="text-neutral-400">{item.industrySector}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {item.currentStartupValuation && (
                                  <div className="text-right hidden sm:block">
                                    <div className="text-[11px] text-[#5e6f85]">Valuation</div>
                                    <div className="text-[12px] font-mono font-semibold text-white">
                                      ₹ {Number(item.currentStartupValuation).toLocaleString("en-IN")}
                                    </div>
                                  </div>
                                )}
                                <button
                                  onClick={(e) => handleRemoveFromWatchlist(itemId, e)}
                                  disabled={removingWatchlistId === itemId}
                                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                  title="Remove from Watchlist"
                                >
                                  {removingWatchlistId === itemId ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* MY STARTUPS SUMMARY */}
                  <div className="rounded-xl border border-[#1a2436] bg-[#0f1520] p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-400" />
                        <h2 className="text-[15px] font-bold text-white">My Startups</h2>
                      </div>
                      <button
                        onClick={() => router.push("/my-startups")}
                        className="text-[12px] font-semibold text-[#818cf8] hover:underline inline-flex items-center gap-1"
                      >
                        Manage in My Startups
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {myStartups.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-[#1a2436] rounded-lg">
                        <p className="text-[13px] text-neutral-400">You haven&apos;t created or listed any startups yet.</p>
                        <button
                          onClick={() => router.push("/founders")}
                          className="mt-3 px-4 py-1.5 rounded-lg border border-[#6366f1]/40 text-[#818cf8] hover:bg-[#6366f1]/10 text-[12px] font-semibold transition"
                        >
                          Founders Portal
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {myStartups.slice(0, 4).map((st) => (
                          <div
                            key={st._id || st.id}
                            onClick={() => router.push(`/insights/${st._id || st.id}`)}
                            className="p-3.5 rounded-lg border border-[#1a2436] bg-[#121927] hover:border-[#6366f1]/40 cursor-pointer transition"
                          >
                            <div className="font-bold text-white text-[13.5px]">{st.startupName || "Startup"}</div>
                            <div className="text-[11.5px] text-[#94a3b8] mt-0.5">{st.industrySector || "Tech"}</div>
                            <div className="mt-2 flex items-center justify-between text-[11px] text-[#5e6f85]">
                              <span>Status: <strong className="text-emerald-400">{st.status || "Active"}</strong></span>
                              <span className="text-[#818cf8] font-semibold flex items-center gap-1">Details <ArrowRight className="w-3 h-3" /></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: PERFORMANCE */}
            {activeTab === "performance" && (
              <div className="space-y-6">
                <MonthlyReturnsBarChart />
                <AIRecommendationsTable />
              </div>
            )}

            {/* TAB: WATCHLIST FULL LIST */}
            {activeTab === "watchlist" && (
              <div className="rounded-xl border border-[#1a2436] bg-[#0f1520] p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">All Watched Companies</h2>
                    <p className="text-[12.5px] text-[#94a3b8]">Real-time synchronization with your Calip watchlist.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[12px] font-mono font-bold bg-[#6366f1]/10 text-[#818cf8] border border-[#6366f1]/30">
                    {watchlist.length} Watched
                  </span>
                </div>

                {watchlist.length === 0 ? (
                  <div className="text-center py-16">
                    <Bookmark className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                    <p className="text-base font-semibold text-white">Your watchlist is empty</p>
                    <p className="text-[13px] text-[#5e6f85] mt-1 max-w-sm mx-auto">
                      Search and discover companies on the Dashboard to track them in your command center.
                    </p>
                    <button
                      onClick={() => router.push("/")}
                      className="mt-5 px-5 py-2 rounded-xl bg-[#6366f1] text-white font-semibold text-[13px] hover:bg-[#4f46e5] transition"
                    >
                      Explore Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {watchlist.map((item, idx) => {
                      const itemId = item._id || item.id;
                      return (
                        <div
                          key={itemId || `watch-${idx}`}
                          className="p-4 rounded-xl border border-[#1a2436] bg-[#121927] hover:border-[#6366f1]/40 transition group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="w-10 h-10 rounded-xl bg-[#1a2538] border border-[#2a3c57] flex items-center justify-center font-extrabold text-[#818cf8] text-[15px]">
                                {item.symbol
                                  ? item.symbol.slice(0, 2).toUpperCase()
                                  : (item.startupName || item.name || "?").slice(0, 2).toUpperCase()}
                              </div>
                              <button
                                onClick={(e) => handleRemoveFromWatchlist(itemId, e)}
                                disabled={removingWatchlistId === itemId}
                                className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Remove from Watchlist"
                              >
                                {removingWatchlistId === itemId ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>

                            <h3 className="font-bold text-white text-[15px] mt-3 group-hover:text-[#818cf8] transition">
                              {item.startupName || item.name || "Company"}
                            </h3>
                            <p className="text-[12px] text-[#94a3b8] font-mono mt-0.5">
                              {item.symbol || "AGENT"} · {item.industrySector || "Web3"}
                            </p>
                            {item.startupDescription && (
                              <p className="text-[12px] text-neutral-400 line-clamp-2 mt-2 leading-relaxed">
                                {item.startupDescription}
                              </p>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                            {item.currentStartupValuation ? (
                              <div>
                                <span className="text-[10.5px] uppercase text-[#5e6f85]">Valuation</span>
                                <div className="text-[12.5px] font-mono font-bold text-white">
                                  ₹ {Number(item.currentStartupValuation).toLocaleString("en-IN")}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#5e6f85]">Live Market</span>
                            )}

                            <button
                              onClick={() => router.push(`/insights/${itemId || item.symbol?.toLowerCase()}`)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/30 hover:bg-[#6366f1] hover:text-white text-[11.5px] font-semibold transition"
                            >
                              <span>Overview</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: MY STARTUPS */}
            {activeTab === "startups" && (
              <div className="rounded-xl border border-[#1a2436] bg-[#0f1520] p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">My Startups</h2>
                    <p className="text-[12.5px] text-[#94a3b8]">Startups created and managed by your account.</p>
                  </div>
                  <button
                    onClick={() => router.push("/my-startups")}
                    className="px-4 py-1.5 rounded-lg bg-[#6366f1] text-white text-[12.5px] font-semibold hover:bg-[#4f46e5] transition"
                  >
                    Open My Startups
                  </button>
                </div>

                {myStartups.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-[#1a2436] rounded-xl">
                    <Building2 className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                    <p className="text-base font-semibold text-white">No startups submitted</p>
                    <p className="text-[13px] text-[#5e6f85] mt-1 max-w-sm mx-auto">
                      Founders can submit applications and manage listings through the Founders portal.
                    </p>
                    <button
                      onClick={() => router.push("/founders")}
                      className="mt-4 px-4 py-2 rounded-lg border border-[#6366f1]/40 text-[#818cf8] hover:bg-[#6366f1]/10 text-[12.5px] font-semibold transition"
                    >
                      Explore Founders Portal
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myStartups.map((st) => (
                      <div
                        key={st._id || st.id}
                        className="p-5 rounded-xl border border-[#1a2436] bg-[#121927] space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-white text-base">{st.startupName}</h3>
                            <span className="text-[12px] text-[#94a3b8] font-mono">{st.industrySector || "Tech"}</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {st.status || "Active"}
                          </span>
                        </div>

                        {st.startupDescription && (
                          <p className="text-[12.5px] text-neutral-300 line-clamp-2 leading-relaxed">
                            {st.startupDescription}
                          </p>
                        )}

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[12px]">
                          {st.currentStartupValuation && (
                            <span className="text-neutral-400">
                              Valuation: <strong className="text-white font-mono">₹ {Number(st.currentStartupValuation).toLocaleString("en-IN")}</strong>
                            </span>
                          )}
                          <button
                            onClick={() => router.push(`/insights/${st._id || st.id}`)}
                            className="text-[#818cf8] font-semibold hover:underline inline-flex items-center gap-1"
                          >
                            Open Details <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: ACTIVITY */}
            {activeTab === "activity" && (
              <div className="rounded-xl border border-[#1a2436] bg-[#0f1520] p-6 shadow-xl space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Marketplace Activity & Trades</h2>
                  <p className="text-[12.5px] text-[#94a3b8]">Verified backend trade ledger and market actions.</p>
                </div>

                {tradeHistory.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-[#1a2436] rounded-xl">
                    <TrendingUp className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                    <p className="text-base font-semibold text-white">No trade activity recorded</p>
                    <p className="text-[13px] text-[#5e6f85] mt-1 max-w-sm mx-auto">
                      Your completed purchases, orders, and secondary listings will show up here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {tradeHistory.map((trade, idx) => (
                      <div key={trade._id || idx} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-white text-[13.5px]">
                              {trade.tokenAmount ? `${trade.tokenAmount} Tokens` : "Market Trade"}
                            </div>
                            <div className="text-[11.5px] text-[#5e6f85]">
                              {trade.createdAt ? new Date(trade.createdAt).toLocaleString() : "Recently"}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-bold text-white text-[13px]">
                            {trade.pricePerToken ? `${trade.pricePerToken} per token` : "Executed"}
                          </div>
                          <span className="text-[11px] text-emerald-400 font-semibold">Completed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
