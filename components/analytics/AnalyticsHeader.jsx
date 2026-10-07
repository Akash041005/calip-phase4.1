"use client";

import Link from "next/link";

export default function AnalyticsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:items-start justify-between gap-4">
      <div>
        <h1 className="text-[24px] font-semibold leading-[30px] text-black dark:text-white">
          Analytics
        </h1>
        <p className="mt-[5px] text-[14px] leading-[21px] text-[#4b5563] dark:text-[#9ca3af]">
          Deep-dive analytics: startup comparisons, industry trends, and funding heatmaps.
        </p>
      </div>

      <div className="mt-[16px] flex items-center gap-[10px]">
        <Link
          href="/analytics"
          className="flex h-[34px] w-[110px] items-center justify-center rounded-[12px] bg-[#7a49e8] text-[13px] text-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)]"
        >
          Overview
        </Link>
        <Link
          href="/analytics/comparison"
          className="flex h-[34px] w-[110px] items-center justify-center rounded-[12px] border border-[#e5e7eb] dark:border-[#2a2e3e] bg-white dark:bg-[#181c28] text-[13px] text-[#4b5563] dark:text-[#9ca3af] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)]"
        >
          Comparison
        </Link>
      </div>
    </div>
  );
}