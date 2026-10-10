"use client";

import Navbar from "../../components/dashboard/Navbar";
import TopTraderTicker from "../../components/dashboard/TopTraderTicker";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import MarketTerminal from "../../components/market/MarketTerminal";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f8fafc]">
      <Navbar activePage="dashboard" />
      <TopTraderTicker />
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16">
        <DashboardHeader />
        <div className="mt-8">
          <MarketTerminal />
        </div>
      </main>
    </div>
  );
}

