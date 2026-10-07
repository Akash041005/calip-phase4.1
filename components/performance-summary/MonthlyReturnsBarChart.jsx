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
    <div className="h-[340px] w-full rounded-[14px] border border-[#f0f0f0] dark:border-[#2a2e3e] bg-white dark:bg-[#181c28] shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex h-full flex-col p-[24px]">
        <div>
          <h2 className="text-[18px] font-semibold text-[#1a1a2e] dark:text-white">
            Monthly Investment Activity
          </h2>
          <p className="mt-[2px] text-[13px] text-[#9ca3af] dark:text-[#7c8190]">
            Confirmed participation amounts by month
          </p>
        </div>

        <div className="mt-[14px] min-h-0 flex-1">
          {loading ? (
            <div className="flex h-full items-center justify-center text-[13px] text-[#9ca3af] dark:text-[#7c8190]">
              Loading...
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4 text-center text-[13px] text-[#9ca3af] dark:text-[#7c8190]">
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
                  stroke={dark ? "#2a2e3e" : "#e5e7eb"}
                  vertical={false}
                  horizontal
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: dark ? "#7c8190" : "#9ca3af", fontSize: 13 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: dark ? "#7c8190" : "#9ca3af", fontSize: 13 }}
                  tickFormatter={formatYAxis}
                  domain={[0, maxValue]}
                  ticks={ticks}
                  width={38}
                />
                <Bar
                  dataKey="value"
                  name="Invested Amount"
                  fill="#6366f1"
                  radius={[0, 0, 0, 0]}
                  barSize={30}
                />
                <Tooltip
                  formatter={(value) => `₹ ${Number(value).toLocaleString("en-IN")}`}
                  cursor={{ fill: dark ? "#1c202e" : "#eef2ff" }}
                  contentStyle={{
                    backgroundColor: dark ? "#181c28" : "#ffffff",
                    border: `1px solid ${dark ? "#2a2e3e" : "#f0f0f0"}`,
                    borderRadius: "10px",
                    boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
                    padding: "8px 12px",
                    whiteSpace: "nowrap",
                  }}
                  labelStyle={{ color: dark ? "#9ca3af" : "#6b7280", fontSize: 13 }}
                  itemStyle={{ color: dark ? "#ffffff" : "#1a1a2e", fontSize: 13 }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
