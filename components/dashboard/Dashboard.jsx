"use client";

import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import StatCard from "./StatCard";
import PortfolioChart from "./PortfolioChart";
import SectorAllocation from "./SectorAllocation";
import RecentActivity from "./RecentActivity";
import AIRecommendations from "./AIRecommendations";
import StaggerGroup, { StaggerItem } from "../motion/StaggerGroup";
import { getPortfolioSummary } from "../../lib/portfolioApi";
import { getWatchlist } from "../../lib/usersApi";

const EMPTY_STATS = [
  { label: "Portfolio Value", value: "₹ 0", trend: "+0%", trendGreen: false, icon: "briefcase" },
  { label: "Active Investments", value: "0", trend: "0 this month", trendGreen: false, icon: "bar-chart-3" },
  { label: "Total Returns", value: "+₹ 0", trend: "0% ROI", trendGreen: false, icon: "trending-up" },
  { label: "Watchlist", value: "0", trend: "0 with auctions", trendGreen: false, icon: "bookmark" },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getPortfolioSummary().catch(() => null),
      getWatchlist().catch(() => null),
    ]).then(([portfolioRes, watchlistRes]) => {
      if (cancelled) return;

      const portfolioData = portfolioRes?.data || portfolioRes;
      const watchlistData = watchlistRes?.data || watchlistRes;

      const summary = portfolioData?.summary;
      const holdings = portfolioData?.holdings || [];
      const watchlistCount = watchlistData?.total ?? watchlistData?.items?.length ?? 0;

      const fmtINR = (n) =>
        n === undefined || n === null || isNaN(Number(n))
          ? null
          : `₹ ${Number(n).toLocaleString("en-IN")}`;

      const cards = [...EMPTY_STATS];

      if (summary) {
        if (summary.currentValue != null) {
          cards[0] = { ...cards[0], value: fmtINR(summary.currentValue) };
        }
        const activeCount = holdings.filter((h) => (h.tokensHeld || 0) > 0).length;
        cards[1] = { ...cards[1], value: String(activeCount) };

        if (summary.profitLoss != null) {
          const sign = summary.profitLoss >= 0 ? "+" : "-";
          cards[2] = {
            ...cards[2],
            value: `${sign}${fmtINR(Math.abs(summary.profitLoss))}`,
            trend: summary.roi != null ? `+${summary.roi}% ROI` : cards[2].trend,
            trendGreen: summary.profitLoss >= 0,
          };
        }
      }

      cards[3] = {
        ...cards[3],
        value: String(watchlistCount),
        trend: `${watchlistCount} tracked startups`,
      };

      setStats(cards);
    });

    return () => { cancelled = true; };
  }, []);

  const statCards = stats || EMPTY_STATS;

  return (
    <div className="min-h-screen bg-[#fbfbf9]">
      <Navbar />

      <main className="mx-auto max-w-[1440px] px-[40px] pb-8">
        <StaggerGroup className="pt-4" stagger={0.06} delay={0.18}>
          <StaggerItem>
            <h1 className="text-[28px] font-bold leading-none text-[#1a1a2e]">
              Dashboard
            </h1>
            <p className="mt-[4px] text-[16px] text-[#6b7280]">
              Your investment portfolio at a glance
            </p>
          </StaggerItem>

          <div className="mt-[24px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => (
              <StaggerItem key={stat.label}>
                <StatCard {...stat} />
              </StaggerItem>
            ))}
          </div>

          <div className="mt-[24px] grid grid-cols-1 gap-[24px] xl:grid-cols-[885fr_434fr]">
            <StaggerItem>
              <PortfolioChart />
            </StaggerItem>
            <StaggerItem>
              <SectorAllocation />
            </StaggerItem>
          </div>

          <div className="mt-[24px] grid grid-cols-1 gap-[24px] lg:grid-cols-2">
            <StaggerItem>
              <RecentActivity />
            </StaggerItem>
            <StaggerItem>
              <AIRecommendations />
            </StaggerItem>
          </div>
        </StaggerGroup>
      </main>
    </div>
  );
}
