import { ArrowRight, Sparkles, Plus } from "lucide-react";
import Link from "next/link";

export default function FoundersHero() {
  return (
    <section className="pt-6 sm:pt-8 text-center border-b border-white/[0.06] pb-12">
      <p className="cl-kicker-label inline-flex items-center gap-2">
        <span className="cl-mint-dot" />
        Capital Raising for Visionary Teams
      </p>

      <h1 className="mt-3 text-[32px] sm:text-[44px] lg:text-[52px] font-bold tracking-tight text-white leading-tight">
        Scale with Programmable Capital
      </h1>

      <p className="mx-auto mt-3 max-w-2xl text-[14px] sm:text-[15.5px] leading-relaxed text-[#a6adbf]">
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
          className="cl-btn-secondary h-[42px] px-6 text-[13.5px]"
        >
          <Plus className="h-4 w-4 text-white" strokeWidth={2} />
          <span>Launch Startup Token</span>
        </Link>
      </div>
    </section>
  );
}
