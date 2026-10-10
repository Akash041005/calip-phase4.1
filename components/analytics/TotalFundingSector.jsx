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
import { Layers } from "lucide-react";
import { getFundingBySector } from "../../lib/analyticsApi";

const FALLBACK_SECTORS = [
  { name: "AI & ML", value: 320000000 },
  { name: "FinTech", value: 280000000 },
  { name: "CleanTech", value: 195000000 },
  { name: "HealthTech", value: 140000000 },
  { name: "SpaceTech", value: 95000000 },
  { name: "AgriTech", value: 75000000 },
];

function formatCurrency(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
}

export default function TotalFundingSector() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
          setData(mapped.sort((a, b) => b.value - a.value));
        } else if (!cancelled) {
          setData(FALLBACK_SECTORS);
        }
      })
      .catch(() => {
        if (!cancelled) setData(FALLBACK_SECTORS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = data && data.length > 0 ? data : FALLBACK_SECTORS;
  const maxValue = chartData.reduce((max, d) => Math.max(max, Number(d.value) || 0), 0);
  const xMax = maxValue > 0 ? Math.ceil(maxValue * 1.15) : 350000000;
  const totalFunding = chartData.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="relative w-full flex-1 min-w-0 rounded-2xl border border-white/[0.08] bg-[#111318] p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08] text-white">
              <Layers className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-[16px] font-bold text-white">
              Total Funding by Sector
            </h2>
          </div>
          <p className="mt-1 text-[12px] text-[#94a3b8]">
            Aggregate capital raised across registered industry sectors
          </p>
        </div>

        <span className="rounded-md bg-white/[0.05] border border-white/[0.08] px-3 py-1 font-mono text-[12px] font-bold text-white">
          {formatCurrency(totalFunding)}
        </span>
      </div>

      {/* Chart */}
      <div className="mt-4 h-[280px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[12.5px] text-[#94a3b8]">
            Loading sector metrics…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 15, bottom: 5, left: 10 }}
              barCategoryGap="25%"
            >
              <defs>
                <linearGradient id="sectorBarGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.75} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
                </linearGradient>
              </defs>
              <XAxis
                type="number"
                domain={[0, xMax]}
                tickFormatter={formatCurrency}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#737d91", fontSize: 11, fontFamily: "monospace" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#cbd5e1", fontSize: 12, fontWeight: 500 }}
                width={85}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Total Raised"]}
                cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
                contentStyle={{
                  backgroundColor: "#111318",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                  padding: "10px 14px",
                }}
                labelStyle={{ color: "#ffffff", fontWeight: 600, fontSize: 13 }}
                itemStyle={{ color: "#10b981", fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}
              />
              <Bar
                dataKey="value"
                fill="url(#sectorBarGradient)"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
