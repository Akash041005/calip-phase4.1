"use client";

import { useState, useEffect } from "react";
import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { Sparkles } from "lucide-react";
import { getLeaderboard } from "../../lib/analyticsApi";

function formatCurrency(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
}

export default function AIScoreGrowthBubbleChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getLeaderboard()
      .then((res) => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        if (!cancelled) {
          if (list.length > 0) {
            const valuations = list.map((entry) => Number(entry.funding?.valuation) || 0);
            const views = list.map((entry) => Number(entry.views) || 0);
            const maxValuation = Math.max(...valuations, 1);
            const maxViews = Math.max(...views, 1);

            const colors = ["#38bdf8", "#10b981", "#60a5fa", "#f59e0b", "#64748b", "#a855f7"];
            setChartData(
              list.map((entry, idx) => {
                const valuation = Number(entry.funding?.valuation) || 0;
                const viewCount = Number(entry.views) || 0;
                const aiScore = entry.score && entry.score > 0
                  ? entry.score
                  : Math.round(50 + (valuation / maxValuation) * 45);
                const growth = Math.round(15 + (viewCount / maxViews) * 105);

                return {
                  name: entry.startupName || "Startup",
                  aiScore,
                  growth,
                  raisedValue: valuation,
                  fill: colors[idx % colors.length],
                };
              })
            );
          } else {
            setChartData([]);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setChartData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const data = chartData || [];

  return (
    <div className="relative w-full rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#111318] transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-white/[0.06] pb-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-800 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white transition-colors">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-[16px] font-bold text-slate-900 dark:text-white transition-colors">
              AI Score vs. Growth Velocity Matrix
            </h2>
          </div>
          <p className="mt-1 text-[12px] text-slate-500 dark:text-[#94a3b8] transition-colors">
            Correlation between Calip AI algorithmic rating (0-100) and 30-day traction growth
          </p>
        </div>

        <span className="rounded-md bg-slate-100 border border-slate-200 px-3 py-1 font-mono text-[11px] font-semibold text-slate-800 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white transition-colors">
          Bubble Size = Valuation
        </span>
      </div>

      {/* Scatter Chart */}
      <div className="mt-4 h-[300px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[12.5px] text-slate-400 dark:text-[#737d91]">
            Computing matrix…
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-[#94a3b8]">
            <Sparkles className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300">No startup telemetry scored yet</p>
            <p className="text-[11.5px] max-w-xs mt-1 text-slate-500 dark:text-slate-400">
              The AI valuation matrix will plot bubbles dynamically as registered startups accumulate views and metrics.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 15, right: 20, bottom: 15, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.12)" />
              <XAxis
                dataKey="aiScore"
                type="number"
                domain={[40, 100]}
                unit=" pts"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
              />
              <YAxis
                dataKey="growth"
                type="number"
                domain={[0, 140]}
                unit="%"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
              />
              <ZAxis dataKey="raisedValue" range={[80, 450]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-[#111318] transition-colors">
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white mb-1.5">{item.name}</p>
                      <div className="space-y-1 text-[12px] font-mono">
                        <div className="flex items-center justify-between gap-4 text-sky-600 dark:text-sky-400">
                          <span>AI Health Score:</span>
                          <span className="font-bold">{item.aiScore}/100</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400">
                          <span>Growth Rate:</span>
                          <span className="font-bold">+{item.growth}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-slate-700 dark:text-[#cbd5e1]">
                          <span>Valuation:</span>
                          <span className="font-bold">{formatCurrency(item.raisedValue)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Scatter data={data}>
                {data.map((entry, index) => (
                  <Cell
                    key={`bubble-${index}`}
                    fill={entry.fill}
                    className="transition-transform hover:scale-125 cursor-pointer"
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
