import Navbar from "./Navbar";
import StatCard from "./StatCard";
import BeforePortfolioChart from "./BeforePortfolioChart";
import BeforeSectorAllocation from "./BeforeSectorAllocation";
import { beforeStatsData } from "./beforeMockData";

export default function BeforeInvesting() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f8fafc]">
      <Navbar />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pb-12">
        <div className="pt-4">
          <h1 className="text-[28px] font-extrabold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-[15px] text-slate-400">
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
