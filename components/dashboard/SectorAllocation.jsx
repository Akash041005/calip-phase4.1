"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getPortfolioAllocation } from "../../lib/portfolioApi";

const SECTOR_COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#22D3EE", "#FB923C", "#F97316", "#EC4899", "#14B8A6"];

function SectorTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0];

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-2xl dark:border-white/[0.12] dark:bg-[#151824]">
      <p className="m-0 text-[12px] text-slate-500 dark:text-[#94a3b8]">{item.name}</p>
      <p className="m-0 mt-0.5 text-[14px] font-bold text-slate-900 dark:text-white font-mono">
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
    <div className="h-[340px] w-full rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-white/[0.12] dark:bg-[#151824] transition-colors">
      <div className="flex h-full flex-col p-[24px]">
        <h2 className="text-[17px] font-semibold text-slate-900 dark:text-white transition-colors">Sector Allocation</h2>

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
              <span className="text-[12px] text-slate-500 dark:text-[#94a3b8]">Sectors</span>
              <span className="text-[22px] font-bold leading-none text-slate-900 dark:text-white font-mono">
                {totalSectors}
              </span>
            </div>
          </div>

          <div className="mt-1 w-full space-y-[4px]">
            {chartData.map((sector) => (
              <div key={sector.name} className="flex items-center gap-2">
                <span
                  className="h-[10px] w-[10px] shrink-0 rounded-full"
                  style={{ backgroundColor: sector.color }}
                />
                <span className="w-[64px] shrink-0 text-[13px] text-slate-600 dark:text-[#94a3b8]">
                  {sector.name}
                </span>
                <span className="flex-1 border-b border-dotted border-slate-200 dark:border-white/[0.08]" />
                <span className="w-[28px] text-right text-[13px] font-medium text-slate-900 dark:text-white font-mono">
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
