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
    <div className="h-[375px] w-full max-w-[434px] rounded-2xl border border-white/[0.08] bg-[#111318] shadow-sm">
      <div className="flex h-full flex-col pl-[35px] pr-[20px] pt-[30px] pb-[20px]">
        <h2 className="text-[16px] font-bold text-white">
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
              <PolarGrid gridType="polygon" stroke="rgba(255, 255, 255, 0.08)" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => [`${value}/100`, "Score"]}
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
              <Radar
                dataKey="score"
                name="Score"
                stroke="#ffffff"
                strokeWidth={1.75}
                fill="#ffffff"
                fillOpacity={0.12}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
