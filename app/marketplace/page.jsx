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

  const selectClass =
    "h-[38px] rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-[13px] font-medium text-[#f4f5fb] outline-none transition hover:border-white/[0.18] focus:border-[#8174ff]/60";

  return (
    <div className="min-h-screen bg-[#080a0f] text-[#f4f5fb]">
      <Navbar activePage="marketplace" />

      <main className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8">
        {/* HERO */}
        <FadeUp>
          <section className="flex flex-col gap-6 py-10 sm:py-14 lg:flex-row lg:items-end lg:justify-between border-b border-white/[0.06]">
            <div className="max-w-2xl">
              <p className="cl-kicker-label">
                <span className="cl-mint-dot" />
                Calip Marketplace
              </p>
              <h1 className="mt-3 text-[32px] font-bold leading-[1.08] tracking-tight text-white sm:text-[44px]">
                Discover the startups shaping <span className="text-[#bcb5ff]">what&apos;s next.</span>
              </h1>
              <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-[#a6adbf]">
                Explore startup tokens, track real-time performance, and discover what&apos;s
                happening across the Calip private market ecosystem.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5 font-mono text-[12px]">
                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1 text-[#a6adbf]">
                  <strong className="text-white font-sans">{tokens.length}</strong> tokens listed
                </span>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1 text-[#a6adbf]">
                  <strong className="text-white font-sans">{Math.max(1, sectors.length - 1)}</strong> sectors
                </span>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1 text-[#a6adbf]">
                  <strong className={avgChange >= 0 ? "text-[#78dfc0]" : "text-rose-400"}>
                    {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
                  </strong>{" "}
                  avg 24h
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/marketplace/create")}
              className="cl-btn-primary h-[44px] px-6 text-[13.5px] shrink-0"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} /> Create Token
            </button>
          </section>
        </FadeUp>

        {/* TOOLBAR */}
        <FadeUp delay={0.05}>
          <section aria-label="Discover tokens" className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#111723]/90 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737d91]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search startups or tokens..."
                aria-label="Search startups or tokens"
                className="h-[40px] w-full rounded-full border border-white/[0.08] bg-white/[0.04] pl-10 pr-4 text-[13.5px] text-white placeholder-[#737d91] outline-none transition focus:border-[#8174ff]/50 focus:bg-white/[0.06]"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <select aria-label="Filter by sector" value={sector} onChange={(e) => setSector(e.target.value)} className={selectClass}>
                {sectors.map((s) => (
                  <option key={s} value={s} className="bg-[#0d111b] text-white">{s === "All" ? "All sectors" : s}</option>
                ))}
              </select>
              <select aria-label="Filter by stage" value={stage} onChange={(e) => setStage(e.target.value)} className={selectClass}>
                {stages.map((s) => (
                  <option key={s} value={s} className="bg-[#0d111b] text-white">{s === "All" ? "All stages" : s}</option>
                ))}
              </select>
              <select aria-label="Sort tokens" value={sort} onChange={(e) => setSort(e.target.value)} className={`${selectClass} ml-auto`}>
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0d111b] text-white">{s.label}</option>
                ))}
              </select>
            </div>
          </section>
        </FadeUp>

        {/* GRID */}
        <section className="mt-8" aria-label="Startup tokens">
          {!loading && tokensError && tokens.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-rose-500/40 bg-[#0b0e14] p-10 text-center">
              <p className="mt-2 text-base font-semibold text-white">Couldn&apos;t load tokens</p>
              <p className="mx-auto mt-1 max-w-sm text-[13px] text-[#94a3b8]">
                {tokensError} Check that the backend is running and NEXT_PUBLIC_API_URL is set.
              </p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[240px] animate-pulse rounded-2xl border border-[#1a2436] bg-[#0f1520]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#1a2436] bg-[#0b0e14] p-10 text-center">
              <Store className="mx-auto h-10 w-10 text-neutral-600" strokeWidth={1.5} />
              <p className="mt-2 text-base font-semibold text-white">
                {query || sector !== "All" || stage !== "All" ? "No tokens match your filters" : "No startup tokens yet."}
              </p>
              <p className="mx-auto mt-1 max-w-sm text-[13px] text-[#94a3b8]">
                {query || sector !== "All" || stage !== "All"
                  ? "Try a different search or reset the filters."
                  : "Be one of the first to create one."}
              </p>
              <button
                type="button"
                onClick={() => router.push("/marketplace/create")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#6366F1] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#5558e3]"
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
          <div className="mt-4 flex items-center justify-center gap-2 py-6 text-[13px] text-[#94a3b8]">
            <Loader2 className="h-4 w-4 animate-spin text-[#6366f1]" /> Loading marketplace...
          </div>
        )}
      </main>
    </div>
  );
}
