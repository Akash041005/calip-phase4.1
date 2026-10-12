"use client";

import { useState } from "react";
import { ArrowUpRight, Store } from "lucide-react";

function formatAmount(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "—";
  return `₹ ${Number(value).toLocaleString("en-IN")}`;
}

function formatTokens(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString("en-IN");
}

export default function ListingCard({ listing, onBuy, onCancel, isSeller }) {
  const [confirming, setConfirming] = useState(false);
  const startup = listing?.startupId || {};
  const seller = listing?.sellerId || {};
  const availableTokens = listing?.availableTokens ?? 0;
  const remainingPct =
    listing?.totalTokens > 0
      ? Math.round((availableTokens / listing.totalTokens) * 100)
      : 0;

  const handleCancel = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    onCancel?.(listing);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-slate-300 dark:border-white/[0.12] dark:bg-[#151824] dark:hover:border-white/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[17px] font-bold text-slate-900 dark:text-white transition-colors">
            {startup.startupName || "Unknown startup"}
          </h3>
          <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
            {startup.industrySector || "—"} · {startup.stage || startup.startupStage || "—"}
          </p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-800 dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white transition-colors">
          <Store className="h-4 w-4" strokeWidth={1.8} />
        </div>
      </div>

      {listing?.listingType === "AUCTION" && (
        <span className="mt-2.5 inline-flex w-fit items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
          Auction
        </span>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Price / token
          </p>
          <p className="mt-1 text-[18px] font-bold font-mono text-slate-900 dark:text-white transition-colors">
            {formatAmount(listing?.pricePerToken)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Available tokens
          </p>
          <p className="mt-1 text-[18px] font-bold font-mono text-slate-900 dark:text-white transition-colors">
            {formatTokens(availableTokens)}
          </p>
        </div>
      </div>

      <div className="mt-3.5">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{listing?.currency || "USDT"}</span>
          <span className="font-mono">{remainingPct}% remaining</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all"
            style={{ width: `${remainingPct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-white/[0.06] pt-3.5">
        <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-800 dark:bg-white/10 dark:text-white font-mono">
            {(seller?.username || "S")[0]?.toUpperCase() ?? "S"}
          </span>
          <span className="max-w-[120px] truncate text-slate-600 dark:text-slate-400">
            {seller?.username || truncateWallet(listing?.sellerWallet || "")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isSeller ? (
            <button
              type="button"
              onClick={handleCancel}
              className={`flex h-[34px] items-center gap-1 rounded-xl px-3 text-[12px] font-semibold transition-colors ${
                confirming
                  ? "bg-rose-600 text-white"
                  : "border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
              }`}
            >
              {confirming ? "Confirm?" : "Cancel listing"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onBuy?.(listing)}
              disabled={availableTokens <= 0}
              className="cl-btn-primary h-[34px] px-3.5 text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Buy
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function truncateWallet(wallet) {
  if (!wallet) return "";
  if (wallet.length <= 12) return wallet;
  return `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
}