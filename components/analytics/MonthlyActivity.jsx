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
import { getMonthlyActivity } from "../../lib/analyticsApi";
import { useTheme } from "../auth/ThemeProvider";

const plotLeft = 82;
const plotTop = 38;
const plotWidth = 1177;
const plotHeight = 309;

const verticalPoints = Array.from(
  { length: 7 },
  (_, i) => plotLeft + (plotWidth / 6) * i,
);

const horizontalPoints = Array.from(
  { length: 5 },
  (_, i) => plotTop + (plotHeight / 4) * i,
);

function formatRightAxis(value) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
}

export default function MonthlyActivity() {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMonthlyActivity()
      .then((res) => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : null;
        if (!cancelled && list && list.length > 0) {
          const mapped = list.map((item) => ({
            month: item.month || "Unknown",
            presales: item.presalesCount || item.presales || 0,
            funding: item.fundingGoal || item.funding || 0,
          }));
          setData(mapped);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = data && data.length > 0 ? data : [];

  return (
    <div className="relative h-[490px] w-full rounded-[20px] border border-[#e5e7eb] dark:border-[#2a2e3e] bg-white dark:bg-[#181c28] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] dark:shadow-[0px_4px_24px_rgba(0,0,0,0.3)]">
      <h2 className="absolute left-[45.5px] top-[47px] text-[16px] font-semibold leading-[20px] text-[#111827] dark:text-white">
        Monthly Activity
      </h2>

      <div className="absolute bottom-0 left-0 h-[385px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: plotTop, right: 0, bottom: 0, left: 0 }}
            barCategoryGap="30%"
          >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#242838" : "#F3F4F6"}
                horizontalPoints={horizontalPoints}
                verticalPoints={verticalPoints}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? "#7c8190" : "#9ca3af", fontSize: 11 }}
                height={38}
                dy={6}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? "#7c8190" : "#9ca3af", fontSize: 11 }}
                domain={[0, "auto"]}
                width={plotLeft}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? "#7c8190" : "#9ca3af", fontSize: 11 }}
                domain={[0, "auto"]}
                tickFormatter={formatRightAxis}
                width={82}
              />
              <Tooltip
                formatter={(value, name) => [
                  name === "funding" ? `₹${Number(value).toLocaleString("en-IN")}` : value,
                  name === "funding" ? "Funding Goal" : "Presales Count",
                ]}
                cursor={{ fill: isDark ? "rgba(79, 70, 229, 0.12)" : "rgba(79, 70, 229, 0.06)" }}
                contentStyle={{
                  backgroundColor: isDark ? "#181c28" : "#ffffff",
                  border: isDark ? "1px solid #2a2e3e" : "1px solid #f0f0f0",
                  borderRadius: "10px",
                  boxShadow: isDark ? "0 4px 24px rgba(0, 0, 0, 0.4)" : "0 4px 24px rgba(0, 0, 0, 0.06)",
                  padding: "10px 14px",
                  whiteSpace: "nowrap",
                }}
                labelStyle={{ color: isDark ? "#9ca3af" : "#6b7280", fontSize: 14 }}
                itemStyle={{ color: isDark ? "#ffffff" : "#1a1a2e", fontSize: 15 }}
              />
            <Bar
              yAxisId="left"
              dataKey="presales"
              fill="#4f46e5"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              yAxisId="right"
              dataKey="funding"
              fill="#7a49e8"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
