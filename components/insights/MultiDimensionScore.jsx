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
    <div className="h-[375px] w-full max-w-[434px] rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-white/[0.12] dark:bg-[#151824] transition-colors">
      <div className="flex h-full flex-col pl-[35px] pr-[20px] pt-[30px] pb-[20px]">
        <h2 className="text-[16px] font-bold text-slate-900 dark:text-white transition-colors">
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
              <PolarGrid gridType="polygon" stroke={isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(100, 116, 139, 0.15)"} />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 11 }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => [`${value}/100`, "Score"]}
                contentStyle={{
                  backgroundColor: isDark ? "#151824" : "#ffffff",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(226, 232, 240, 1)",
                  borderRadius: "12px",
                  boxShadow: isDark ? "0 8px 32px rgba(0, 0, 0, 0.5)" : "0 8px 24px rgba(0, 0, 0, 0.08)",
                  padding: "10px 14px",
                  whiteSpace: "nowrap",
                }}
                labelStyle={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: 13 }}
                itemStyle={{ color: isDark ? "#ffffff" : "#0f172a", fontSize: 14 }}
              />
              <Radar
                dataKey="score"
                name="Score"
                stroke={isDark ? "#ffffff" : "#0f172a"}
                strokeWidth={1.75}
                fill={isDark ? "#ffffff" : "#0f172a"}
                fillOpacity={0.12}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
