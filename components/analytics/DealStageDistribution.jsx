"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getDealStages } from "../../lib/analyticsApi";

const STAGE_COLORS = ["#7a49e8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00c49f"];

export default function DealStageDistribution() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getDealStages()
      .then((res) => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : null;
        if (!cancelled && list && list.length > 0) {
          const total = list.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
          const mapped = list.map((item, idx) => ({
            name: item.stage || item.name || "Other",
            value: total > 0 ? Math.round(((Number(item.count) || 0) / total) * 100) : 0,
            color: STAGE_COLORS[idx % STAGE_COLORS.length],
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
    <div className="h-[375px] w-full min-w-0 max-w-[520px] rounded-[20px] border border-[#e5e7eb] dark:border-[#2a2e3e] bg-white dark:bg-[#181c28] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] dark:shadow-[0px_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex h-full flex-col pl-[34px] pr-[15px] pt-[30px] pb-[20px]">
        <h2 className="text-[16px] font-semibold leading-[20px] text-[#111827] dark:text-white">
          Deal Stage Distribution
        </h2>

        <div className="mt-[15px] flex min-h-0 flex-1 flex-col sm:flex-row items-center gap-[30px] sm:gap-[59px]">
          <div className="h-[206px] w-[200px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  startAngle={90}
                  endAngle={450}
                  innerRadius="60%"
                  outerRadius="90%"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, "Share"]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #f0f0f0",
                    borderRadius: "10px",
                    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
                    padding: "10px 14px",
                    whiteSpace: "nowrap",
                  }}
                  labelStyle={{ color: "#6b7280", fontSize: 14 }}
                  itemStyle={{ color: "#1a1a2e", fontSize: 15 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-[17px]">
            {chartData.map((entry) => (
              <div key={entry.name} className="flex items-center">
                <span
                  className="h-[9px] w-[9px] shrink-0 rounded-[2px]"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="ml-[13px] text-[12px] leading-[16px] text-[#4b5563] dark:text-[#9ca3af]">
                  {entry.name}
                </span>
                <span className="ml-[10px] text-[12px] leading-[16px] font-semibold text-[#111827] dark:text-white">
                  {entry.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
