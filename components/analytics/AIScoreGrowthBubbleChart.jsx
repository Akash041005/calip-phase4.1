"use client";

import { useState, useEffect } from "react";
import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { getLeaderboard } from "../../lib/analyticsApi";
import { useTheme } from "../auth/ThemeProvider";

const xTicks = [0, 25, 50, 75, 100];
const yTicks = [160, 120, 80, 40, 0];

const bubbleColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f", "#a4de6c", "#d0a3f0"];

function ChartTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-[10px] border border-[#f0f0f0] dark:border-[#2a2e3e] bg-white dark:bg-[#181c28] px-[14px] py-[10px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <p className="text-[14px] font-semibold text-[#6b7280] dark:text-[#9ca3af]">{d.name}</p>
      <p className="text-[15px] text-[#1a1a2e] dark:text-white">AI Score: {d.aiScore}</p>
      <p className="text-[15px] text-[#1a1a2e] dark:text-white">Growth: {d.growth}%</p>
      <p className="text-[15px] text-[#1a1a2e] dark:text-white">Raised: ₹{d.raisedValue?.toLocaleString("en-IN") || "N/A"}</p>
    </div>
  );
}

export default function AIScoreGrowthBubbleChart() {
  const { isDark } = useTheme();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];

        const valuations = list.map((entry) => Number(entry.funding?.valuation) || 0);
        const views = list.map((entry) => Number(entry.views) || 0);
        const maxValuation = Math.max(...valuations, 1);
        const maxViews = Math.max(...views, 1);

        setChartData(
          list.map((entry, idx) => {
            const valuation = Number(entry.funding?.valuation) || 0;
            const viewCount = Number(entry.views) || 0;

            // Deterministic scaling from real leaderboard data — not random.
            const aiScore = Math.round(50 + (valuation / maxValuation) * 45);
            const growth = Math.round(10 + (viewCount / maxViews) * 110);

            return {
              name: entry.startupName || "Unknown",
              aiScore,
              growth,
              raisedValue: valuation,
              fill: bubbleColors[idx % bubbleColors.length],
            };
          })
        );
      })
      .catch(() => setChartData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative h-[382.945px] w-full rounded-[20px] border border-[#e5e7eb] dark:border-[#2a2e3e] bg-white dark:bg-[#181c28] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] dark:shadow-[0px_4px_24px_rgba(0,0,0,0.3)]">
      <h2 className="absolute left-[39.15px] top-[43.17px] text-[15px] font-semibold leading-[22.5px] text-[#111827] dark:text-white">
        AI Score vs. Growth Rate
      </h2>
      <p className="absolute left-[38.46px] top-[73.81px] text-[12px] leading-[18px] text-[#9ca3af] dark:text-[#7c8190]">
        Bubble size represents total raised. Hover for details.
      </p>

      <div className="absolute bottom-0 left-0 h-[310px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[13px] text-[#9ca3af] dark:text-[#7c8190]">
            Loading...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 58, right: 40, bottom: 52, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#242838" : "#F3F4F6"} />
              <XAxis
                dataKey="aiScore"
                type="number"
                domain={[0, 100]}
                ticks={xTicks}
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? "#7c8190" : "#9ca3af", fontSize: 11 }}
                dy={6}
              />
              <YAxis
                dataKey="growth"
                type="number"
                domain={[0, 160]}
                ticks={yTicks}
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? "#7c8190" : "#9ca3af", fontSize: 11 }}
                width={69}
                tickFormatter={(value) => `${value}%`}
              />
              <ZAxis
                type="number"
                dataKey="raisedValue"
                range={[100, 3000]}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ strokeDasharray: "3 3" }}
              />
              <Scatter data={chartData} fill="#8884d8">
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
