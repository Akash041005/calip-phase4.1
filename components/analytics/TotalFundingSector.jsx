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

function formatCurrency(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
}

export default function TotalFundingSector() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getFundingBySector()
      .then((res) => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : null;
        if (!cancelled) {
          if (list && list.length > 0) {
            const mapped = list.map((item) => ({
              name: item.sector || item.name || "Other",
              value: Number(item.totalRaised || item.totalValuation || item.value || 0),
            }));
            setData(mapped.sort((a, b) => b.value - a.value));
          } else {
            setData([]);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = data || [];
  const maxValue = chartData.reduce((max, d) => Math.max(max, Number(d.value) || 0), 0);
  const xMax = maxValue > 0 ? Math.ceil(maxValue * 1.15) : 1000000;
  const totalFunding = chartData.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="relative w-full flex-1 min-w-0 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#111318] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-800 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white transition-colors">
              <Layers className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-[16px] font-bold text-slate-900 dark:text-white transition-colors">
              Total Funding by Sector
            </h2>
          </div>
          <p className="mt-1 text-[12px] text-slate-500 dark:text-[#94a3b8] transition-colors">
            Aggregate capital raised across registered industry sectors
          </p>
        </div>

        <span className="rounded-md bg-slate-100 border border-slate-200 px-3 py-1 font-mono text-[12px] font-bold text-slate-900 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white transition-colors">
          {formatCurrency(totalFunding)}
        </span>
      </div>

      {/* Chart */}
      <div className="mt-4 h-[280px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[12.5px] text-slate-400 dark:text-[#94a3b8]">
            Loading sector metrics…
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-[#94a3b8]">
            <Layers className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300">No sector funding recorded yet</p>
            <p className="text-[11.5px] max-w-xs mt-1 text-slate-500 dark:text-slate-400">
              Sector distributions will automatically calibrate as token presales and funding rounds close on Calip.
            </p>
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
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                width={85}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-[#111318] transition-colors">
                      <p className="text-[12.5px] font-bold text-slate-900 dark:text-white">{label}</p>
                      <p className="mt-1 font-mono text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(Number(payload[0]?.value))}
                        <span className="ml-1 text-[11px] font-normal text-slate-500 dark:text-slate-400 font-sans">Total Raised</span>
                      </p>
                    </div>
                  );
                }}
                cursor={{ fill: "rgba(100, 116, 139, 0.08)" }}
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
