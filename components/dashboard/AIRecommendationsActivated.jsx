"use client";

import { useEffect, useState } from "react";
import { getPortfolioRecommendations } from "../../lib/portfolioApi";

export default function AIRecommendationsActivated() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getPortfolioRecommendations()
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : null;
        if (!cancelled && list && list.length > 0) {
          setItems(
            list.map((item) => ({
              initial: (
                item.startupName || item.title || "?"
              ).charAt(0).toUpperCase(),
              title: item.startupName || item.title || "Company",
              category: item.industrySector || item.category || "Startup",
              score: item.aiScore || item.score || "--",
            }))
          );
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-[260px] w-full rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-white/[0.12] dark:bg-[#151824] transition-colors">
      <div className="flex h-full flex-col p-[24px]">
        <h2 className="text-[17px] font-semibold text-slate-900 dark:text-white transition-colors">AI Recommendations</h2>

        <div className="mt-[8px] grid flex-1 grid-cols-2 gap-[8px] sm:grid-cols-1">
          {items.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="flex min-h-[118px] flex-col items-start justify-between gap-2 rounded-xl bg-slate-50 border border-slate-200 p-3 sm:h-[46px] sm:min-h-0 sm:flex-row sm:items-center sm:gap-3 sm:px-3 sm:py-0 dark:bg-[#0e1015] dark:border-white/[0.06] transition-colors"
            >
              <div className="flex w-full min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-slate-200/70 border border-slate-300 text-[13px] font-semibold text-slate-900 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white transition-colors">
                  {item.initial}
                </div>
                <div className="w-full min-w-0">
                  <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-[#94a3b8]">{item.category}</p>
                </div>
              </div>
              <span className="text-[13px] font-semibold text-slate-900 dark:text-white font-mono">{item.score}</span>
            </div>
          ))}
          {items.length === 0 && (
            <p className="col-span-2 py-8 text-center text-[13px] text-slate-500 dark:text-[#94a3b8] sm:col-span-1">
              No recommendations available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
