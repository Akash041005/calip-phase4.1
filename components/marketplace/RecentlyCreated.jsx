"use client";

import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import TokenSparkline from "./TokenSparkline";
import FadeUp from "../motion/FadeUp";

export default function RecentlyCreated({ token }) {
  const router = useRouter();
  if (!token) return null;
  const positive = token.change24h >= 0;

  return (
    <FadeUp>
      <section aria-label="Recently created token" className="overflow-hidden rounded-2xl border border-[#1a2436] bg-gradient-to-br from-[#101a30] via-[#0f1520] to-[#151238] p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#818cf8]">
              <Sparkles className="h-3.5 w-3.5" /> Recently Created · Your Latest Token
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1a2538] text-[17px] font-extrabold text-[#818cf8]">
                {token.symbol.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-[20px] font-extrabold text-white">{token.name}</h3>
                <p className="font-mono text-[12px] text-[#94a3b8]">
                  ${token.symbol} · {token.sector} · Created recently
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-mono text-[15px] text-neutral-400">Performance</span>
              <span className={`font-mono text-[28px] font-extrabold ${positive ? "text-emerald-400" : "text-rose-400"}`}>
                {positive ? "+" : ""}{token.change24h.toFixed(2)}%
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.push(`/marketplace/${token.id}`)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6366F1] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#5558e3]"
            >
              View Full Performance <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="shrink-0 rounded-xl border border-white/5 bg-[#0b0e14]/60 p-4">
            <TokenSparkline
              points={token.sparkline}
              positive={positive}
              width={220}
              height={90}
              label={`${token.name} (${token.symbol}): $${token.price.toFixed(2)}, ${positive ? "+" : ""}${token.change24h.toFixed(2)}%`}
            />
          </div>
        </div>
      </section>
    </FadeUp>
  );
}
