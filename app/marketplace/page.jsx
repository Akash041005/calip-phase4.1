"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Store, Loader2 } from "lucide-react";
import Navbar from "../../components/dashboard/Navbar";
import TokenCard from "../../components/marketplace/TokenCard";
import RecentlyCreated from "../../components/marketplace/RecentlyCreated";
import FadeUp from "../../components/motion/FadeUp";
import { getTokens } from "../../lib/tradingApi";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../../lib/usersApi";

const SORTS = [
  { id: "newest", label: "Newest" },
  { id: "performance", label: "Performance" },
  { id: "name", label: "Name" },
];

import Footer from "../../components/dashboard/Footer";

export default function MarketplacePage() {
  const router = useRouter();
  const [tokens, setTokens] = useState([]);
  const [tokensError, setTokensError] = useState("");
  const latest = useMemo(() => [...tokens].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0] || null, [tokens]);
  const sectors = useMemo(() => ["All", ...new Set(tokens.map((t) => t.sector))], [tokens]);
  const stages = useMemo(() => ["All", ...new Set(tokens.map((t) => t.stage))], [tokens]);

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All");
  const [stage, setStage] = useState("All");
  const [sort, setSort] = useState("newest");
  const [watchIds, setWatchIds] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    getTokens({ limit: 100 })
      .then((res) => {
        if (cancelled) return;
        setTokens(res.items || []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setTokensError("Could not load tokens from the backend.");
        setLoading(false);
      });
    getWatchlist()
      .then((res) => {
        if (cancelled || !res) return;
        const items = res?.items || res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
        setWatchIds(new Set(items.map((w) => w?._id || w?.id).filter(Boolean)));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggleWatch(token, adding) {
    try {
      if (adding) {
        await addToWatchlist(token.startupId);
        setWatchIds((prev) => new Set(prev).add(token.startupId));
      } else {
        await removeFromWatchlist(token.startupId);
        setWatchIds((prev) => {
          const next = new Set(prev);
          next.delete(token.startupId);
          return next;
        });
      }
    } catch {
      // WatchlistButton surfaces its own error state.
    }
  }

  const filtered = useMemo(() => {
    let list = [...tokens];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((t) =>
        [t.name, t.symbol, t.sector, t.stage].join(" ").toLowerCase().includes(q)
      );
    }
    if (sector !== "All") list = list.filter((t) => t.sector === sector);
    if (stage !== "All") list = list.filter((t) => t.stage === stage);
    if (sort === "newest") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "performance") list.sort((a, b) => b.change24h - a.change24h);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [tokens, query, sector, stage, sort]);

  const avgChange = useMemo(() => {
    if (!tokens.length) return 0;
    return tokens.reduce((s, t) => s + t.change24h, 0) / tokens.length;
  }, [tokens]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#090a0f] dark:text-[#f4f5fb] transition-colors">
      <Navbar activePage="marketplace" />

      <main className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8">
        {/* HERO */}
        <FadeUp>
          <section className="flex flex-col gap-6 py-10 sm:py-14 lg:flex-row lg:items-end lg:justify-between border-b border-slate-200 dark:border-white/[0.08]">
            <div className="max-w-2xl">
              <p className="cl-kicker-label">
                <span className="cl-mint-dot" />
                Markets & Token Discovery
              </p>
              <h1 className="mt-3 text-[32px] font-bold leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-[44px]">
                Discover startups shaping <span className="text-slate-500 dark:text-zinc-400">the future.</span>
              </h1>
              <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-slate-600 dark:text-[#94a3b8]">
                Explore verified startup performance tokens, track real-time liquidity, and participate in primary market discovery.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5 font-mono text-[12px]">
                <span className="rounded-md border border-slate-200 bg-white shadow-xs px-3.5 py-1 text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-[#94a3b8]">
                  <strong className="text-slate-900 dark:text-white font-sans">{tokens.length}</strong> tokens listed
                </span>
                <span className="rounded-md border border-slate-200 bg-white shadow-xs px-3.5 py-1 text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-[#94a3b8]">
                  <strong className="text-slate-900 dark:text-white font-sans">{Math.max(1, sectors.length - 1)}</strong> sectors
                </span>
                <span className="rounded-md border border-slate-200 bg-white shadow-xs px-3.5 py-1 text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-[#94a3b8]">
                  <strong className={avgChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                    {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
                  </strong>{" "}
                  avg 24h
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/marketplace/create")}
              className="cl-btn-primary h-[42px] px-5 text-[13px] shrink-0"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} /> Create Token
            </button>
          </section>
        </FadeUp>

        {/* TOOLBAR */}
        <FadeUp delay={0.05}>
          <section aria-label="Discover tokens" className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#111318]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search startups or tokens..."
                aria-label="Search startups or tokens"
                className="h-[40px] w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-[13.5px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:bg-white dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:placeholder-zinc-500 dark:focus:border-white/20 dark:focus:bg-[#111318]"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <select aria-label="Filter by sector" value={sector} onChange={(e) => setSector(e.target.value)} className="h-[38px] rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-800 outline-none transition hover:border-slate-300 dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-zinc-200 dark:hover:border-white/20">
                {sectors.map((s) => (
                  <option key={s} value={s} className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">{s === "All" ? "All sectors" : s}</option>
                ))}
              </select>
              <select aria-label="Filter by stage" value={stage} onChange={(e) => setStage(e.target.value)} className="h-[38px] rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-800 outline-none transition hover:border-slate-300 dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-zinc-200 dark:hover:border-white/20">
                {stages.map((s) => (
                  <option key={s} value={s} className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">{s === "All" ? "All stages" : s}</option>
                ))}
              </select>
              <select aria-label="Sort tokens" value={sort} onChange={(e) => setSort(e.target.value)} className="h-[38px] rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-800 outline-none transition hover:border-slate-300 dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-zinc-200 dark:hover:border-white/20 ml-auto">
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">{s.label}</option>
                ))}
              </select>
            </div>
          </section>
        </FadeUp>

        {/* GRID */}
        <section className="mt-8" aria-label="Startup tokens">
          {!loading && tokensError && tokens.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-rose-500/30 bg-rose-50/50 dark:bg-[#111318] p-10 text-center">
              <p className="mt-2 text-base font-semibold text-rose-700 dark:text-white">Couldn&apos;t load tokens</p>
              <p className="mx-auto mt-1 max-w-sm text-[13px] text-slate-600 dark:text-[#94a3b8]">
                {tokensError} Check that the backend is running and NEXT_PUBLIC_API_URL is set.
              </p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[240px] animate-pulse rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-white/[0.08] dark:bg-[#111318]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-white/[0.08] dark:bg-[#111318]">
              <Store className="mx-auto h-10 w-10 text-slate-400 dark:text-zinc-600" strokeWidth={1.5} />
              <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                {query || sector !== "All" || stage !== "All" ? "No tokens match your filters" : "No startup tokens yet."}
              </p>
              <p className="mx-auto mt-1 max-w-sm text-[13px] text-slate-500 dark:text-[#94a3b8]">
                {query || sector !== "All" || stage !== "All"
                  ? "Try a different search or reset the filters."
                  : "Be one of the first to create one."}
              </p>
              <button
                type="button"
                onClick={() => router.push("/marketplace/create")}
                className="cl-btn-primary mt-4 h-[38px] px-4 text-[13px]"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} /> Create Token
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((token, i) => (
                <TokenCard
                  key={token.id}
                  token={token}
                  index={i}
                  watched={watchIds.has(token.startupId)}
                  onToggleWatch={(adding) => handleToggleWatch(token, adding)}
                />
              ))}
            </div>
          )}
        </section>

        {/* RECENTLY CREATED */}
        {!loading && latest && (
          <div className="mt-12">
            <RecentlyCreated token={latest} />
          </div>
        )}

        {loading && (
          <div className="mt-4 flex items-center justify-center gap-2 py-6 text-[13px] text-slate-500 dark:text-[#94a3b8]">
            <Loader2 className="h-4 w-4 animate-spin text-slate-700 dark:text-white" /> Loading marketplace...
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
