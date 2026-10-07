"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "../auth/ThemeProvider";

function formatYAxis(value) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${Math.round(value / 1000)}k`;
  return `₹${value}`;
}

export default function RevenueForecast({ data }) {
  const { isDark } = useTheme();
  const forecast =
    Array.isArray(data?.revenueForecast) && data.revenueForecast.length > 0
      ? data.revenueForecast
      : [];
  const maxValue = forecast.reduce((m, d) => Math.max(m, Number(d.value) || 0), 0);
  const yMax = maxValue > 0 ? Math.ceil(maxValue * 1.15) : 22000;
  const yTicks = [0, yMax / 4, yMax / 2, (yMax * 3) / 4, yMax];

  return (
    <div className="h-[375px] w-full flex-1 rounded-[20px] border border-[#e5e7eb] bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)] dark:border-[#2a2e3e] dark:bg-[#181c28]">
      <div className="flex h-full flex-col pl-[27px] pr-[15px] pt-[26px] pb-[20px]">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold leading-[20px] text-[#111827] dark:text-white">
            Revenue Forecast
          </h2>
          <span className="text-[12px] text-[#6b7280] dark:text-[#9ca3af]">AI Projection</span>
        </div>

        <div className="mt-[20px] min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={forecast}
              margin={{ top: 15, right: 5, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#242838" : "#EEEEEE"}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? "#7c8190" : "#9ca3af", fontSize: 12 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? "#7c8190" : "#9ca3af", fontSize: 12 }}
                tickFormatter={formatYAxis}
                domain={[0, yMax]}
                ticks={yTicks}
                width={50}
              />
              <Tooltip
                formatter={(value) => [
                  `₹ ${Number(value).toLocaleString("en-IN")}`,
                  "Revenue",
                ]}
                cursor={{ stroke: isDark ? "#4338ca" : "#c7d2fe", strokeDasharray: "4 4" }}
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
              <Area
                type="monotone"
                dataKey="value"
                name="Revenue"
                stroke="#4F46E5"
                strokeWidth={2}
                fill="url(#revenueFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
