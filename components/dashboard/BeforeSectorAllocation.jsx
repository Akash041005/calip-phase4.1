"use client";

import { beforeSectorData } from "./beforeMockData";

export default function BeforeSectorAllocation() {
  return (
    <div className="h-[340px] w-full rounded-[14px] border border-[#f0f0f0] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:border-[#242838] dark:bg-[#181c28] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex h-full flex-col p-[24px]">
        <h2 className="text-[18px] font-semibold text-[#1a1a2e] dark:text-white">Sector Allocation</h2>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="relative flex flex-1 items-center justify-center">
            <svg width="180" height="130" viewBox="0 0 180 130">
              <circle cx="90" cy="65" r="62" fill="none" stroke="#f3f4f6" className="dark:stroke-[#1c202e]" strokeWidth="20" />
              <circle cx="90" cy="65" r="42" fill="none" stroke="#f3f4f6" className="dark:stroke-[#1c202e]" strokeWidth="20" />
            </svg>
            <div className="pointer-events-none absolute flex flex-col items-center">
              <span className="text-[15px] text-[#9ca3af] dark:text-[#7c8190]">Sectors</span>
              <span className="text-[22px] font-bold leading-none text-[#1a1a2e] dark:text-white">0</span>
            </div>
          </div>

          <div className="mt-1 w-full space-y-[4px]">
            {beforeSectorData.map((sector, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="h-[12px] w-[12px] shrink-0 rounded-full"
                  style={{ backgroundColor: sector.color }}
                />
                <span className="w-[64px] shrink-0 text-[14px] text-[#374151] dark:text-[#b0b5bf]">
                  {sector.name}
                </span>
                <span className="flex-1 border-b border-dotted border-[#d1d5db] dark:border-[#3a3e4e]" />
                <span className="w-[28px] text-right text-[14px] text-[#374151] dark:text-[#b0b5bf]">
                  0%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
