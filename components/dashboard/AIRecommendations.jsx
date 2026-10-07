import { Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getPortfolioRecommendations } from "../../lib/portfolioApi";

const SAMPLE_ITEMS = [
  { initial: "N", title: "Nexus AI", category: "AI & ML", score: "94/100" },
  { initial: "Q", title: "QuantumLedger", category: "DeFi", score: "89/100" },
  { initial: "S", title: "Solaris CleanTech", category: "CleanTech", score: "87/100" },
];

export default function AIRecommendations() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getPortfolioRecommendations()
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : null;
        if (!cancelled && list && list.length > 0) {
          setItems(
            list.map((item) => ({
              initial: (
                item.startupName || item.title || "?"
              ).charAt(0).toUpperCase(),
              title: item.startupName || item.title || "Company",
              category: item.industrySector || item.category || "Startup",
              score: item.aiScore || item.score || "--",
            }))
          );
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const recommendations = items && items.length > 0 ? items : SAMPLE_ITEMS;

  return (
    <div className="relative min-h-[260px] w-full overflow-hidden rounded-[14px] border border-[#f0f0f0] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:border-[#242838] dark:bg-[#181c28] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex h-full flex-col p-[24px]">
        <h2 className="text-[18px] font-semibold text-[#1a1a2e] dark:text-white">AI Recommendations</h2>

        <div className="relative mt-[8px] flex-1">
          {/* Blurred background rows */}
          <div className="grid grid-cols-2 gap-[8px] blur-[6px] select-none sm:grid-cols-1" aria-hidden="true">
            {recommendations.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="flex min-h-[118px] flex-col items-start justify-between gap-2 rounded-lg bg-[#f9fafb] p-3 dark:bg-[#1c202e] sm:h-[46px] sm:min-h-0 sm:flex-row sm:items-center sm:gap-3 sm:px-3 sm:py-0"
              >
                <div className="flex w-full min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#eef2ff] text-[15px] font-semibold text-[#6366f1] dark:bg-[#1e1b4b] dark:text-[#818cf8]">
                    {item.initial}
                  </div>
                  <div className="w-full min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[#1a1a2e] dark:text-white">{item.title}</p>
                    <p className="truncate text-[12px] text-[#9ca3af] dark:text-[#7c8190]">{item.category}</p>
                  </div>
                </div>
                <span className="text-[14px] font-semibold text-[#1a1a2e] dark:text-white">{item.score}</span>
              </div>
            ))}
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] dark:bg-[#181c28]/85">
            <Unlock className="h-[28px] w-[28px] text-[#1a1a2e] dark:text-white" strokeWidth={1.5} />
            <p className="mt-2 max-w-[440px] text-center text-[14px] font-medium leading-snug text-[#1a1a2e] dark:text-white">
              Unlock Calip.io Pro to access new features
            </p>
            <Link
              href="/pro"
              className="mt-[5px] inline-flex items-center justify-center rounded-xl bg-[#584DB0] px-6 py-[8px] text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(88,77,176,0.35)] transition-colors hover:bg-[#4a3f9a]"
            >
              Activate with @99/ month
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
