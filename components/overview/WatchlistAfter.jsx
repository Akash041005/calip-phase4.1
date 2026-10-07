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
    <div className="min-h-screen bg-[#fbfbf9] dark:bg-[#0c0e14]">
      <Navbar />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pb-8">
        <div className="pt-4">
          <h1 className="text-[28px] font-bold leading-none text-[#1a1a2e] dark:text-white">
            Watchlist
          </h1>
          <p className="mt-[4px] text-[16px] text-[#6b7280] dark:text-[#9ca3af]">
            Track your saved companies and stay updated on their auction activity.
          </p>
        </div>

        <div className="mt-[24px] flex items-center justify-between">
          <span className="text-[18px] text-[#374151] dark:text-[#b0b5bf]">
            Saved companies ({startups.length})
          </span>

          <button
            type="button"
            onClick={() => { setModalOpen(true); setActionError(""); }}
            className="flex h-[34px] items-center gap-[5px] rounded-lg bg-[#6366f1] px-[12px] text-white transition-colors hover:bg-[#5558e3]"
          >
            <Plus className="h-[18px] w-[18px]" strokeWidth={1.5} />
            <span className="text-[14px] font-medium leading-none">Add companies</span>
          </button>
        </div>

        {actionError && (
          <div className="mt-[16px] flex items-start gap-[10px] rounded-[10px] border border-[#fca5a5] bg-[#fef2f2] dark:border-[#7f1d1d] dark:bg-[#2a1215] px-[16px] py-[12px]">
            <X className="mt-[2px] h-[16px] w-[16px] shrink-0 text-[#dc2626]" strokeWidth={2} />
            <p className="text-[14px] leading-[20px] text-[#b91c1c] dark:text-[#fecaca]">
              {actionError}
            </p>
          </div>
        )}

        {loading ? (
          <div className="mt-[20px] text-center text-[#6b7280] dark:text-[#9ca3af]">Loading watchlist…</div>
        ) : startups.length === 0 ? (
          <div className="mt-[20px] text-center text-[#6b7280] dark:text-[#9ca3af]">
            No startups in your watchlist
          </div>
        ) : (
          <div className="mt-[20px] space-y-[16px]">
            {startups.map((startup) => (
              <CompanyCard key={startup._id} startup={startup} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </main>

      <ModalPortal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        backdropClassName="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
        ariaLabel="Add companies to watchlist"
      >
        <div
          className="w-full max-w-[560px] rounded-[16px] border border-[#f0f0f0] bg-white p-6 shadow-xl dark:border-[#2a2e3e] dark:bg-[#181c28]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold text-[#1a1a2e] dark:text-white">
              Add companies
            </h2>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-lg bg-[#f3f4f6] text-[#374151] transition-colors hover:bg-[#e5e7eb] dark:bg-[#1c202e] dark:text-[#b0b5bf] dark:hover:bg-[#2a2e3e]"
              aria-label="Close"
            >
              <X className="h-[16px] w-[16px]" strokeWidth={2} />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 dark:border-[#2a2e3e] dark:bg-[#181c28]">
            <Search className="h-[16px] w-[16px] text-[#9ca3af]" strokeWidth={2} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search startups..."
              className="h-[40px] w-full bg-transparent text-[14px] text-[#1a1a2e] placeholder:text-[#9ca3af] outline-none dark:text-white"
            />
          </div>

          <div className="mt-4 max-h-[320px] overflow-y-auto" data-lenis-prevent>
            {!query.trim() ? (
              <p className="py-8 text-center text-[13px] text-[#9ca3af]">
                Type to search for startups
              </p>
            ) : searching ? (
              <p className="py-8 text-center text-[13px] text-[#9ca3af]">Searching…</p>
            ) : results.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-[#9ca3af]">
                No startups found
              </p>
            ) : (
              results.map((startup) => {
                const isAdded = watchlistIds.includes(startup._id);
                return (
                  <div
                    key={startup._id}
                    className="flex items-center justify-between border-b border-[#f3f4f6] py-3 dark:border-[#242838]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-[38px] w-[38px] items-center justify-center rounded-lg bg-[#eef2ff] text-[15px] font-semibold text-[#6366f1]">
                        {startup.startupName?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-[#1a1a2e] dark:text-white">
                          {startup.startupName ?? "Unknown"}
                        </p>
                        <p className="text-[12px] text-[#9ca3af]">
                          {startup.industrySector ?? "N/A"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAdd(startup._id)}
                      disabled={isAdded}
                      className={`flex h-[30px] items-center gap-1 rounded-lg px-3 text-[13px] font-medium transition-colors ${
                        isAdded
                          ? "bg-[#e5e7eb] text-[#6b7280] dark:bg-[#2a2e3e] dark:text-[#7c8190]"
                          : "bg-[#6366f1] text-white hover:bg-[#5558e3]"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-[14px] w-[14px]" strokeWidth={2.5} /> Added
                        </>
                      ) : (
                        <>
                          <Plus className="h-[14px] w-[14px]" strokeWidth={2.5} /> Add
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
