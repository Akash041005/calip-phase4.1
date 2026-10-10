"use client";

import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getParticipationHistory } from "../../lib/participationApi";
import { useTheme } from "../auth/ThemeProvider";

function formatYAxis(value) {
  if (value >= 100000) return "₹" + (value / 1000).toFixed(0) + "k";
  return "₹" + value.toLocaleString("en-IN");
}

export default function MonthlyReturnsBarChart() {
  const { isDark } = useTheme();
  const dark = isDark;
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    getParticipationHistory()
      .then((data) => {
        const records = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.investments)
          ? data.investments
          : [];
        const monthly = {};
        records.forEach((inv) => {
          const dateStr = inv.investedAt || inv.createdAt || inv.date;
          if (!dateStr) return;
          const d = new Date(dateStr);
          if (Number.isNaN(d.getTime())) return;
          const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          monthly[monthKey] = (monthly[monthKey] || 0) + (Number(inv.amount) || 0);
        });

        const result = Object.entries(monthly)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-8)
          .map(([monthKey, value]) => {
            const [year, month] = monthKey.split("-").map(Number);
            return {
              month: new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
              value,
            };
          });

        setChartData(result);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  const maxValue = Math.max(...chartData.map((d) => d.value), 1);
  const ticks = [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue];

  return (
    <div className="h-[340px] w-full rounded-2xl border border-white/[0.08] bg-[#111318] shadow-sm">
      <div className="flex h-full flex-col p-[24px]">
        <div>
          <h2 className="text-[17px] font-semibold text-white">
            Monthly Investment Activity
          </h2>
          <p className="mt-[2px] text-[13px] text-[#94a3b8]">
            Confirmed participation amounts by month
          </p>
        </div>

        <div className="mt-[14px] min-h-0 flex-1">
          {loading ? (
            <div className="flex h-full items-center justify-center text-[13px] text-[#94a3b8]">
              Loading...
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4 text-center text-[13px] text-[#94a3b8]">
              {loadError ? "Investment activity could not be loaded." : "No participation activity is available yet."}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
                barCategoryGap="30%"
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="rgba(255, 255, 255, 0.06)"
                  vertical={false}
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
                  domain={[0, maxValue]}
                  ticks={ticks}
                  width={38}
                />
                <Bar
                  dataKey="value"
                  name="Invested Amount"
                  fill="#ffffff"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Tooltip
                  formatter={(value) => `₹ ${Number(value).toLocaleString("en-IN")}`}
                  cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
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
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
