"use client";

import { useState, useEffect } from "react";
import { getLeaderboard } from "../../lib/analyticsApi";

const headers = [
  "Company",
  "Sector",
  "Stage",
  "AI Score",
  "Sentiment",
  "Valuation",
  "Raised",
];

const gridColumns =
  "235.99px 198.175px 123.263px 127.15px 124.238px 144.512px 107.475px";

const avatarColors = [
  { bg: "#eef2ff", color: "#6366f1" },
  { bg: "#ecfdf5", color: "#10b981" },
  { bg: "#fef3c7", color: "#f59e0b" },
  { bg: "#fce7f3", color: "#ec4899" },
  { bg: "#e0e7ff", color: "#4f46e5" },
  { bg: "#d1fae5", color: "#059669" },
  { bg: "#fde68a", color: "#d97706" },
  { bg: "#fbcfe8", color: "#db2777" },
];

function formatCurrency(val) {
  if (val == null || isNaN(Number(val))) return "N/A";
  const num = Number(val);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

export default function StartupComparisonTable() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then((res) => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setCompanies(
          list.map((entry, idx) => ({
            name: entry.startupName || "Unknown",
            initial: (entry.startupName || "?")[0].toUpperCase(),
            ...avatarColors[idx % avatarColors.length],
            sector: entry.industrySector || entry.category || "N/A",
            stage: entry.startupStage || entry.stage || "N/A",
            aiScore: entry.score != null && entry.score > 0 ? entry.score : 85,
            sentiment: entry.sentiment || "positive",
            valuation: formatCurrency(entry.funding?.valuation || entry.currentStartupValuation),
            raised: formatCurrency(entry.funding?.raised || 0),
          }))
        );
      })
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-auto min-h-[410px] w-full flex-col items-start rounded-[16px] border border-[#e5e7eb] dark:border-[#2a2e3e] bg-white dark:bg-[#181c28] p-[24.8px] shadow-[0px_1px_1.5px_rgba(0,0,0,0.08),0px_1px_1px_rgba(0,0,0,0.04)] dark:shadow-[0px_4px_24px_rgba(0,0,0,0.3)]">
      <h3 className="text-[15px] font-semibold leading-[22.5px] text-[#111827] dark:text-white">
        Startup Comparison
      </h3>

      <div className="h-auto w-full overflow-x-auto" data-lenis-prevent>
        <div
          className={`mt-[16px] grid h-[32.9px] min-w-[700px] items-center border-b-[0.8px] border-[#e5e7eb] dark:border-[#2a2e3e]`}
          style={{ gridTemplateColumns: gridColumns }}
        >
          {headers.map((header) => (
            <div
              key={header}
              className="pl-[12px] text-[11px] font-semibold uppercase leading-[16.5px] tracking-[0.4px] text-[#9ca3af] dark:text-[#7c8190]"
            >
              {header}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex h-[280px] items-center justify-center text-[13px] text-[#9ca3af] dark:text-[#7c8190]">
            Loading...
          </div>
        ) : companies.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-[13px] text-[#9ca3af] dark:text-[#7c8190]">
            No data available
          </div>
        ) : (
          companies.map((c, index) => (
            <div
              key={`${c.name}-${index}`}
              className="grid h-[46.8px] min-w-[700px] items-center border-b-[0.8px] border-[#f3f4f6] dark:border-[#2a2e3e]"
              style={{ gridTemplateColumns: gridColumns }}
            >
              <div className="flex items-center gap-[8px] pl-[12px]">
                <div
                  className="flex size-[26px] items-center justify-center rounded-[6px]"
                  style={{ backgroundColor: c.bg }}
                >
                  <span
                    className="text-[11px] font-bold leading-[16.5px]"
                    style={{ color: c.color }}
                  >
                    {c.initial}
                  </span>
                </div>
                <span className="truncate text-[13px] font-semibold leading-[19.5px] text-[#111827] dark:text-white">
                  {c.name}
                </span>
              </div>

              <div className="truncate pl-[12px] text-[12px] font-medium leading-[18px] text-[#4b5563] dark:text-[#9ca3af]">
                {c.sector}
              </div>

              <div className="truncate pl-[12px] text-[12px] leading-[18px] text-[#4b5563] dark:text-[#9ca3af]">
                {c.stage}
              </div>

              <div className="pl-[12px] text-[12px] font-semibold leading-[18px] text-[#6366f1]">
                {c.aiScore}
              </div>

              <div className="pl-[12px] text-[12px] capitalize font-medium leading-[18px] text-[#10b981]">
                {c.sentiment}
              </div>

              <div className="pl-[12px] text-[12px] font-semibold leading-[18px] text-[#111827] dark:text-white">
                {c.valuation}
              </div>

              <div className="pl-[12px] text-[12px] leading-[18px] text-[#4b5563] dark:text-[#9ca3af]">
                {c.raised}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
