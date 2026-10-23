"use client";

import Navbar from "../dashboard/Navbar";
import DashboardHeader from "../dashboard/DashboardHeader";
import MarketTerminal from "../market/MarketTerminal";
import Footer from "../dashboard/Footer";
import InstitutionalHero from "./InstitutionalHero";
import EcosystemPillars from "./EcosystemPillars";
import HomeFaqAccordion from "./HomeFaqAccordion";

export default function UnifiedHome() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#090a0f] dark:text-[#f8fafc] transition-colors duration-150 flex flex-col">
      {/* 1. Global Navigation Bar */}
      <Navbar activePage="dashboard" />

      {/* 2. High-Impact Institutional Discovery Hero */}
      <InstitutionalHero />

      {/* 3. Live Markets Terminal Section */}
      <main id="market-terminal-section" className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-8 pb-12 flex-1 w-full">
        <DashboardHeader />
        <div className="mt-8">
          <MarketTerminal />
        </div>

        {/* 4. Core Platform Infrastructure Pillars */}
        <EcosystemPillars />

        {/* 5. Frequently Asked Questions */}
        <HomeFaqAccordion />
      </main>

      {/* 6. Institutional Footer */}
      <Footer />
    </div>
  );
}
