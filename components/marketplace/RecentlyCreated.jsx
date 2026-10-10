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
      <section aria-label="Recently created token" className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111318] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="cl-kicker-label">
              <span className="cl-mint-dot" />
              Recently Created · Ecosystem Token
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.08] text-[16px] font-bold text-white shadow-sm">
                {token.symbol.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-[20px] font-bold text-white">{token.name}</h3>
                <p className="font-mono text-[12px] text-[#94a3b8]">
                  ${token.symbol} · {token.sector} · Created recently
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-mono text-[13px] text-zinc-400">24h Change</span>
              <span className={`font-mono text-[24px] font-bold ${positive ? "text-emerald-400" : "text-rose-400"}`}>
                {positive ? "+" : ""}{token.change24h.toFixed(2)}%
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.push(`/marketplace/${token.id}`)}
              className="cl-btn-primary mt-5 h-[38px] px-4 text-[13px]"
            >
              View Full Performance <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="shrink-0 rounded-xl border border-white/[0.06] bg-[#090a0f] p-4">
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
