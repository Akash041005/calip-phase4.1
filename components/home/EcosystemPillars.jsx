"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, BarChart3, CheckCircle2 } from "lucide-react";

const pillars = [
  {
    kicker: "Pillar 01 • Discovery & Verification",
    title: "Institutional Due Diligence on Every Profile",
    description:
      "Explore startup profiles with verified cap tables, founder KYC credentials, and real-time revenue references all indexed directly on Base.",
    features: ["Founder identity verification", "Cap table distribution ledger", "Audited financial filings"],
    linkText: "Browse Marketplace",
    href: "/marketplace",
    accent: "emerald",
  },
  {
    kicker: "Pillar 02 • Startup Performance Tokens",
    title: "Fractional Liquidity for Early Growth",
    description:
      "Participate in primary Dutch auctions with fair price discovery, followed by instant secondary peer-to-peer liquidity and transparent order books.",
    features: ["Fair Dutch presale auctions", "Bonding curve liquidity", "Non-custodial wallet settlement"],
    linkText: "View Live Auctions",
    href: "/auction/live",
    accent: "indigo",
  },
  {
    kicker: "Pillar 03 • AI Signal Intelligence",
    title: "Real-Time Traction & Market Signals",
    description:
      "Stay ahead with AI-assisted sentiment analysis, revenue milestone tracking, and autonomous graduation signals across leading ecosystem startups.",
    features: ["Automated momentum scores", "Whale order tracking", "Sector peer benchmarking"],
    linkText: "Explore Analytics",
    href: "/analytics",
    accent: "cyan",
  },
];

export default function EcosystemPillars() {
  return (
    <section className="mt-16 sm:mt-20 border-t border-slate-200/80 dark:border-white/[0.06] pt-14 pb-8 transition-colors">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Core Infrastructure
              </span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Why Institutional Traders Choose Calip
            </h2>
            <p className="mt-1 text-[13.5px] text-slate-600 dark:text-zinc-400 max-w-xl">
              A comprehensive Web3 infrastructure engineered for private startup tokenization and liquid discovery.
            </p>
          </div>

          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
          >
            <span>Explore all 42 tokens</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:border-slate-300 dark:border-white/[0.08] dark:bg-[#111318] dark:hover:border-white/[0.16] transition-all"
            >
              <div>
                <span className="text-[10.5px] font-mono uppercase font-semibold text-slate-500 dark:text-zinc-400 tracking-wider">
                  {pillar.kicker}
                </span>
                <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-600 dark:text-zinc-400">
                  {pillar.description}
                </p>

                <ul className="mt-5 space-y-2 border-t border-slate-100 dark:border-white/[0.06] pt-4 text-xs text-slate-700 dark:text-zinc-300">
                  {pillar.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
                <Link
                  href={pillar.href}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <span>{pillar.linkText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
