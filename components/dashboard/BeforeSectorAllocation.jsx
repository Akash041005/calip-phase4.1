"use client";

import { beforeSectorData } from "./beforeMockData";

export default function BeforeSectorAllocation() {
  return (
    <div className="h-[340px] w-full rounded-2xl border border-white/[0.08] bg-[#111318] shadow-sm">
      <div className="flex h-full flex-col p-[24px]">
        <h2 className="text-[17px] font-semibold text-white">Sector Allocation</h2>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="relative flex flex-1 items-center justify-center">
            <svg width="180" height="130" viewBox="0 0 180 130">
              <circle cx="90" cy="65" r="62" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="20" />
              <circle cx="90" cy="65" r="42" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="20" />
            </svg>
            <div className="pointer-events-none absolute flex flex-col items-center">
              <span className="text-[12px] text-[#94a3b8]">Sectors</span>
              <span className="text-[22px] font-bold leading-none text-white font-mono">0</span>
            </div>
          </div>

          <div className="mt-1 w-full space-y-[4px]">
            {beforeSectorData.map((sector, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="h-[10px] w-[10px] shrink-0 rounded-full"
                  style={{ backgroundColor: sector.color }}
                />
                <span className="w-[64px] shrink-0 text-[13px] text-[#94a3b8]">
                  {sector.name}
                </span>
                <span className="flex-1 border-b border-dotted border-white/[0.08]" />
                <span className="w-[28px] text-right text-[13px] font-medium text-white font-mono">
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
