"use client";

import Navbar from "../../components/dashboard/Navbar";
import TopTraderTicker from "../../components/dashboard/TopTraderTicker";
import MarketTerminal from "../../components/market/MarketTerminal";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#070a0f] text-[#f8fafc]">
      <Navbar />
      <TopTraderTicker />
      <main className="pb-12">
        <MarketTerminal />
      </main>
    </div>
  );
}
