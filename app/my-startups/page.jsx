"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Rocket, Loader2, Trash2, Plus, Bookmark, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/dashboard/Navbar";
import { getMyStartups, deleteStartup } from "../../lib/startupsManageApi";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../../lib/usersApi";

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-[#fef3c7] text-[#92400e] dark:bg-[#451a03] dark:text-[#fbbf24]",
    dot: "bg-[#f59e0b]",
  },
  under_review: {
    label: "Under review",
    className: "bg-[#dbeafe] text-[#1e40af] dark:bg-[#172554] dark:text-[#93c5fd]",
    dot: "bg-[#3b82f6]",
  },
  approved: {
    label: "Approved",
    className: "bg-[#d1fae5] text-[#065f46] dark:bg-[#064e3b] dark:text-[#34d399]",
    dot: "bg-[#10b981]",
  },
  rejected: {
    label: "Rejected",
    className: "bg-[#fee2e2] text-[#991b1b] dark:bg-[#450a0a] dark:text-[#fca5a5]",
    dot: "bg-[#ef4444]",
  },
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatViews(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

export default function MyStartupsPage() {
  const router = useRouter();
  const [startups, setStartups] = useState([]);
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const [togglingWatchlistId, setTogglingWatchlistId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [toast, setToast] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const reload = () => {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [startupsRes, watchRes] = await Promise.allSettled([
          getMyStartups(),
          getWatchlist().catch(() => null),
        ]);

        if (cancelled) return;

        if (startupsRes.status === "fulfilled") {
          const list = startupsRes.value?.startups || startupsRes.value?.data || (Array.isArray(startupsRes.value) ? startupsRes.value : []);
          setStartups(list.filter(Boolean));
        } else {
          setError(startupsRes.reason?.message || "Failed to load your startups");
        }

        if (watchRes.status === "fulfilled" && watchRes.value) {
          const items = watchRes.value?.items || watchRes.value?.data?.items || (Array.isArray(watchRes.value?.data) ? watchRes.value.data : Array.isArray(watchRes.value) ? watchRes.value : []);
          const ids = new Set();
          items.forEach((item) => {
            if (item._id) ids.add(item._id);
            if (item.id) ids.add(item.id);
            if (item.startupName) ids.add(item.startupName.toLowerCase());
          });
          setWatchlistIds(ids);
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleToggleWatchlist = async (startup) => {
    const startupId = startup._id || startup.id;
    if (!startupId) return;

    setTogglingWatchlistId(startupId);
    const isWatched = watchlistIds.has(startupId) || (startup.startupName && watchlistIds.has(startup.startupName.toLowerCase()));

    try {
      if (isWatched) {
        await removeFromWatchlist(startupId);
        setWatchlistIds((prev) => {
          const next = new Set(prev);
          next.delete(startupId);
          if (startup.startupName) next.delete(startup.startupName.toLowerCase());
          return next;
        });
        setToast(`Removed ${startup.startupName || "startup"} from Watchlist`);
      } else {
        await addToWatchlist(startupId);
        setWatchlistIds((prev) => {
          const next = new Set(prev);
          next.add(startupId);
          if (startup.startupName) next.add(startup.startupName.toLowerCase());
          return next;
        });
        setToast(`Added ${startup.startupName || "startup"} to Watchlist`);
      }
    } catch (err) {
      console.error("Watchlist toggle failed:", err);
      setToast("Failed to update watchlist.");
    } finally {
      setTogglingWatchlistId(null);
    }
  };

  const handleDelete = async (id) => {
    if (confirming !== id) {
      setConfirming(id);
      return;
    }
    setConfirming(null);
    setRemoving(id);
    try {
      await deleteStartup(id);
      setStartups((prev) => prev.filter((s) => s._id !== id));
      setToast("Startup deleted.");
    } catch (err) {
      setToast(err?.message || "Failed to delete startup.");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a0f] text-[#f8fafc]">
      <Navbar activePage="my-startups" />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                My Startups
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/30">
                {startups.length} Registered
              </span>
            </div>
            <p className="mt-1 text-[13.5px] text-[#94a3b8]">
              Manage your submitted startups, track watchlist status, and review company details.
            </p>
          </div>

          <Link
            href="/marketplace/create"
            className="inline-flex items-center gap-2 rounded-xl bg-[#6366f1] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#5254e4] shadow-[0_0_12px_rgba(99,102,241,0.3)] self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span>Create Token</span>
          </Link>
        </div>

        <div>
          {loading && (
            <div className="flex items-center justify-center gap-2 py-20 text-[#94a3b8]">
              <Loader2 className="h-5 w-5 animate-spin text-[#6366f1]" strokeWidth={2} />
              <span className="text-[13.5px] font-mono">Loading your startups & watchlist status...</span>
            </div>
          )}

          {error && (
            <div className="py-16 text-center">
              <p className="text-[#ef4444] text-[14px]">{error}</p>
              <button
                type="button"
                onClick={reload}
                className="mt-3 rounded-lg bg-[#6366f1] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#5254e4]"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && startups.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-20 text-center rounded-2xl border border-dashed border-[#1a2436] bg-[#0b0e14]">
              <Rocket className="h-10 w-10 text-[#5e6f85]" strokeWidth={1.5} />
              <p className="text-base font-semibold text-white">
                You haven&apos;t submitted any startups yet.
              </p>
              <p className="text-[13px] text-[#94a3b8] max-w-sm">
                Submit your project to Calip to unlock automated capital formation, secondary listings, and investor reach.
              </p>
              <Link
                href="/marketplace/create"
                className="mt-2 rounded-xl bg-[#6366f1] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#5254e4]"
              >
                Create Token
              </Link>
            </div>
          )}

          {!loading && !error && startups.length > 0 && (
            <div className="space-y-4">
              {startups.map((startup) => {
                const status = statusConfig[startup.status] || statusConfig.pending;
                const startupId = startup._id || startup.id;
                const isWatched =
                  watchlistIds.has(startupId) ||
                  (startup.startupName && watchlistIds.has(startup.startupName.toLowerCase()));

                return (
                  <div
                    key={startupId}
                    className="flex flex-col gap-4 rounded-2xl border border-[#1a2436] bg-[#0f1520] p-5 shadow-xl transition hover:border-[#6366f1]/30 sm:flex-row sm:items-center"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1c183a] border border-[#6366f1]/30 text-[18px] font-extrabold text-[#818cf8]">
                      {startup.startupName?.[0]?.toUpperCase() ?? "?"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-base font-bold text-white leading-tight">
                          {startup.startupName || "Untitled"}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.className}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                        {isWatched && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/30">
                            <Bookmark className="w-3 h-3 fill-[#818cf8]" />
                            In Watchlist
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[12.5px] text-[#94a3b8]">
                        {startup.industrySector || "Tech"} · {startup.startupStage || startup.stage || "Early Stage"} ·{" "}
                        {startup.fundingStatus || "Bootstrapped"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
                      <div className="hidden text-right lg:block">
                        <p className="text-[10.5px] uppercase tracking-wider text-[#5e6f85]">
                          Submissions
                        </p>
                        <p className="text-[12.5px] font-mono font-semibold text-neutral-300">
                          {formatViews(startup.views)}
                        </p>
                      </div>

                      <div className="hidden text-right lg:block">
                        <p className="text-[10.5px] uppercase tracking-wider text-[#5e6f85]">
                          Submitted
                        </p>
                        <p className="text-[12.5px] font-mono font-semibold text-neutral-300">
                          {formatDate(startup.createdAt)}
                        </p>
                      </div>

                      {/* WATCHLIST TOGGLE BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleToggleWatchlist(startup)}
                        disabled={togglingWatchlistId === startupId}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition ${
                          isWatched
                            ? "bg-[#6366f1]/20 border-[#6366f1]/50 text-[#818cf8] hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-400 group"
                            : "bg-[#141d2c] border-[#1a2436] text-neutral-300 hover:text-white hover:border-[#6366f1]/40"
                        } disabled:opacity-50`}
                        title={isWatched ? "Click to remove from Watchlist" : "Add to Watchlist"}
                      >
                        {togglingWatchlistId === startupId ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isWatched ? (
                          <>
                            <Check className="h-3.5 w-3.5 group-hover:hidden" />
                            <span className="group-hover:hidden">Watched</span>
                            <span className="hidden group-hover:inline">Remove</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="h-3.5 w-3.5" />
                            <span>+ Watchlist</span>
                          </>
                        )}
                      </button>

                      {/* OPEN DETAILS BUTTON */}
                      <button
                        type="button"
                        onClick={() => router.push(`/insights/${startupId}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1a2436] bg-[#141d2c] text-[#818cf8] hover:text-white hover:border-[#6366f1]/40 text-[12px] font-semibold transition"
                        title="Open Startup Detail"
                      >
                        <span>Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>

                      {/* DELETE ACTION */}
                      <button
                        type="button"
                        onClick={() => handleDelete(startup._id)}
                        disabled={removing === startup._id}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          confirming === startup._id
                            ? "bg-[#F0395A] text-white"
                            : "border border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                        }`}
                      >
                        {removing === startup._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        )}
                        <span>{confirming === startup._id ? "Confirm?" : "Delete"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {toast && typeof document !== "undefined" && createPortal(
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-xl bg-[#0f172a] border border-[#6366f1]/40 px-5 py-2.5 text-[13px] font-semibold text-white shadow-2xl pointer-events-none">
          {toast}
        </div>,
        document.body
      )}
    </div>
  );
}