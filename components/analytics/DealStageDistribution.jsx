"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { getDealStages } from "../../lib/analyticsApi";

const STAGE_PALETTE = ["#38bdf8", "#10b981", "#f59e0b", "#64748b", "#06b6d4", "#a855f7", "#ec4899", "#8b5cf6"];

export default function DealStageDistribution() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getDealStages()
      .then((res) => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : null;
        if (!cancelled) {
          if (list && list.length > 0) {
            const total = list.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
            const mapped = list.map((item, idx) => ({
              name: item.stage || item.name || "Other",
              value: total > 0 ? Math.round(((Number(item.count) || 0) / total) * 100) : 0,
              color: STAGE_PALETTE[idx % STAGE_PALETTE.length],
            }));
            setData(mapped);
          } else {
            setData([]);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = data || [];

  return (
    <div className="relative w-full min-w-0 xl:max-w-[460px] rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#111318] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-800 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white transition-colors">
              <PieIcon className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-[16px] font-bold text-slate-900 dark:text-white transition-colors">
              Deal Stage Distribution
            </h2>
          </div>
          <p className="mt-1 text-[12px] text-slate-500 dark:text-[#94a3b8] transition-colors">
            Allocation across fundraising rounds
          </p>
        </div>

        <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-800 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white transition-colors">
          {chartData.length} Stages
        </span>
      </div>

      {/* Donut & Legend */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-6 min-h-[220px]">
        {loading ? (
          <div className="flex items-center justify-center text-[12.5px] text-slate-400 dark:text-[#94a3b8]">
            Loading deal stages…
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-[#94a3b8]">
            <PieIcon className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300">No deal stages registered</p>
            <p className="text-[11.5px] max-w-xs mt-1 text-slate-500 dark:text-slate-400">
              Stages will display here as companies onboard through the founder portal.
            </p>
          </div>
        ) : (
          <>
            <div className="relative h-[200px] w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="65%"
                    outerRadius="92%"
                    paddingAngle={3}
                    stroke="transparent"
                    strokeWidth={2}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const item = payload[0];
                      return (
                        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-xl dark:border-white/10 dark:bg-[#111318] transition-colors">
                          <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{item.name}</p>
                          <p className="font-mono text-[13px] font-bold text-slate-900 dark:text-white">
                            {item.value}% <span className="text-[11px] font-normal text-slate-500 font-sans">Share</span>
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Donut Center Label */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-[22px] font-bold text-slate-900 dark:text-white transition-colors">100%</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-[#737d91] transition-colors">Pipeline</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="flex flex-col gap-2.5 w-full sm:w-auto max-h-[220px] overflow-y-auto pr-2">
              {chartData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between sm:justify-start sm:gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}80` }}
                    />
                    <span className="text-[12.5px] font-medium text-slate-700 dark:text-[#cbd5e1] transition-colors">
                      {entry.name}
                    </span>
                  </div>
                  <span className="font-mono text-[12px] font-bold text-slate-900 dark:text-white sm:ml-auto transition-colors">
                    {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
