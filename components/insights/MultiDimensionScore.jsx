"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTheme } from "../auth/ThemeProvider";

export default function MultiDimensionScore({ data }) {
  const { isDark } = useTheme();
  let dimensions = [];

  if (data?.dimensionScores && typeof data.dimensionScores === "object") {
    const ds = data.dimensionScores;
    const hasValues = Object.values(ds).some((v) => v != null && v > 0);
    if (hasValues) {
      dimensions = [
        { dimension: "Product Innovation", score: Number(ds.product) || 75 },
        { dimension: "Team Strength", score: Number(ds.team) || 80 },
        { dimension: "Market Potential", score: Number(ds.market) || 85 },
        { dimension: "Traction & Growth", score: Number(ds.traction) || 70 },
        { dimension: "Financial Health", score: Number(ds.finance) || 80 },
        { dimension: "Moat & IP", score: Number(ds.moat) || 78 },
      ];
    }
  } else if (Array.isArray(data?.dimensions) && data.dimensions.length > 0) {
    dimensions = data.dimensions;
  }

  return (
    <div className="h-[375px] w-full max-w-[434px] rounded-[20px] border border-[#e5e7eb] bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)] dark:border-[#2a2e3e] dark:bg-[#181c28]">
      <div className="flex h-full flex-col pl-[35px] pr-[20px] pt-[30px] pb-[20px]">
        <h2 className="text-[16px] font-semibold leading-[20px] text-[#111827] dark:text-white">
          Multi-Dimensional Score
        </h2>

        <div className="mt-[10px] min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={dimensions}
              cx="50%"
              cy="50%"
              outerRadius="82%"
            >
              <PolarGrid gridType="polygon" stroke={isDark ? "#242838" : "#E5E7EB"} />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: isDark ? "#7c8190" : "#6b7280", fontSize: 11 }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => [`${value}/100`, "Score"]}
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
              <Radar
                dataKey="score"
                name="Score"
                stroke="#4F46E5"
                strokeWidth={2}
                fill="#4F46E5"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
