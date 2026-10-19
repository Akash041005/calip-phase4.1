"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Rocket, Loader2, Trash2, Plus, Bookmark, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/dashboard/Navbar";
import Footer from "../../components/dashboard/Footer";
import { getMyStartups, deleteStartup, updateStartup } from "../../lib/startupsManageApi";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../../lib/usersApi";

const statusConfig = {
  pending: {
    label: "Pending",
    className: "border border-amber-500/20 bg-amber-500/10 text-amber-400",
    dot: "bg-amber-400",
  },
  under_review: {
    label: "Under review",
    className: "border border-blue-500/20 bg-blue-500/10 text-blue-400",
    dot: "bg-blue-400",
  },
  approved: {
    label: "Approved",
    className: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    dot: "bg-emerald-400",
  },
  rejected: {
    label: "Rejected",
    className: "border border-rose-500/20 bg-rose-500/10 text-rose-400",
    dot: "bg-rose-400",
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

  const handleEditStartup = async (startup) => {
    const newDesc = prompt("Update startup description:", startup.description || startup.startupDescription || "");
    if (newDesc === null) return;
    try {
      await updateStartup(startup._id, { description: newDesc });
      setStartups((prev) =>
        prev.map((s) => (s._id === startup._id ? { ...s, description: newDesc, startupDescription: newDesc } : s))
      );
      setToast("Startup description updated successfully.");
    } catch (err) {
      setToast(err?.message || "Failed to update startup.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#090a0f] dark:text-[#f8fafc] transition-colors">
      <Navbar activePage="my-startups" />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-8 pb-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-slate-200 dark:border-white/[0.08] transition-colors">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
                My Startups
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 dark:bg-white/[0.06] dark:text-white dark:border-white/[0.08] transition-colors">
                {startups.length} Registered
              </span>
            </div>
            <p className="mt-1 text-[13.5px] text-slate-600 dark:text-slate-400 transition-colors">
              Manage your submitted startups, track watchlist status, and review company details.
            </p>
          </div>

          <Link
            href="/marketplace/create"
            className="cl-btn-primary h-9 px-4 text-[13px] self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span>Create Token</span>
          </Link>
        </div>

        <div>
          {loading && (
            <div className="flex items-center justify-center gap-2 py-20 text-slate-500 dark:text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin text-slate-900 dark:text-white" strokeWidth={2} />
              <span className="text-[13.5px] font-mono">Loading your startups & watchlist status...</span>
            </div>
          )}

          {error && (
            <div className="py-16 text-center">
              <p className="text-rose-500 dark:text-rose-400 text-[14px]">{error}</p>
              <button
                type="button"
                onClick={reload}
                className="cl-btn-primary mt-3 h-9 px-4 text-[13px]"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && startups.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-20 text-center rounded-2xl border border-dashed border-slate-300 bg-white dark:border-white/[0.08] dark:bg-[#111318] transition-colors">
              <Rocket className="h-10 w-10 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                You haven&apos;t submitted any startups yet.
              </p>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-sm">
                Submit your project to Calip to unlock automated capital formation, secondary listings, and investor reach.
              </p>
              <Link
                href="/marketplace/create"
                className="cl-btn-primary mt-2 h-9 px-5 text-[13px]"
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
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-slate-300 dark:border-white/[0.08] dark:bg-[#111318] dark:hover:border-white/20 sm:flex-row sm:items-center"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-[18px] font-bold text-slate-800 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white transition-colors">
                      {startup.startupName?.[0]?.toUpperCase() ?? "?"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight transition-colors">
                          {startup.startupName || "Untitled"}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.className}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                        {isWatched && (
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Bookmark className="w-3 h-3 fill-emerald-600 dark:fill-emerald-400" />
                            In Watchlist
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[12.5px] text-slate-500 dark:text-slate-400 transition-colors">
                        {startup.industrySector || "Tech"} · {startup.startupStage || startup.stage || "Early Stage"} ·{" "}
                        {startup.fundingStatus || "Bootstrapped"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
                      <div className="hidden text-right lg:block">
                        <p className="text-[10.5px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Submissions
                        </p>
                        <p className="text-[12.5px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {formatViews(startup.views)}
                        </p>
                      </div>

                      <div className="hidden text-right lg:block">
                        <p className="text-[10.5px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Submitted
                        </p>
                        <p className="text-[12.5px] font-mono font-semibold text-slate-700 dark:text-slate-300">
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
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-500 dark:hover:text-rose-400 group"
                            : "bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.08]"
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

                      {/* EDIT STARTUP BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleEditStartup(startup)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-800 shadow-xs hover:bg-slate-50 hover:text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08] transition-all"
                        title="Edit Startup Profile"
                      >
                        <span>Edit</span>
                      </button>

                      {/* OPEN DETAILS BUTTON */}
                      <button
                        type="button"
                        onClick={() => router.push(`/insights/${startupId}`)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-800 shadow-xs hover:bg-slate-50 hover:text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08] transition-all"
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
                            ? "bg-rose-600 text-white"
                            : "border border-rose-500/30 text-rose-500 dark:text-rose-400 hover:bg-rose-500/10"
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
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-xl bg-slate-900 border border-slate-700 text-white dark:bg-[#111318] dark:border-white/[0.12] px-5 py-2.5 text-[13px] font-semibold shadow-2xl pointer-events-none">
          {toast}
        </div>,
        document.body
      )}

      <Footer />
    </div>
  );
}