"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getFundingBySector } from "../../lib/analyticsApi";
import { useTheme } from "../auth/ThemeProvider";

function formatXAxis(value) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
}

export default function TotalFundingSector() {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getFundingBySector()
      .then((res) => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : null;
        if (!cancelled && list && list.length > 0) {
          const mapped = list.map((item) => ({
            name: item.sector || item.name || "Other",
            value: Number(item.totalRaised || item.totalValuation || item.value || 0),
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
  const maxValue = chartData.reduce((max, d) => Math.max(max, Number(d.value) || 0), 0);
  const xMax = maxValue > 0 ? Math.ceil(maxValue * 1.15) : 100000;

  return (
    <div className="h-[379px] w-full flex-1 min-w-0 rounded-[20px] border border-[#e5e7eb] dark:border-[#2a2e3e] bg-white dark:bg-[#181c28] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] dark:shadow-[0px_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex h-full flex-col pl-[36px] pr-[15px] pt-[30px] pb-[20px]">
        <h2 className="text-[16px] font-semibold leading-[20px] text-[#111827] dark:text-white">
          Total Funding Sector
        </h2>

        <div className="mt-[15px] min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              barCategoryGap="30%"
            >
              <XAxis
                type="number"
                domain={[0, xMax]}
                tickFormatter={formatXAxis}
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? "#7c8190" : "#4b5563", fontSize: 14, fillOpacity: 0.34 }}
                height={45}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? "#7c8190" : "#4b5563", fontSize: 14, fillOpacity: 0.34 }}
                width={110}
              />
              <Tooltip
                formatter={(value) => [
                  `₹${Number(value).toLocaleString("en-IN")}`,
                  "Funding",
                ]}
                cursor={{ fill: isDark ? "rgba(122, 73, 232, 0.12)" : "rgba(122, 73, 232, 0.06)" }}
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
                dataKey="value"
                fill="#7a49e8"
                radius={[0, 8, 8, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
