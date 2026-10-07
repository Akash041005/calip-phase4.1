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
    <div className="min-h-[260px] w-full rounded-[14px] border border-[#f0f0f0] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:border-[#242838] dark:bg-[#181c28] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex h-full flex-col p-[24px]">
        <h2 className="text-[18px] font-semibold text-[#1a1a2e] dark:text-white">AI Recommendations</h2>

        <div className="mt-[8px] grid flex-1 grid-cols-2 gap-[8px] sm:grid-cols-1">
          {items.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="flex min-h-[118px] flex-col items-start justify-between gap-2 rounded-lg bg-[#f9fafb] dark:bg-[#1c202e] p-3 sm:h-[46px] sm:min-h-0 sm:flex-row sm:items-center sm:gap-3 sm:px-3 sm:py-0"
            >
              <div className="flex w-full min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#eef2ff] dark:bg-[#1e1b4b] text-[15px] font-semibold text-[#6366f1] dark:text-[#818cf8]">
                  {item.initial}
                </div>
                <div className="w-full min-w-0">
                  <p className="truncate text-[14px] font-semibold text-[#1a1a2e] dark:text-white">{item.title}</p>
                  <p className="truncate text-[12px] text-[#9ca3af] dark:text-[#7c8190]">{item.category}</p>
                </div>
              </div>
              <span className="text-[14px] font-semibold text-[#1a1a2e] dark:text-white">{item.score}</span>
            </div>
          ))}
          {items.length === 0 && (
            <p className="col-span-2 py-8 text-center text-[13px] text-[#9ca3af] sm:col-span-1">
              No recommendations available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
