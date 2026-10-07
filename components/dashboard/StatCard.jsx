"use client";

import {
  BarChart3,
  Bookmark,
  Briefcase,
  TrendingUp,
} from "lucide-react";

const iconMap = {
  briefcase: Briefcase,
  "bar-chart-3": BarChart3,
  "trending-up": TrendingUp,
  bookmark: Bookmark,
};

export default function StatCard({
  label,
  value,
  trend,
  change,
  trendGreen = true,
  positive,
  icon,
}) {
  const IconComponent = iconMap[icon] || Briefcase;
  const displayTrend = trend || change;
  const isTrendGreen = positive !== undefined ? positive : trendGreen;

  const card = (
    <div className="group relative min-h-[108px] h-full w-full rounded-[14px] border border-[#f0f0f0] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:border-[#242838] dark:bg-[#181c28] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-shadow duration-200 hover:border-[#e0e7ff] hover:shadow-[0_8px_30px_rgba(99,102,241,0.12)] dark:hover:border-[#3730a3]">
      <div className="flex h-full flex-col justify-between p-[16px]">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[12px] font-medium uppercase tracking-wide text-[#9ca3af] dark:text-[#7c8190]">
            {label}
          </p>
          <div className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-md bg-[#f3f4f6] dark:bg-[#1c202e] transition-colors group-hover:bg-[#eef2ff] dark:group-hover:bg-[#1e1b4b]">
            <IconComponent className="h-[15px] w-[15px] text-[#374151] dark:text-[#b0b5bf]" strokeWidth={1.5} />
          </div>
        </div>

        <div className="mt-2">
          <p className="text-[20px] sm:text-[22px] font-bold leading-none text-[#1a1a2e] dark:text-white truncate">{value}</p>
          {displayTrend && (
            <div className="mt-[6px] flex items-center gap-1">
              {isTrendGreen && (
                <TrendingUp className="h-[10px] w-[10px] text-[#7c6cf0] dark:text-[#9485f5]" strokeWidth={2} />
              )}
              <span
                className={`text-[12px] sm:text-[13px] font-medium leading-none ${
                  isTrendGreen ? "text-[#7c6cf0] dark:text-[#9485f5]" : "text-[#9ca3af] dark:text-[#7c8190]"
                }`}
              >
                {displayTrend}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return <div className="min-h-[108px] h-full">{card}</div>;
}
