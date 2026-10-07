import { Sora } from "next/font/google";
import Navbar from "../../components/dashboard/Navbar";
import AnalyticsHeader from "../../components/analytics/AnalyticsHeader";
import TotalFundingSector from "../../components/analytics/TotalFundingSector";
import DealStageDistribution from "../../components/analytics/DealStageDistribution";
import MonthlyActivity from "../../components/analytics/MonthlyActivity";
import AIScoreGrowthBubbleChart from "../../components/analytics/AIScoreGrowthBubbleChart";
import StartupComparisonTable from "../../components/analytics/StartupComparisonTable";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Calip — Analytics",
  description:
    "Deep-dive analytics: startup comparisons, industry trends, and funding heatmaps on Calip.",
};

export default function AnalyticsPage() {
  return (
    <div className={`${sora.className} min-h-screen bg-[#fafaf8] dark:bg-[#1c202e]`}>
      <Navbar />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pb-[24px]">
        <div className="pt-[16px]">
          <AnalyticsHeader />
        </div>

        <div className="mt-[40px] flex flex-col xl:flex-row gap-[24px]">
          <TotalFundingSector />
          <DealStageDistribution />
        </div>

        <div className="mt-[40px]">
          <MonthlyActivity />
        </div>

        <div className="mt-[48px]">
          <AIScoreGrowthBubbleChart />
        </div>

        <div className="mt-[48px] pl-[4px]">
          <StartupComparisonTable />
        </div>
      </main>
    </div>
  );
}
