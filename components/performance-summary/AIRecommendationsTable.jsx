"use client";

import { useState, useEffect } from "react";
import { getParticipationHistory } from "../../lib/participationApi";

export default function AIRecommendationsTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParticipationHistory()
      .then((data) => {
        const records = Array.isArray(data) ? data : data?.investments || [];
        setRows(
          records.map((inv) => {
            const invested = inv.amount || 0;
            const current = inv.currentValue || invested;
            const gainLoss = current - invested;
            const roi = invested > 0 ? ((gainLoss / invested) * 100).toFixed(1) : "0.0";
            const name = inv.startupId?.startupName || inv.startupName || "Unknown";
            return {
              initial: name[0].toUpperCase(),
              name,
              sector: inv.startupId?.industrySector || inv.industrySector || "N/A",
              invested: "₹" + invested.toLocaleString("en-IN"),
              currentValue: "₹" + current.toLocaleString("en-IN"),
              gainLoss: gainLoss >= 0 ? "+₹" + gainLoss.toLocaleString("en-IN") : "-₹" + Math.abs(gainLoss).toLocaleString("en-IN"),
              gainPositive: gainLoss >= 0,
              roi: (gainLoss >= 0 ? "+" : "") + roi + "%",
              roiPositive: parseFloat(roi) >= 0,
            };
          })
        );
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full rounded-[14px] border border-[#f0f0f0] dark:border-[#2a2e3e] bg-white dark:bg-[#181c28] shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="px-[36px] pb-[16px] pt-[24px]">
        <h2 className="text-[18px] font-semibold leading-none text-[#1a1a2e] dark:text-white">
          AI Recommendations
        </h2>

        <div className="mt-[24px] overflow-x-auto" data-lenis-prevent>
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[50px_1fr_1.2fr_1fr_1fr_1fr_0.8fr] items-center">
              <div />
              <span className="text-[13px] leading-none text-[#9ca3af] dark:text-[#7c8190]">Company</span>
              <span className="text-[13px] leading-none text-[#9ca3af] dark:text-[#7c8190]">Sector</span>
              <span className="text-[13px] leading-none text-[#9ca3af] dark:text-[#7c8190]">Invested</span>
              <span className="text-[13px] leading-none text-[#9ca3af] dark:text-[#7c8190]">Current Value</span>
              <span className="text-[13px] leading-none text-[#9ca3af] dark:text-[#7c8190]">Gain/Loss</span>
              <span className="text-[13px] leading-none text-[#9ca3af] dark:text-[#7c8190]">ROI</span>
            </div>

            <div className="mt-[8px] border-t border-[#e5e7eb] dark:border-[#2a2e3e]" />

            {loading ? (
              <div className="flex h-[120px] items-center justify-center text-[13px] text-[#9ca3af] dark:text-[#7c8190]">
                Loading...
              </div>
            ) : rows.length === 0 ? (
              <div className="flex h-[120px] items-center justify-center text-[13px] text-[#9ca3af] dark:text-[#7c8190]">
                No investment data available
              </div>
            ) : (
              rows.map((row, index) => (
                <div key={row.initial + index}>
                  <div className="grid grid-cols-[50px_1fr_1.2fr_1fr_1fr_1fr_0.8fr] h-[44px] items-center">
                    <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-[#eef2ff] text-[16px] font-semibold text-[#6366f1] dark:bg-[#1c202e] dark:text-[#818cf8]">
                      {row.initial}
                    </div>

                    <span className="text-[14px] font-semibold text-[#1a1a2e] dark:text-white">
                      {row.name}
                    </span>

                    <span className="text-[13px] text-[#374151] dark:text-[#b0b5bf]">{row.sector}</span>

                    <span className="text-[14px] text-[#1a1a2e] dark:text-white">{row.invested}</span>

                    <span className="text-[14px] text-[#1a1a2e] dark:text-white">
                      {row.currentValue}
                    </span>

                    <span
                      className={`text-[14px] ${
                        row.gainPositive ? "text-[#10b981]" : "text-[#ef4444]"
                      }`}
                    >
                      {row.gainLoss}
                    </span>

                    <span
                      className={`text-[14px] ${
                        row.roiPositive ? "text-[#10b981]" : "text-[#ef4444]"
                      }`}
                    >
                      {row.roi}
                    </span>
                  </div>

                  {index < rows.length - 1 && (
                    <div className="mt-[12px] mb-[10px] border-t border-[#e5e7eb] dark:border-[#2a2e3e]" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
