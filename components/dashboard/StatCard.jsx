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
    <div className="group relative min-h-[108px] h-full w-full rounded-2xl border border-white/[0.08] bg-[#111318] shadow-sm transition-all duration-200 hover:border-white/[0.16]">
      <div className="flex h-full flex-col justify-between p-[18px]">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
            {label}
          </p>
          <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08] text-white">
            <IconComponent className="h-[14px] w-[14px]" strokeWidth={1.8} />
          </div>
        </div>

        <div className="mt-2">
          <p className="text-[22px] font-bold leading-none text-white font-mono truncate">{value}</p>
          {displayTrend && (
            <div className="mt-[8px] flex items-center gap-1.5">
              {isTrendGreen && (
                <TrendingUp className="h-[12px] w-[12px] text-emerald-400" strokeWidth={2.5} />
              )}
              <span
                className={`text-[12px] font-medium leading-none ${
                  isTrendGreen ? "text-emerald-400" : "text-[#94a3b8]"
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
