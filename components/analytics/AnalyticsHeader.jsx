"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, GitCompare, Sparkles, TrendingUp, Layers } from "lucide-react";

export default function AnalyticsHeader() {
  const pathname = usePathname();
  const isComparison = pathname?.includes("/comparison");

  return (
    <div className="flex flex-col gap-5 border-b border-slate-200 dark:border-white/[0.06] pb-6 sm:flex-row sm:items-end sm:justify-between transition-colors">
      {/* Title & Kicker */}
      <div>
        <p className="cl-kicker-label flex items-center gap-2">
          <span className="cl-mint-dot" />
          On-Chain Intelligence & Analytics
        </p>
        <h1 className="mt-2 text-[30px] font-bold tracking-tight text-slate-900 dark:text-white sm:text-[38px] leading-tight transition-colors">
          Market & Ecosystem Analytics
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-slate-600 dark:text-[#a6adbf] transition-colors">
          Deep-dive funding heatmaps, deal stage allocation, historical activity, and AI-scored startup comparisons across the Calip ecosystem.
        </p>
      </div>

      {/* Segmented Control Navigation */}
      <div className="flex items-center gap-1 p-1 rounded-xl border border-slate-200 bg-white shadow-xs dark:border-white/[0.08] dark:bg-[#0e1015] sm:shrink-0 transition-colors">
        <Link
          href="/analytics"
          className={`inline-flex h-[32px] items-center gap-2 rounded-lg px-3.5 text-[12.5px] font-semibold transition-all select-none ${
            !isComparison
              ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-black"
              : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" strokeWidth={2} />
          <span>Overview</span>
        </Link>

        <Link
          href="/analytics/comparison"
          className={`inline-flex h-[32px] items-center gap-2 rounded-lg px-3.5 text-[12.5px] font-semibold transition-all select-none ${
            isComparison
              ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-black"
              : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          <GitCompare className="h-3.5 w-3.5" strokeWidth={2} />
          <span>Comparison</span>
        </Link>
      </div>
    </div>
  );
}