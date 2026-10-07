"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import TokenSparkline from "./TokenSparkline";
import WatchlistButton from "./WatchlistButton";
import FadeUp from "../motion/FadeUp";

function timeAgo(iso) {
  if (!iso) return "New";
  const days = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));
  if (days <= 0) return "Today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

export default function TokenCard({ token, watched, onToggleWatch, index = 0 }) {
  const router = useRouter();
  const positive = token.change24h >= 0;

  function open() {
    router.push(`/marketplace/${token.id}`);
  }

  return (
    <FadeUp delay={Math.min(index * 0.05, 0.3)}>
      <article
        onClick={open}
        className="group flex h-full cursor-pointer flex-col rounded-2xl border border-[#1a2436] bg-[#0f1520] p-5 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-[#6366f1]/50 hover:shadow-[0_12px_40px_rgba(99,102,241,0.18)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1a2538] text-[16px] font-extrabold text-[#818cf8]">
              {token.symbol.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-bold text-white group-hover:text-[#a5b4fc] transition-colors">
                {token.name}
              </h3>
              <p className="font-mono text-[11.5px] text-[#5e6f85]">${token.symbol}</p>
            </div>
          </div>
          <span onClick={(e) => e.stopPropagation()}>
            <WatchlistButton
              startupId={token.startupId}
              startupName={token.name}
              watched={watched}
              onToggle={onToggleWatch}
              showLabel={false}
            />
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-neutral-300">
            {token.sector}
          </span>
          <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-neutral-300">
            {token.stage}
          </span>
          <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-neutral-400">
            {timeAgo(token.createdAt)}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[22px] font-extrabold leading-none text-white">
              ${token.price.toFixed(2)}
            </p>
            <p className={`mt-1 font-mono text-[12.5px] font-bold ${positive ? "text-emerald-400" : "text-rose-400"}`}>
              {positive ? "+" : ""}{token.change24h.toFixed(2)}%
            </p>
          </div>
          <TokenSparkline
            points={token.sparkline}
            positive={positive}
            label={`${token.name} (${token.symbol}): $${token.price.toFixed(2)}, ${positive ? "+" : ""}${token.change24h.toFixed(2)}%`}
          />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
          <span className="font-mono text-[11px] text-[#5e6f85]">
            {token.metrics.holders.toLocaleString("en-IN")} holders
          </span>
          <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#818cf8] transition group-hover:gap-2">
            View Token <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </article>
    </FadeUp>
  );
}
