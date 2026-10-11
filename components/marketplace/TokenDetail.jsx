"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Users, Activity, ShieldAlert } from "lucide-react";
import TokenPerformanceChart from "./TokenPerformanceChart";
import WatchlistButton from "./WatchlistButton";
import FadeUp from "../motion/FadeUp";
import TokenTradePanel from "./TokenTradePanel";

function timeAgo(iso) {
  const hours = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 3600000));
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function TokenDetail({ token, watched, onToggleWatch }) {
  return (
    <div className="mx-auto min-w-0 max-w-5xl overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
      <FadeUp>
        <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>
      </FadeUp>

      {/* Identity */}
      <FadeUp delay={0.05}>
        <div className="mt-4 flex min-w-0 flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-6 sm:flex-row sm:items-center sm:justify-between shadow-sm dark:border-white/[0.08] dark:bg-[#111318]">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-[18px] font-bold text-slate-900 shadow-sm dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white">
              {token.symbol.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[22px] font-bold text-slate-900 dark:text-white">{token.name}</h1>
              <p className="font-mono text-[12.5px] text-slate-500 dark:text-[#94a3b8]">
                ${token.symbol} · {token.sector} · {token.stage} · Created {timeAgo(token.createdAt)}
              </p>
            </div>
          </div>
          <WatchlistButton
            startupId={token.startupId}
            startupName={token.name}
            watched={watched}
            onToggle={onToggleWatch}
          />
        </div>
      </FadeUp>

      {/* Performance */}
      <FadeUp delay={0.1}>
        <div className="mt-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#111318]">
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Performance</h2>
          <div className="mt-3 min-w-0 overflow-hidden">
            <TokenPerformanceChart token={token} />
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.11}>
        <div className="mt-6 min-w-0">
          <TokenTradePanel token={token} startupId={token.startupId} />
        </div>
      </FadeUp>

      {/* About + founder + metrics */}
      <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
        <FadeUp delay={0.12} className="lg:col-span-2">
          <div className="h-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#111318]">
            <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">About the Startup</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600 dark:text-zinc-300">{token.about}</p>
            <div className="mt-5 border-t border-slate-200 dark:border-white/[0.06] pt-4">
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">Founder</h3>
              <p className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-600 dark:text-zinc-300">
                <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" /> {token.founder}
              </p>
            </div>
          </div>
        </FadeUp>
        <FadeUp delay={0.16}>
          <div className="flex h-full min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#111318]">
            <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Startup Metrics</h2>
            {[
              { icon: Users, label: "Holders", value: token.metrics.holders.toLocaleString("en-IN") },
              { icon: Activity, label: "24h Volume", value: `₹${token.metrics.volume24h.toLocaleString("en-IN")}` },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/[0.06] dark:bg-[#0e1015]">
                <span className="inline-flex items-center gap-2 text-[12.5px] text-slate-600 dark:text-zinc-400">
                  <m.icon className="h-4 w-4 text-slate-500 dark:text-zinc-400" /> {m.label}
                </span>
                <span className="font-mono text-[13px] font-bold text-slate-900 dark:text-white">{m.value}</span>
              </div>
            ))}
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
              <p className="text-[11.5px] leading-relaxed text-slate-600 dark:text-zinc-400">
                Prototype data for design review. Markets involve risk; nothing here guarantees outcomes.
              </p>
            </div>
          </div>
        </FadeUp>
      </div>
    </div>
  );
}
