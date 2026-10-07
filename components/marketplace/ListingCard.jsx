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
    <div className="flex flex-col rounded-[16px] border border-[#e5e7eb] bg-white p-[20px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] dark:border-[#2a2e3e] dark:bg-[#181c28] dark:shadow-[0px_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[17px] font-semibold leading-[22px] text-[#111827] dark:text-white">
            {startup.startupName || "Unknown startup"}
          </h3>
          <p className="mt-[2px] text-[12px] text-[#6b7280] dark:text-[#9ca3af]">
            {startup.industrySector || "—"} · {startup.stage || startup.startupStage || "—"}
          </p>
        </div>
        <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] bg-[#eef2ff] text-[#6366f1] dark:bg-[#1e1b4b] dark:text-[#818cf8]">
          <Store className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </div>
      </div>

      {listing?.listingType === "AUCTION" && (
        <span className="mt-[10px] inline-flex w-fit items-center rounded-[6px] bg-[#7c3aed] px-[8px] py-[3px] text-[10px] font-bold uppercase tracking-wide text-white">
          Auction
        </span>
      )}

      <div className="mt-[16px] grid grid-cols-2 gap-[12px]">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#9ca3af] dark:text-[#7c8190]">
            Price / token
          </p>
          <p className="mt-[2px] text-[18px] font-bold leading-none text-[#111827] dark:text-white">
            {formatAmount(listing?.pricePerToken)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#9ca3af] dark:text-[#7c8190]">
            Available tokens
          </p>
          <p className="mt-[2px] text-[18px] font-bold leading-none text-[#111827] dark:text-white">
            {formatTokens(availableTokens)}
          </p>
        </div>
      </div>

      <div className="mt-[14px]">
        <div className="flex items-center justify-between text-[11px] text-[#6b7280] dark:text-[#9ca3af]">
          <span>{listing?.currency || "USDT"}</span>
          <span>{remainingPct}% remaining</span>
        </div>
        <div className="mt-[6px] h-[6px] w-full overflow-hidden rounded-full bg-[#f3f4f6] dark:bg-[#242838]">
          <div
            className="h-full rounded-full bg-[#6366f1] transition-all"
            style={{ width: `${remainingPct}%` }}
          />
        </div>
      </div>

      <div className="mt-[16px] flex items-center justify-between border-t border-[#f3f4f6] pt-[14px] dark:border-[#242838]">
        <div className="flex items-center gap-2 text-[12px] text-[#6b7280] dark:text-[#9ca3af]">
          <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#eef2ff] text-[10px] font-bold text-[#6366f1] dark:bg-[#1e1b4b] dark:text-[#818cf8]">
            {(seller?.username || "S")[0]?.toUpperCase() ?? "S"}
          </span>
          <span className="max-w-[120px] truncate">
            {seller?.username || truncateWallet(listing?.sellerWallet || "")}
          </span>
        </div>

        <div className="flex items-center gap-[8px]">
          {isSeller ? (
            <button
              type="button"
              onClick={handleCancel}
              className={`flex h-[34px] items-center gap-1 rounded-[8px] px-[12px] text-[12px] font-semibold transition-colors ${
                confirming
                  ? "bg-[#F0395A] text-white"
                  : "border border-[#F0395A] text-[#F0395A] hover:bg-[#fef2f2] dark:hover:bg-[#3b1420]"
              }`}
            >
              {confirming ? "Confirm?" : "Cancel listing"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onBuy?.(listing)}
              disabled={availableTokens <= 0}
              className="flex h-[34px] items-center gap-1 rounded-[8px] bg-[#6366f1] px-[14px] text-[12px] font-semibold text-white transition-colors hover:bg-[#5558e3] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Buy
              <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={2} />
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