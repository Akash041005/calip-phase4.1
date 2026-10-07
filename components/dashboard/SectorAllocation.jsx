"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getPortfolioAllocation } from "../../lib/portfolioApi";

const SECTOR_COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#22D3EE", "#FB923C", "#F97316", "#EC4899", "#14B8A6"];

function SectorTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0];

  return (
    <div className="rounded-[10px] border border-[#f0f0f0] bg-white px-[12px] py-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:border-[#242838] dark:bg-[#181c28] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <p className="m-0 text-[13px] text-[#6b7280] dark:text-[#9ca3af]">{item.name}</p>
      <p className="m-0 mt-[2px] text-[13px] font-semibold text-[#1a1a2e] dark:text-white">
        {item.value}%
      </p>
    </div>
  );
}

export default function SectorAllocation() {
  const [sectors, setSectors] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getPortfolioAllocation()
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : null;
        if (!cancelled && list && list.length > 0) {
          setSectors(
            list.map((s, idx) => ({
              name: s.sector || s.name || "Unknown",
              value: Number(s.percentage ?? s.value) || 0,
              color: SECTOR_COLORS[idx % SECTOR_COLORS.length],
            }))
          );
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const defaultSectors = [
    { name: "FinTech", value: 35, color: "#3B82F6" },
    { name: "AI & ML", value: 28, color: "#10B981" },
    { name: "SaaS", value: 22, color: "#8B5CF6" },
    { name: "HealthTech", value: 15, color: "#FB923C" },
  ];

  const chartData = sectors && sectors.length > 0 ? sectors : defaultSectors;
  const totalSectors = chartData.length;

  return (
    <div className="h-[340px] w-full rounded-[14px] border border-[#f0f0f0] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:border-[#242838] dark:bg-[#181c28] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex h-full flex-col p-[24px]">
        <h2 className="text-[18px] font-semibold text-[#1a1a2e] dark:text-white">Sector Allocation</h2>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="relative flex flex-1 items-center justify-center">
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={62}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<SectorTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute flex flex-col items-center">
              <span className="text-[15px] text-[#9ca3af] dark:text-[#7c8190]">Sectors</span>
              <span className="text-[22px] font-bold leading-none text-[#1a1a2e] dark:text-white">
                {totalSectors}
              </span>
            </div>
          </div>

          <div className="mt-1 w-full space-y-[4px]">
            {chartData.map((sector) => (
              <div key={sector.name} className="flex items-center gap-2">
                <span
                  className="h-[12px] w-[12px] shrink-0 rounded-full"
                  style={{ backgroundColor: sector.color }}
                />
                <span className="w-[64px] shrink-0 text-[14px] text-[#374151] dark:text-[#b0b5bf]">
                  {sector.name}
                </span>
                <span className="flex-1 border-b border-dotted border-[#d1d5db] dark:border-[#3a3e4e]" />
                <span className="w-[28px] text-right text-[14px] text-[#374151] dark:text-[#b0b5bf]">
                  {sector.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
