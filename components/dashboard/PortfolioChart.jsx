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
    <div className="h-[340px] w-full rounded-2xl border border-white/[0.08] bg-[#111318] shadow-sm">
      <div className="flex h-full flex-col p-[20px] sm:p-[24px]">
        <div className="mb-1">
          <h2 className="text-[17px] font-semibold text-white">Net Invested Capital</h2>
          <p className="mt-[2px] text-[13px] text-[#94a3b8]">Cumulative confirmed buys minus sells</p>
        </div>

        <div className="min-h-0 flex-1">
          {loading ? (
            <div className="flex h-full items-center justify-center text-[13px] text-[#94a3b8]">
              Loading investment history...
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4 text-center text-[13px] text-[#94a3b8]">
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
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="rgba(255, 255, 255, 0.06)"
                vertical
                horizontal
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={formatYAxis}
                domain={[yMin, yMax]}
                ticks={yTicks}
                width={44}
              />
              <Area
                type="monotone"
                dataKey="value"
                name="Net Invested Capital"
                stroke="#ffffff"
                strokeWidth={2}
                fill="url(#portfolioGradient)"
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, fill: "#ffffff", stroke: "#111318", strokeWidth: 2 }}
              />
              <Tooltip
                formatter={(value) => `$ ${Number(value).toLocaleString("en-IN")}`}
                cursor={{ stroke: "rgba(255, 255, 255, 0.2)", strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: "#111318",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "10px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
                  padding: "8px 12px",
                  whiteSpace: "nowrap",
                }}
                labelStyle={{ color: "#94a3b8", fontSize: 13 }}
                itemStyle={{ color: "#ffffff", fontSize: 13 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
