"use client";

import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getPortfolioHistory } from "../../lib/portfolioApi";

import { useTheme } from "../auth/ThemeProvider";

function formatYAxis(value) {
  const k = Math.round(value / 1000);
  if (value % 1000 === 0) return `$${k}k`;
  return `$${Math.round(value).toLocaleString("en-IN")}`;
}

function formatDateToMonth(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function PortfolioChart() {
  const { isDark } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPortfolioHistory()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (!cancelled) {
          const mapped = list.map((item) => ({
            month: item.month || formatDateToMonth(item.date),
            value: Number(item.investedCumulative ?? item.value),
          })).filter((item) => item.month && Number.isFinite(item.value));
          setData(mapped);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const chartData = data;

  const maxValue = chartData.reduce((max, d) => Math.max(max, Number(d.value) || 0), 0);
  const minValue = chartData.reduce((min, d) => Math.min(min, Number(d.value) || 0), 0);
  const yMax = maxValue > 0 ? Math.ceil(maxValue * 1.15) : 1;
  const yMin = minValue < 0 ? Math.floor(minValue * 1.15) : 0;
  const yTicks = [yMin, yMin + (yMax - yMin) / 4, yMin + (yMax - yMin) / 2, yMin + ((yMax - yMin) * 3) / 4, yMax];

  return (
    <div className="h-[340px] w-full rounded-[14px] border border-[#f0f0f0] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:border-[#242838] dark:bg-[#181c28] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex h-full flex-col p-[20px] sm:p-[24px]">
        <div className="mb-1">
          <h2 className="text-[18px] font-semibold text-[#1a1a2e] dark:text-white">Net Invested Capital</h2>
          <p className="mt-[2px] text-[13px] text-[#9ca3af] dark:text-[#7c8190]">Cumulative confirmed buys minus sells</p>
        </div>

        <div className="min-h-0 flex-1">
          {loading ? (
            <div className="flex h-full items-center justify-center text-[13px] text-[#9ca3af] dark:text-[#7c8190]">
              Loading investment history...
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4 text-center text-[13px] text-[#9ca3af] dark:text-[#7c8190]">
              {error ? "Investment history could not be loaded." : "No investment transactions are available yet."}
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={isDark ? 0.35 : 0.25} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke={isDark ? "#242838" : "#e5e7eb"}
                vertical
                horizontal
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? "#7c8190" : "#9ca3af", fontSize: 12 }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? "#7c8190" : "#9ca3af", fontSize: 12 }}
                tickFormatter={formatYAxis}
                domain={[yMin, yMax]}
                ticks={yTicks}
                width={44}
              />
              <Area
                type="monotone"
                dataKey="value"
                name="Net Invested Capital"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#portfolioGradient)"
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, fill: "#6366f1", stroke: isDark ? "#181c28" : "#ffffff", strokeWidth: 2 }}
              />
              <Tooltip
                formatter={(value) => `$ ${Number(value).toLocaleString("en-IN")}`}
                cursor={{ stroke: isDark ? "#4338ca" : "#c7d2fe", strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: isDark ? "#181c28" : "#ffffff",
                  border: isDark ? "1px solid #2a2e3e" : "1px solid #f0f0f0",
                  borderRadius: "10px",
                  boxShadow: isDark ? "0 4px 24px rgba(0, 0, 0, 0.4)" : "0 4px 24px rgba(0, 0, 0, 0.06)",
                  padding: "8px 12px",
                  whiteSpace: "nowrap",
                }}
                labelStyle={{ color: isDark ? "#9ca3af" : "#6b7280", fontSize: 13 }}
                itemStyle={{ color: isDark ? "#ffffff" : "#1a1a2e", fontSize: 13 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
