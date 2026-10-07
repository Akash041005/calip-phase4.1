"use client";

import { Plus } from "lucide-react";

export default function MarketplaceHeader({ onCreateClick }) {
  return (
    <div className="flex flex-col gap-[16px] sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-[24px] font-semibold leading-[30px] text-black dark:text-white">
          Marketplace
        </h1>
        <p className="mt-[5px] text-[14px] leading-[21px] text-[#4b5563] dark:text-[#9ca3af]">
          Buy and sell startup token allocations in the secondary market.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreateClick}
        className="flex h-[38px] items-center gap-[6px] rounded-[10px] bg-[#6366f1] px-[16px] text-[13px] font-semibold text-white transition-colors hover:bg-[#5558e3]"
      >
        <Plus className="h-[16px] w-[16px]" strokeWidth={2} />
        Create listing
      </button>
    </div>
  );
}