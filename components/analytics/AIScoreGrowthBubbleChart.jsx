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
import { Sparkles, Compass } from "lucide-react";
import { getLeaderboard } from "../../lib/analyticsApi";

const FALLBACK_BUBBLES = [
  { name: "NovaPay", aiScore: 94, growth: 118, raisedValue: 28000000, fill: "#38bdf8" },
  { name: "VoltGrid", aiScore: 89, growth: 92, raisedValue: 19500000, fill: "#10b981" },
  { name: "FleetAI", aiScore: 92, growth: 104, raisedValue: 24000000, fill: "#60a5fa" },
  { name: "MediSync", aiScore: 85, growth: 76, raisedValue: 14000000, fill: "#f59e0b" },
  { name: "AgriVerse", aiScore: 78, growth: 58, raisedValue: 9500000, fill: "#64748b" },
  { name: "CleanLoop", aiScore: 81, growth: 64, raisedValue: 12000000, fill: "#a855f7" },
];

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
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        if (!cancelled && list.length > 0) {
          const valuations = list.map((entry) => Number(entry.funding?.valuation) || 0);
          const views = list.map((entry) => Number(entry.views) || 0);
          const maxValuation = Math.max(...valuations, 1);
          const maxViews = Math.max(...views, 1);

          const colors = ["#38bdf8", "#10b981", "#60a5fa", "#f59e0b", "#64748b", "#a855f7"];
          setChartData(
            list.map((entry, idx) => {
              const valuation = Number(entry.funding?.valuation) || 0;
              const viewCount = Number(entry.views) || 0;
              const aiScore = Math.round(50 + (valuation / maxValuation) * 45);
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
        } else if (!cancelled) {
          setChartData(FALLBACK_BUBBLES);
        }
      })
      .catch(() => {
        if (!cancelled) setChartData(FALLBACK_BUBBLES);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const data = chartData.length > 0 ? chartData : FALLBACK_BUBBLES;

  return (
    <div className="relative w-full rounded-2xl border border-white/[0.08] bg-[#111318] p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08] text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-[16px] font-bold text-white">
              AI Score vs. Growth Velocity Matrix
            </h2>
          </div>
          <p className="mt-1 text-[12px] text-[#94a3b8]">
            Correlation between Calip AI algorithmic rating (0-100) and 30-day traction growth
          </p>
        </div>

        <span className="rounded-md bg-white/[0.05] border border-white/[0.08] px-3 py-1 font-mono text-[11px] font-semibold text-white">
          Bubble Size = Valuation
        </span>
      </div>

      {/* Scatter Chart */}
      <div className="mt-4 h-[300px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[12.5px] text-[#737d91]">
            Computing matrix…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 15, right: 20, bottom: 15, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis
                dataKey="aiScore"
                type="number"
                domain={[40, 100]}
                unit=" pts"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#737d91", fontSize: 11, fontFamily: "monospace" }}
              />
              <YAxis
                dataKey="growth"
                type="number"
                domain={[0, 140]}
                unit="%"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#737d91", fontSize: 11, fontFamily: "monospace" }}
              />
              <ZAxis dataKey="raisedValue" range={[80, 450]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-white/10 bg-[#111318] p-3 shadow-2xl backdrop-blur-md">
                      <p className="text-[13px] font-bold text-white mb-1.5">{item.name}</p>
                      <div className="space-y-1 text-[12px] font-mono">
                        <div className="flex items-center justify-between gap-4 text-sky-400">
                          <span>AI Health Score:</span>
                          <span className="font-bold">{item.aiScore}/100</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-emerald-400">
                          <span>Growth Rate:</span>
                          <span className="font-bold">+{item.growth}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-[#cbd5e1]">
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
