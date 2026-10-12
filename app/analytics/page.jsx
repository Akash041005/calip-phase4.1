import Navbar from "../../components/dashboard/Navbar";
import AnalyticsHeader from "../../components/analytics/AnalyticsHeader";
import TotalFundingSector from "../../components/analytics/TotalFundingSector";
import DealStageDistribution from "../../components/analytics/DealStageDistribution";
import MonthlyActivity from "../../components/analytics/MonthlyActivity";
import AIScoreGrowthBubbleChart from "../../components/analytics/AIScoreGrowthBubbleChart";
import StartupComparisonTable from "../../components/analytics/StartupComparisonTable";

import Footer from "../../components/dashboard/Footer";

export const metadata = {
  title: "Calip — Analytics & Market Intelligence",
  description:
    "Deep-dive ecosystem analytics: startup valuation comparisons, industry trends, funding heatmaps, and AI growth metrics on Calip.",
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#090a0f] dark:text-[#f8fafc] transition-colors">
      <Navbar activePage="analytics" />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header */}
        <div className="pt-6 sm:pt-8">
          <AnalyticsHeader />
        </div>

        {/* Row 1: Funding by Sector & Deal Stage Distribution */}
        <div className="mt-6 flex flex-col xl:flex-row gap-6">
          <TotalFundingSector />
          <DealStageDistribution />
        </div>

        {/* Row 2: Monthly Activity Bar Chart */}
        <div className="mt-6">
          <MonthlyActivity />
        </div>

        {/* Row 3: AI Valuation Score vs. Growth Velocity Matrix */}
        <div className="mt-6">
          <AIScoreGrowthBubbleChart />
        </div>

        {/* Row 4: Startup Valuation & Performance Comparison Table */}
        <div className="mt-6">
          <StartupComparisonTable />
        </div>
      </main>

      <Footer />
    </div>
  );
}
