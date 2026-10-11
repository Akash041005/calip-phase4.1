import { ArrowRight, Sparkles, Plus } from "lucide-react";
import Link from "next/link";

export default function FoundersHero() {
  return (
    <section className="pt-6 sm:pt-8 text-center border-b border-slate-200 dark:border-white/[0.06] pb-12 transition-colors">
      <p className="cl-kicker-label inline-flex items-center gap-2">
        <span className="cl-mint-dot" />
        Capital Raising for Visionary Teams
      </p>

      <h1 className="mt-3 text-[32px] sm:text-[44px] lg:text-[52px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight transition-colors">
        Scale with Programmable Capital
      </h1>

      <p className="mx-auto mt-3 max-w-2xl text-[14px] sm:text-[15.5px] leading-relaxed text-slate-600 dark:text-[#a6adbf] transition-colors">
        List your startup on Calip to unlock transparent community auctions, AI-assisted valuation discovery, and on-chain secondary liquidity — all in one unified ecosystem.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
        <Link
          href="/marketplace"
          className="cl-btn-primary h-[42px] px-6 text-[13.5px]"
        >
          <span>Explore Live Startups</span>
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>

        <Link
          href="/marketplace/create"
          className="inline-flex h-[42px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-[13.5px] font-semibold text-slate-800 shadow-sm hover:bg-slate-50 hover:text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08] transition-all"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          <span>Launch Startup Token</span>
        </Link>
      </div>
    </section>
  );
}
