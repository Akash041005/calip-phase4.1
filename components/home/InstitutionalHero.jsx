"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Gavel, BarChart3, Wallet } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

export default function InstitutionalHero() {
  const { isAuthenticated, openConnectModal } = useAuth();

  const handleScrollToTerminal = () => {
    const el = document.getElementById("market-terminal-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-8 border-b border-slate-200/80 dark:border-white/[0.06] bg-gradient-to-b from-slate-100/60 via-white to-transparent dark:from-[#0d0f17] dark:via-[#090a0f] dark:to-[#090a0f] transition-colors">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 blur-[100px] rounded-full" />

      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Column: Vision & Primary Actions */}
          <div className="max-w-3xl">
            {/* Live Indicator Kicker */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50/90 dark:border-emerald-500/20 dark:bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-400 mb-3 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono tracking-wide uppercase font-semibold">BASE MAINNET LIVE</span>
              <span className="opacity-40">•</span>
              <span>Next-Gen Startup Liquidity</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Discover. Research. <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-zinc-400">Startup Opportunities.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-3 text-[14.5px] sm:text-[15.5px] leading-relaxed text-slate-600 dark:text-zinc-300 max-w-2xl">
              Calip brings institutional transparency to early-stage growth. Trade verified Startup Performance Tokens, inspect on-chain cap tables, and bid in primary Dutch auctions—all settled on Base.
            </p>

            {/* Action Bar */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleScrollToTerminal}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[13px] font-semibold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all cursor-pointer"
              >
                <span>Explore Markets</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href="/auction/live"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08] dark:hover:border-white/[0.2] shadow-xs transition-all"
              >
                <Gavel className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Primary Auctions</span>
              </Link>

              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={openConnectModal}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50/80 px-4 py-2.5 text-[13px] font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20 transition-all"
                >
                  <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Connect Wallet</span>
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50/80 px-4 py-2.5 text-[13px] font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20 transition-all"
                >
                  <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Trader Command Hub</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: Key Infrastructure Proof Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 lg:w-[380px] shrink-0">
            <div className="rounded-xl border border-slate-200/90 bg-white/80 p-3.5 shadow-xs dark:border-white/[0.08] dark:bg-white/[0.03] backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Due Diligence</span>
              </div>
              <p className="mt-1.5 text-[14px] font-bold text-slate-900 dark:text-white">KYC & Financials</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Every startup verified</p>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white/80 p-3.5 shadow-xs dark:border-white/[0.08] dark:bg-white/[0.03] backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                <Zap className="h-4 w-4 text-indigo-500" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Execution</span>
              </div>
              <p className="mt-1.5 text-[14px] font-bold text-slate-900 dark:text-white">Sub-Second P2P</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Base Layer-2 speed</p>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white/80 p-3.5 shadow-xs dark:border-white/[0.08] dark:bg-white/[0.03] backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                <BarChart3 className="h-4 w-4 text-cyan-500" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Signals</span>
              </div>
              <p className="mt-1.5 text-[14px] font-bold text-slate-900 dark:text-white">AI Traction Score</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Automated screening</p>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white/80 p-3.5 shadow-xs dark:border-white/[0.08] dark:bg-white/[0.03] backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Audited</span>
              </div>
              <p className="mt-1.5 text-[14px] font-bold text-slate-900 dark:text-white">Transparent</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">On-chain cap tables</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
