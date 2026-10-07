import Navbar from "./Navbar";
import StatCard from "./StatCard";
import BeforePortfolioChart from "./BeforePortfolioChart";
import BeforeSectorAllocation from "./BeforeSectorAllocation";
import { beforeStatsData } from "./beforeMockData";

export default function BeforeInvesting() {
  return (
    <div className="min-h-screen bg-[#fbfbf9] dark:bg-[#0c0e14]">
      <Navbar />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pb-8">
        <div className="pt-4">
          <h1 className="text-[28px] font-bold leading-none text-[#1a1a2e] dark:text-white">
            Dashboard
          </h1>
          <p className="mt-[4px] text-[16px] text-[#6b7280] dark:text-[#9ca3af]">
            Your investment portfolio at a glance
          </p>
        </div>

        <div className="mt-[24px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
          {beforeStatsData.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="mt-[24px] grid grid-cols-1 gap-[24px] xl:grid-cols-[885fr_434fr]">
          <BeforePortfolioChart />
          <BeforeSectorAllocation />
        </div>
      </main>
    </div>
  );
}
