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
    <div className="w-full rounded-2xl border border-slate-200/90 bg-white dark:border-white/[0.12] dark:bg-[#151824] shadow-sm transition-colors">
      <div className="px-6 sm:px-8 pb-6 pt-6">
        <h2 className="text-[17px] font-semibold leading-none text-slate-900 dark:text-white transition-colors">
          AI Recommendations
        </h2>

        <div className="mt-5 overflow-x-auto" data-lenis-prevent>
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[50px_1fr_1.2fr_1fr_1fr_1fr_0.8fr] items-center text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94a3b8]">
              <div />
              <span>Company</span>
              <span>Sector</span>
              <span>Invested</span>
              <span>Current Value</span>
              <span>Gain/Loss</span>
              <span>ROI</span>
            </div>

            <div className="mt-3 border-t border-slate-100 dark:border-white/[0.06]" />

            {loading ? (
              <div className="flex h-[120px] items-center justify-center text-[13px] text-slate-400 dark:text-[#94a3b8]">
                Loading...
              </div>
            ) : rows.length === 0 ? (
              <div className="flex h-[120px] items-center justify-center text-[13px] text-slate-400 dark:text-[#94a3b8]">
                No investment data available
              </div>
            ) : (
              rows.map((row, index) => (
                <div key={row.initial + index}>
                  <div className="grid grid-cols-[50px_1fr_1.2fr_1fr_1fr_1fr_0.8fr] h-[48px] items-center">
                    <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-[14px] font-semibold text-slate-800 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white transition-colors">
                      {row.initial}
                    </div>

                    <span className="text-[13.5px] font-semibold text-slate-900 dark:text-white transition-colors">
                      {row.name}
                    </span>

                    <span className="text-[13px] text-slate-500 dark:text-[#94a3b8]">{row.sector}</span>

                    <span className="text-[13px] text-slate-800 dark:text-white font-mono">{row.invested}</span>

                    <span className="text-[13px] text-slate-800 dark:text-white font-mono">
                      {row.currentValue}
                    </span>

                    <span
                      className={`text-[13px] font-mono font-medium ${
                        row.gainPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {row.gainLoss}
                    </span>

                    <span
                      className={`text-[13px] font-mono font-medium ${
                        row.roiPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {row.roi}
                    </span>
                  </div>

                  {index < rows.length - 1 && (
                    <div className="border-t border-slate-100 dark:border-white/[0.06]" />
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
