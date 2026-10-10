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
    <div className="h-[375px] w-full flex-1 rounded-2xl border border-white/[0.08] bg-[#111318] shadow-sm">
      <div className="flex h-full flex-col pl-[27px] pr-[15px] pt-[26px] pb-[20px]">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-white">
            Revenue Forecast
          </h2>
          <span className="text-[12px] text-slate-400">AI Projection</span>
        </div>

        <div className="mt-[20px] min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={forecast}
              margin={{ top: 15, right: 5, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
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
                cursor={{ stroke: "rgba(255, 255, 255, 0.2)", strokeDasharray: "4 4" }}
                contentStyle={{
                  backgroundColor: "#111318",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
                  padding: "10px 14px",
                  whiteSpace: "nowrap",
                }}
                labelStyle={{ color: "#94a3b8", fontSize: 13 }}
                itemStyle={{ color: "#ffffff", fontSize: 14 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                name="Revenue"
                stroke="#ffffff"
                strokeWidth={1.75}
                fill="url(#revenueFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
