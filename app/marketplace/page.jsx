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
    "h-[40px] rounded-xl border border-[#1a2436] bg-[#0f1520] px-3 text-[13px] font-medium text-neutral-200 outline-none transition focus:border-[#6366f1]";

  return (
    <div className="min-h-screen bg-[#070a0f] text-[#f8fafc]">
      <Navbar activePage="marketplace" />

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* HERO */}
        <FadeUp>
          <section className="flex flex-col gap-6 py-10 sm:py-14 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#818cf8]">
                Calip Marketplace
              </p>
              <h1 className="mt-3 text-[32px] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[44px]">
                Discover the startups shaping what&apos;s next.
              </h1>
              <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-[#94a3b8] sm:text-[15px]">
                Explore startup tokens, track their performance, and discover what&apos;s
                happening across the Calip ecosystem.
              </p>
              <div className="mt-5 flex flex-wrap gap-6 font-mono text-[12px] text-[#5e6f85]">
                <span><strong className="text-white">{tokens.length}</strong> tokens listed</span>
                <span><strong className="text-white">{sectors.length - 1}</strong> sectors</span>
                <span>
                  <strong className={avgChange >= 0 ? "text-emerald-400" : "text-rose-400"}>
                    {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
                  </strong>{" "}
                  avg 24h
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/marketplace/create")}
              className="inline-flex h-[46px] shrink-0 items-center gap-2 rounded-xl bg-[#6366F1] px-6 text-[14px] font-bold text-white shadow-[0_4px_24px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 hover:bg-[#5558e3]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} /> Create Token
            </button>
          </section>
        </FadeUp>

        {/* TOOLBAR */}
        <FadeUp delay={0.05}>
          <section aria-label="Discover tokens" className="flex flex-col gap-3 rounded-2xl border border-[#1a2436] bg-[#0f1520] p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5e6f85]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search startups or tokens..."
                aria-label="Search startups or tokens"
                className="h-[42px] w-full rounded-xl border border-[#1a2436] bg-[#0b0e14] pl-10 pr-4 text-[13.5px] text-white placeholder-[#5e6f85] outline-none transition focus:border-[#6366f1]"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <select aria-label="Filter by sector" value={sector} onChange={(e) => setSector(e.target.value)} className={selectClass}>
                {sectors.map((s) => (
                  <option key={s} value={s}>{s === "All" ? "All sectors" : s}</option>
                ))}
              </select>
              <select aria-label="Filter by stage" value={stage} onChange={(e) => setStage(e.target.value)} className={selectClass}>
                {stages.map((s) => (
                  <option key={s} value={s}>{s === "All" ? "All stages" : s}</option>
                ))}
              </select>
              <select aria-label="Sort tokens" value={sort} onChange={(e) => setSort(e.target.value)} className={`${selectClass} ml-auto`}>
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
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
