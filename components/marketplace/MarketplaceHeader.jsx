"use client";

import { Plus } from "lucide-react";

export default function MarketplaceHeader({ onCreateClick }) {
  return (
    <div className="flex flex-col gap-[16px] sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-tight text-white">
          Marketplace
        </h1>
        <p className="mt-1 text-[14px] text-slate-400">
          Buy and sell startup token allocations in the secondary market.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreateClick}
        className="cl-btn-primary h-[38px] px-4 text-[13px] font-semibold"
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
        Create listing
      </button>
    </div>
  );
}