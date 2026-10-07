"use client";

import { useState, useEffect } from "react";
import Navbar from "../dashboard/Navbar";
import StatCard from "../dashboard/StatCard";
import PortfolioChart from "../dashboard/PortfolioChart";
import SectorAllocation from "../dashboard/SectorAllocation";
import MonthlyReturnsBarChart from "./MonthlyReturnsBarChart";
import AIRecommendationsTable from "./AIRecommendationsTable";
import { getPerformanceSummary } from "../../lib/portfolioApi";

export default function PerformanceSummary() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPerformanceSummary()
      .then((res) => {
        const payload = res?.data || res;
        const kpis = payload?.kpis;
        const holdings = payload?.holdings || [];

        if (kpis) {
          const totalVal = kpis.totalPortfolioValue || 0;
          const totalRet = kpis.totalReturns || 0;
          const roi = kpis.overallRoi != null ? Number(kpis.overallRoi).toFixed(1) : "0.0";
          const holdingCount = kpis.holdingCount || holdings.length || 0;

          setStats([
            {
              label: "Portfolio Value",
              value: "₹" + totalVal.toLocaleString("en-IN"),
              change: "",
              positive: true,
            },
            {
              label: "Total Returns",
              value: (totalRet >= 0 ? "+" : "-") + "₹" + Math.abs(totalRet).toLocaleString("en-IN"),
              change: "",
              positive: totalRet >= 0,
            },
            {
              label: "Active Holdings",
              value: String(holdingCount),
              change: "",
              positive: true,
            },
            {
              label: "Overall ROI",
              value: roi + "%",
              change: "",
              positive: parseFloat(roi) >= 0,
            },
          ]);
        }
      })
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#fbfbf9] dark:bg-[#0c0e14]">
      <Navbar />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pb-8">
        <div className="pt-4">
          <h1 className="text-[28px] font-bold leading-none text-[#1a1a2e] dark:text-white">
            Performance Summary
          </h1>
          <p className="mt-[4px] text-[16px] leading-none text-[#6b7280] dark:text-[#9ca3af]">
            Your investment history, ROI, and portfolio performance analytics.
          </p>
        </div>

        <div className="mt-[24px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[100px] animate-pulse rounded-[14px] bg-gray-100 dark:bg-[#1c202e]" />
            ))
          ) : (
            stats.map((stat) => <StatCard key={stat.label} {...stat} />)
          )}
        </div>

        <div className="mt-[24px] grid grid-cols-1 gap-[24px] xl:grid-cols-[885fr_434fr]">
          <PortfolioChart />
          <SectorAllocation />
        </div>

        <div className="mt-[24px]">
          <MonthlyReturnsBarChart />
        </div>

        <div className="mt-[24px]">
          <AIRecommendationsTable />
        </div>
      </main>
    </div>
  );
}
