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
import Footer from "../dashboard/Footer";
import MonthlyReturnsBarChart from "../performance-summary/MonthlyReturnsBarChart";
import AIRecommendationsTable from "../performance-summary/AIRecommendationsTable";
import { useAuth } from "../auth/AuthProvider";
import { fetchProfile } from "../../lib/authApi";
import { getWatchlist, removeFromWatchlist } from "../../lib/usersApi";
import { getMyStartups } from "../../lib/startupsManageApi";
import { getTradeHistory, getListings, cancelListing, updateListingPrice } from "../../lib/marketplaceApi";
import { getParticipationHistory } from "../../lib/participationApi";

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
  const [participations, setParticipations] = useState([]);

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingWatchlistId, setRemovingWatchlistId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [profRes, watchRes, startupsRes, historyRes, listingsRes, partRes] = await Promise.allSettled([
          fetchProfile().catch(() => null),
          getWatchlist().catch(() => null),
          getMyStartups().catch(() => null),
          getTradeHistory(1, 10).catch(() => null),
          getListings(1, 10).catch(() => null),
          getParticipationHistory().catch(() => null),
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

        if (partRes.status === "fulfilled" && partRes.value) {
          const parts = partRes.value?.data || partRes.value?.participations || (Array.isArray(partRes.value) ? partRes.value : []);
          setParticipations(parts.filter(Boolean));
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

  const handleCancelListing = async (listingId) => {
    if (!confirm("Are you sure you want to cancel this secondary market listing?")) return;
    setActionLoadingId(listingId);
    try {
      await cancelListing(listingId);
      setActiveListings((prev) => prev.filter((l) => (l._id || l.id) !== listingId));
    } catch (err) {
      alert("Failed to cancel listing: " + (err.message || "Unknown error"));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdatePrice = async (listingId, currentPrice) => {
    const newPrice = prompt("Enter new price per token:", currentPrice || "0.05");
    if (!newPrice || isNaN(Number(newPrice)) || Number(newPrice) <= 0) return;
    setActionLoadingId(listingId);
    try {
      await updateListingPrice(listingId, Number(newPrice));
      setActiveListings((prev) =>
        prev.map((l) => (l._id || l.id) === listingId ? { ...l, pricePerToken: Number(newPrice) } : l)
      );
    } catch (err) {
      alert("Failed to update listing price: " + (err.message || "Unknown error"));
    } finally {
      setActionLoadingId(null);
    }
  };

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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#090a0f] dark:text-[#f8fafc] transition-colors">
      <Navbar activePage="profile" />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {/* HEADER / COMMAND CENTER BANNER */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] mb-8 transition-colors">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white flex items-center justify-center font-bold text-2xl flex-shrink-0 transition-colors">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
                    {displayName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/[0.06] dark:text-white dark:border-white/[0.08] transition-colors">
                    USER INSIGHTS
                  </span>
                  {isAuthenticated && (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Connected
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-2 text-[12.5px] text-slate-500 dark:text-slate-400">
                  {walletAddress && (
                    <span className="inline-flex items-center gap-1.5 font-mono">
                      <Wallet className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300" />
                      {walletAddress.slice(0, 10)}...{walletAddress.slice(-6)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Member since {memberSince}
                  </span>
                  {profile?.role && (
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <Shield className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300" />
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
                className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.08] transition"
                title="Refresh Insights"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* REAL STATS COUNTERS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.08] transition-colors">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 dark:bg-[#0e111c] dark:border-white/[0.08] transition-colors">
              <div className="text-[12px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300" />
                Watched Companies
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1 transition-colors">
                {watchlist.length}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 dark:bg-[#0e111c] dark:border-white/[0.08] transition-colors">
              <div className="text-[12px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300" />
                My Startups
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1 transition-colors">
                {myStartups.length}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 dark:bg-[#0e111c] dark:border-white/[0.08] transition-colors">
              <div className="text-[12px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300" />
                Active Listings
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1 transition-colors">
                {activeListings.length}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 dark:bg-[#0e111c] dark:border-white/[0.08] transition-colors">
              <div className="text-[12px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300" />
                Market Trades
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1 transition-colors">
                {tradeHistory.length}
              </div>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/[0.08] pb-3 mb-6 overflow-x-auto transition-colors">
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
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-black"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.04]"
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
            <Loader2 className="w-8 h-8 text-white animate-spin" />
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
                  <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-slate-700 dark:text-white" />
                        <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Your Watched Companies</h2>
                      </div>
                      <button
                        onClick={() => setActiveTab("watchlist")}
                        className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                      >
                        View all ({watchlist.length})
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {watchlist.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl dark:border-white/[0.08] dark:bg-white/[0.01]">
                        <Bookmark className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                        <p className="text-[13.5px] font-medium text-slate-700 dark:text-slate-300">No companies in your watchlist yet</p>
                        <p className="text-[12px] text-slate-500 mt-1">Discover companies on the Dashboard and click &ldquo;+ Add to Watchlist&rdquo;.</p>
                        <button
                          onClick={() => router.push("/")}
                          className="cl-btn-primary mt-4 h-8 px-4 text-[12px]"
                        >
                          Explore Dashboard
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                        {watchlist.slice(0, 5).map((item, idx) => {
                          const itemId = item._id || item.id;
                          return (
                            <div
                              key={itemId || `quick-${idx}`}
                              onClick={() => router.push(`/insights/${itemId || item.symbol?.toLowerCase()}`)}
                              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] px-2 rounded-lg cursor-pointer transition group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white flex items-center justify-center font-bold text-[13px]">
                                  {item.symbol
                                    ? item.symbol.slice(0, 2).toUpperCase()
                                    : (item.startupName || item.name || "?").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 dark:text-white text-[13.5px] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                                    {item.startupName || item.name || "Company"}
                                  </div>
                                  <div className="text-[11.5px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <span>{item.symbol || "AGENT"}</span>
                                    {item.industrySector && (
                                      <>
                                        <span>·</span>
                                        <span className="text-slate-500 dark:text-slate-400">{item.industrySector}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {item.currentStartupValuation && (
                                  <div className="text-right hidden sm:block">
                                    <div className="text-[11px] text-slate-400 dark:text-slate-500">Valuation</div>
                                    <div className="text-[12px] font-mono font-semibold text-slate-900 dark:text-white">
                                      ₹ {Number(item.currentStartupValuation).toLocaleString("en-IN")}
                                    </div>
                                  </div>
                                )}
                                <button
                                  onClick={(e) => handleRemoveFromWatchlist(itemId, e)}
                                  disabled={removingWatchlistId === itemId}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition"
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
                  <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-700 dark:text-white" />
                        <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">My Startups</h2>
                      </div>
                      <button
                        onClick={() => router.push("/my-startups")}
                        className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                      >
                        Manage in My Startups
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {myStartups.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl dark:border-white/[0.08] dark:bg-white/[0.01]">
                        <p className="text-[13px] text-slate-600 dark:text-slate-400">You haven&apos;t created or listed any startups yet.</p>
                        <button
                          onClick={() => router.push("/founders")}
                          className="cl-btn-secondary mt-3 h-8 px-4 text-[12px]"
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
                            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:border-slate-300 dark:border-white/[0.08] dark:bg-[#0e111c] dark:hover:border-white/20 cursor-pointer transition shadow-xs"
                          >
                            <div className="font-bold text-slate-900 dark:text-white text-[13.5px]">{st.startupName || "Startup"}</div>
                            <div className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">{st.industrySector || "Tech"}</div>
                            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                              <span>Status: <strong className="text-emerald-600 dark:text-emerald-400 capitalize">{st.status || "Active"}</strong></span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">Details <ArrowRight className="w-3 h-3" /></span>
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
              <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] space-y-4 transition-colors">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">All Watched Companies</h2>
                    <p className="text-[12.5px] text-slate-500 dark:text-slate-400">Real-time synchronization with your Calip watchlist.</p>
                  </div>
                  <span className="px-3 py-1 rounded-md text-[12px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/[0.06] dark:text-white dark:border-white/[0.08]">
                    {watchlist.length} Watched
                  </span>
                </div>

                {watchlist.length === 0 ? (
                  <div className="text-center py-16">
                    <Bookmark className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                    <p className="text-base font-semibold text-slate-900 dark:text-white">Your watchlist is empty</p>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                      Search and discover companies on the Dashboard to track them in your command center.
                    </p>
                    <button
                      onClick={() => router.push("/")}
                      className="cl-btn-primary mt-5 h-9 px-5 text-[13px]"
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
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 hover:border-slate-300 dark:border-white/[0.08] dark:bg-[#0e111c] dark:hover:border-white/20 transition group flex flex-col justify-between shadow-xs"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-800 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white flex items-center justify-center font-extrabold text-[15px]">
                                {item.symbol
                                  ? item.symbol.slice(0, 2).toUpperCase()
                                  : (item.startupName || item.name || "?").slice(0, 2).toUpperCase()}
                              </div>
                              <button
                                onClick={(e) => handleRemoveFromWatchlist(itemId, e)}
                                disabled={removingWatchlistId === itemId}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Remove from Watchlist"
                              >
                                {removingWatchlistId === itemId ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>

                            <h3 className="font-bold text-slate-900 dark:text-white text-[15px] mt-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                              {item.startupName || item.name || "Company"}
                            </h3>
                            <p className="text-[12px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                              {item.symbol || "AGENT"} · {item.industrySector || "Web3"}
                            </p>
                            {item.startupDescription && (
                              <p className="text-[12px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                                {item.startupDescription}
                              </p>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
                            {item.currentStartupValuation ? (
                              <div>
                                <span className="text-[10.5px] uppercase text-slate-400 dark:text-slate-500">Valuation</span>
                                <div className="text-[12.5px] font-mono font-bold text-slate-900 dark:text-white">
                                  ₹ {Number(item.currentStartupValuation).toLocaleString("en-IN")}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500">Live Market</span>
                            )}

                            <button
                              onClick={() => router.push(`/insights/${itemId || item.symbol?.toLowerCase()}`)}
                              className="cl-btn-secondary h-7 px-3 text-[11.5px]"
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
              <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] space-y-4 transition-colors">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Startups</h2>
                    <p className="text-[12.5px] text-slate-500 dark:text-slate-400">Startups created and managed by your account.</p>
                  </div>
                  <button
                    onClick={() => router.push("/my-startups")}
                    className="cl-btn-primary h-8 px-3.5 text-[12.5px]"
                  >
                    Open My Startups
                  </button>
                </div>

                {myStartups.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl dark:border-white/[0.08] dark:bg-white/[0.01]">
                    <Building2 className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                    <p className="text-base font-semibold text-slate-900 dark:text-white">No startups submitted</p>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                      Founders can submit applications and manage listings through the Founders portal.
                    </p>
                    <button
                      onClick={() => router.push("/founders")}
                      className="cl-btn-secondary mt-4 h-9 px-4 text-[12.5px]"
                    >
                      Explore Founders Portal
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myStartups.map((st) => (
                      <div
                        key={st._id || st.id}
                        className="p-5 rounded-xl border border-slate-200 bg-slate-50/80 shadow-xs dark:border-white/[0.08] dark:bg-[#0e111c] space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">{st.startupName}</h3>
                            <span className="text-[12px] text-slate-500 dark:text-slate-400 font-mono">{st.industrySector || "Tech"}</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 capitalize">
                            {st.status || "Active"}
                          </span>
                        </div>

                        {st.startupDescription && (
                          <p className="text-[12.5px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                            {st.startupDescription}
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-[12px]">
                          {st.currentStartupValuation && (
                            <span className="text-slate-500 dark:text-slate-400">
                              Valuation: <strong className="text-slate-900 dark:text-white font-mono">₹ {Number(st.currentStartupValuation).toLocaleString("en-IN")}</strong>
                            </span>
                          )}
                          <button
                            onClick={() => router.push(`/insights/${st._id || st.id}`)}
                            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1"
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
              <div className="space-y-6">
                {/* 1. Active Secondary Listings */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] transition-colors">
                  <div className="pb-3 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Secondary Market Listings</h2>
                      <p className="text-[12.5px] text-slate-500 dark:text-slate-400">Manage orders, update unit prices, or cancel listings.</p>
                    </div>
                    <span className="rounded-full bg-violet-600/10 px-2.5 py-1 text-xs font-semibold text-violet-500">
                      {activeListings.length} Active
                    </span>
                  </div>

                  {activeListings.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      You currently have no active sell orders on the secondary marketplace.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                      {activeListings.map((l) => (
                        <div key={l._id || l.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white text-[14px]">
                                {l.tokenAmount || l.amount} Tokens
                              </span>
                              <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold uppercase">
                                {l.status || "ACTIVE"}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-slate-500 font-mono">
                              Unit Price: <strong className="text-slate-900 dark:text-white">${l.pricePerToken}</strong> | Total: ${(Number(l.pricePerToken || 0) * Number(l.tokenAmount || l.amount || 0)).toFixed(2)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              disabled={actionLoadingId === (l._id || l.id)}
                              onClick={() => handleUpdatePrice(l._id || l.id, l.pricePerToken)}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-slate-300 dark:hover:text-white transition"
                            >
                              Edit Price
                            </button>
                            <button
                              disabled={actionLoadingId === (l._id || l.id)}
                              onClick={() => handleCancelListing(l._id || l.id)}
                              className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/20 transition"
                            >
                              Cancel Listing
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Primary Auction Participations */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] transition-colors">
                  <div className="pb-3 border-b border-slate-200 dark:border-white/[0.08]">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Primary Auction Allocations</h2>
                    <p className="text-[12.5px] text-slate-500 dark:text-slate-400">Crowdfunding commitments recorded from primary presale rounds.</p>
                  </div>

                  {participations.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      No primary auction commitments found for your connected wallet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                      {participations.map((p, i) => (
                        <div key={p._id || i} className="py-3.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-[13.5px]">
                              {p.startupName || "Startup Auction"}
                            </span>
                            <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                              Commitment: ${Number(p.totalInvested || p.amount || 0).toLocaleString()} • Allocated: {Number(p.tokensAllocated || p.tokenAmount || 0).toLocaleString()} Tokens
                            </div>
                          </div>
                          <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase">
                            Confirmed
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Trade History */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] space-y-4 transition-colors">
                  <div className="pb-3 border-b border-slate-200 dark:border-white/[0.08]">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Marketplace Trade History</h2>
                    <p className="text-[12.5px] text-slate-500 dark:text-slate-400">Verified trade execution ledger.</p>
                  </div>

                  {tradeHistory.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      No completed trades recorded yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                      {tradeHistory.map((trade, idx) => (
                        <div key={trade._id || idx} className="py-3.5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/[0.05] dark:text-white dark:border-white/[0.08] flex items-center justify-center">
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white text-[13.5px]">
                                {trade.tokenAmount ? `${trade.tokenAmount} Tokens` : "Market Trade"}
                              </div>
                              <div className="text-[11.5px] text-slate-500">
                                {trade.createdAt ? new Date(trade.createdAt).toLocaleString() : "Recently"}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-mono font-bold text-slate-900 dark:text-white text-[13px]">
                              {trade.pricePerToken ? `${trade.pricePerToken} per token` : "Executed"}
                            </div>
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Completed</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
