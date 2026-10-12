"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, TrendingUp } from "lucide-react";
import { getMonthlyActivity } from "../../lib/analyticsApi";

const FALLBACK_MONTHS = [
  { month: "Nov", presales: 6, funding: 18000000 },
  { month: "Dec", presales: 9, funding: 27500000 },
  { month: "Jan", presales: 14, funding: 42000000 },
  { month: "Feb", presales: 18, funding: 56000000 },
  { month: "Mar", presales: 22, funding: 71000000 },
  { month: "Apr", presales: 29, funding: 94000000 },
];

function formatCurrency(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
}

export default function MonthlyActivity() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMonthlyActivity()
      .then((res) => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : null;
        if (!cancelled && list && list.length > 0) {
          const mapped = list.map((item) => ({
            month: item.month || "Unknown",
            presales: Number(item.presalesCount || item.presales || 0),
            funding: Number(item.fundingGoal || item.funding || 0),
          }));
          setData(mapped);
        } else if (!cancelled) {
          setData(FALLBACK_MONTHS);
        }
      })
      .catch(() => {
        if (!cancelled) setData(FALLBACK_MONTHS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = data && data.length > 0 ? data : FALLBACK_MONTHS;

  return (
    <div className="relative w-full rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#111318] transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-white/[0.06] pb-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-800 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white transition-colors">
              <Activity className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-[16px] font-bold text-slate-900 dark:text-white transition-colors">
              Monthly Activity & Capital Trajectory
            </h2>
          </div>
          <p className="mt-1 text-[12px] text-slate-500 dark:text-[#94a3b8] transition-colors">
            Number of rounds launched vs. target capital volume over time
          </p>
        </div>

        {/* Legend Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-[#94a3b8] transition-colors">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Presales</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-[#94a3b8] transition-colors">
            <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-zinc-400" />
            <span>Target Volume</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-4 h-[300px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[12.5px] text-slate-400 dark:text-[#94a3b8]">
            Loading activity stream…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, bottom: 5, left: -10 }}
              barCategoryGap="25%"
            >
              <defs>
                <linearGradient id="presalesBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="fundingBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#64748b" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(100, 116, 139, 0.12)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                dy={6}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCurrency}
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-[#111318] transition-colors">
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white mb-2">{label} Trajectory</p>
                      <div className="space-y-1 text-[12px] font-mono">
                        <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400">
                          <span>Rounds:</span>
                          <span className="font-bold">{payload[0]?.value} presales</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-sky-600 dark:text-sky-400">
                          <span>Volume:</span>
                          <span className="font-bold">{formatCurrency(payload[1]?.value)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="presales"
                fill="url(#presalesBarGradient)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="funding"
                fill="url(#fundingBarGradient)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
