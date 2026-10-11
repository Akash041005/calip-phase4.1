"use client";

import { useState, useEffect } from "react";
import { Plus, X, Search, Check } from "lucide-react";
import Navbar from "../dashboard/Navbar";
import CompanyCard from "./CompanyCard";
import ModalPortal from "../ui/ModalPortal";
import { searchStartups } from "../../lib/startupsApi";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../../lib/usersApi";

export default function WatchlistAfter() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [actionError, setActionError] = useState("");

  const refreshWatchlist = async () => {
    setActionError("");
    const res = await getWatchlist();
    const items = res?.items || res?.data?.items || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    setStartups(items.filter(Boolean));
    setWatchlistIds(items.map((item) => item._id || item.id).filter(Boolean));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getWatchlist();
        if (!cancelled) {
          const items = res?.items || res?.data?.items || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
          setStartups(items.filter(Boolean));
          setWatchlistIds(items.map((item) => item._id || item.id).filter(Boolean));
        }
      } catch (error) {
        console.error("Failed to fetch watchlist:", error);
        if (!cancelled) setStartups([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Debounced modal search: previously every keystroke = fetch + 3 renders.
  // Note: state resets are deferred into the timeout callback so the effect
  // body itself stays subscription-only (no sync setState -> no cascade).
  useEffect(() => {
    let cancelled = false;
    if (!modalOpen || !query.trim()) {
      const timer = setTimeout(() => {
        if (cancelled) return;
        setResults((prev) => (prev.length === 0 ? prev : []));
        setSearching((prev) => (prev === false ? prev : false));
      }, 0);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }
    const timer = setTimeout(() => {
      if (cancelled) return;
      setSearching(true);
      async function search() {
        try {
          const res = await searchStartups(query.trim(), 1, 20);
          if (!cancelled) setResults(res?.startups || []);
        } catch {
          if (!cancelled) setResults([]);
        } finally {
          if (!cancelled) setSearching(false);
        }
      }
      search();
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [modalOpen, query]);

  const handleAdd = async (startupId) => {
    setActionError("");
    try {
      await addToWatchlist(startupId);
      await refreshWatchlist();
    } catch (err) {
      console.error("Failed to add to watchlist:", err);
    }
  };

  const handleRemove = async (startup) => {
    setActionError("");
    const targetId = startup._id || startup.id;
    try {
      await removeFromWatchlist(targetId);
      await refreshWatchlist();
    } catch (err) {
      console.warn("Failed to remove from watchlist:", err?.message || err);
      setActionError(
        err?.message || "Could not remove this startup from your watchlist. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#08090d] dark:text-[#f8fafc] transition-colors">
      <Navbar activePage="dashboard" />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pb-12">
        <div className="pt-6 border-b border-slate-200 dark:border-white/[0.08] pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="cl-kicker-label">
              <span className="cl-mint-dot" />
              Saved Portfolios
            </p>
            <h1 className="mt-2 text-[26px] sm:text-[32px] font-bold leading-tight text-slate-900 dark:text-white">
              Watchlist
            </h1>
            <p className="mt-1 text-[14px] text-slate-500 dark:text-[#94a3b8]">
              Track your saved companies, liquidity movements, and stay updated on auction activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => { setModalOpen(true); setActionError(""); }}
            className="cl-btn-primary h-[38px] px-4 text-[13px] shrink-0"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add companies
          </button>
        </div>

        {actionError && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-rose-500 dark:text-rose-400 text-[13.5px]">
            <X className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
            <p>{actionError}</p>
          </div>
        )}

        {loading ? (
          <div className="mt-8 text-center text-[13px] text-slate-500 dark:text-[#94a3b8]">Loading watchlist…</div>
        ) : startups.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200/90 bg-white dark:border-white/[0.12] dark:bg-[#151824] p-12 text-center text-slate-500 dark:text-[#94a3b8] shadow-sm">
            <p className="text-[15px] font-semibold text-slate-900 dark:text-white">No startups in your watchlist</p>
            <p className="mt-1 text-[13px]">Add startups to monitor their real-time performance.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {startups.map((startup) => (
              <CompanyCard key={startup._id} startup={startup} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </main>

      <ModalPortal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        backdropClassName="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        ariaLabel="Add companies to watchlist"
      >
        <div
          className="w-full max-w-[560px] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-slate-900 dark:border-white/[0.12] dark:bg-[#151824] dark:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-slate-900 dark:text-white">
              Add companies to watchlist
            </h2>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-[#94a3b8] dark:hover:text-white transition"
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-white/[0.08] dark:bg-[#0e111c]">
            <Search className="h-4 w-4 text-slate-400 dark:text-[#94a3b8]" strokeWidth={2} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search startups by name..."
              className="h-[40px] w-full bg-transparent text-[13.5px] text-slate-900 placeholder:text-slate-400 dark:text-white dark:placeholder:text-[#94a3b8] outline-none"
            />
          </div>

          <div className="mt-4 max-h-[320px] overflow-y-auto" data-lenis-prevent>
            {!query.trim() ? (
              <p className="py-8 text-center text-[13px] text-slate-500 dark:text-[#94a3b8]">
                Type to search for startups
              </p>
            ) : searching ? (
              <p className="py-8 text-center text-[13px] text-slate-500 dark:text-[#94a3b8]">Searching…</p>
            ) : results.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-slate-500 dark:text-[#94a3b8]">
                No startups found
              </p>
            ) : (
              results.map((startup) => {
                const isAdded = watchlistIds.includes(startup._id);
                return (
                  <div
                    key={startup._id}
                    className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-[36px] w-[36px] items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-800 dark:bg-white/[0.05] dark:border-white/[0.08] text-[14px] font-semibold dark:text-white">
                        {startup.startupName?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
                          {startup.startupName ?? "Unknown"}
                        </p>
                        <p className="text-[12px] text-slate-500 dark:text-[#94a3b8]">
                          {startup.industrySector ?? "N/A"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAdd(startup._id)}
                      disabled={isAdded}
                      className={`flex h-[32px] items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold transition-all ${
                        isAdded
                          ? "border border-slate-200 bg-slate-100 text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#94a3b8]"
                          : "cl-btn-primary"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> Added
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} /> Add
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </ModalPortal>
    </div>
  );
}
