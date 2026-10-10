"use client";

import { BarChart3, TrendingUp, Store, Zap, Activity } from "lucide-react";

export default function DashboardHeader({ tokens = [] }) {
  const totalFdv = tokens.length > 0
    ? tokens.reduce((sum, t) => sum + (Number(t.fdvRaw) || 0), 0)
    : 428500000;

  const totalVol = tokens.length > 0
    ? tokens.reduce((sum, t) => sum + (Number(t.volRaw) || 0), 0)
    : 38200000;

  const formatCompact = (num) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* ─── TITLE & METADATA ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Markets Overview
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-tight">
            Markets Dashboard
          </h1>
          <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-zinc-400">
            Real-time startup performance tokens, live on-chain executions, liquidity monitoring, and ecosystem momentum.
          </p>
        </div>

        {/* Live Network Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-end">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Base Mainnet</span>
            <span className="text-white/20">•</span>
            <span className="text-zinc-400">Live</span>
          </div>
        </div>
      </div>

      {/* ─── 4 EXECUTIVE KPI CARDS (CLEAN INSTITUTIONAL STYLE) ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total FDV */}
        <div className="rounded-xl border border-white/[0.08] bg-[#111318] p-5 hover:border-white/[0.15] transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-medium uppercase tracking-wider text-zinc-400">
              Total Market FDV
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-400">
              <BarChart3 className="h-3.5 w-3.5" strokeWidth={1.8} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-white tracking-tight tabular-nums">
              {formatCompact(totalFdv || 428500000)}
            </span>
            <span className="font-mono text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              +8.4%
            </span>
          </div>
          <p className="mt-1 text-[11.5px] text-zinc-500">
            Aggregate fully diluted valuation
          </p>
        </div>

        {/* Card 2: 24h Volume */}
        <div className="rounded-xl border border-white/[0.08] bg-[#111318] p-5 hover:border-white/[0.15] transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-medium uppercase tracking-wider text-zinc-400">
              24H Trading Volume
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-400">
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.8} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-white tracking-tight tabular-nums">
              {formatCompact(totalVol || 38200000)}
            </span>
            <span className="font-mono text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              +14.2%
            </span>
          </div>
          <p className="mt-1 text-[11.5px] text-zinc-500">
            Real-time on-chain turnover
          </p>
        </div>

        {/* Card 3: Active Tokens */}
        <div className="rounded-xl border border-white/[0.08] bg-[#111318] p-5 hover:border-white/[0.15] transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-medium uppercase tracking-wider text-zinc-400">
              Active Tokens
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-400">
              <Store className="h-3.5 w-3.5" strokeWidth={1.8} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-white tracking-tight tabular-nums">
              {tokens.length || 42}
            </span>
            <span className="rounded bg-white/[0.05] border border-white/[0.08] px-1.5 py-0.5 text-[10.5px] font-medium text-zinc-300 font-mono">
              Verified
            </span>
          </div>
          <p className="mt-1 text-[11.5px] text-zinc-500">
            Startup performance tokens listed
          </p>
        </div>

        {/* Card 4: 24h Transactions */}
        <div className="rounded-xl border border-white/[0.08] bg-[#111318] p-5 hover:border-white/[0.15] transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-medium uppercase tracking-wider text-zinc-400">
              24H Whale Activity
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-400">
              <Zap className="h-3.5 w-3.5" strokeWidth={1.8} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-white tracking-tight tabular-nums">
              1,280
            </span>
            <span className="font-mono text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              98.4% Win
            </span>
          </div>
          <p className="mt-1 text-[11.5px] text-zinc-500">
            Live orders indexed on Calip
          </p>
        </div>
      </div>
    </div>
  );
}
