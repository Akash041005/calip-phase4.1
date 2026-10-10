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
    <div className="relative min-h-[260px] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111318] shadow-sm">
      <div className="flex h-full flex-col p-[24px]">
        <h2 className="text-[17px] font-semibold text-white">AI Recommendations</h2>

        <div className="relative mt-[8px] flex-1">
          {/* Blurred background rows */}
          <div className="grid grid-cols-2 gap-[8px] blur-[6px] select-none sm:grid-cols-1" aria-hidden="true">
            {recommendations.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="flex min-h-[118px] flex-col items-start justify-between gap-2 rounded-xl bg-[#0e1015] border border-white/[0.06] p-3 sm:h-[46px] sm:min-h-0 sm:flex-row sm:items-center sm:gap-3 sm:px-3 sm:py-0"
              >
                <div className="flex w-full min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08] text-[13px] font-semibold text-white">
                    {item.initial}
                  </div>
                  <div className="w-full min-w-0">
                    <p className="truncate text-[13px] font-semibold text-white">{item.title}</p>
                    <p className="truncate text-[11px] text-[#94a3b8]">{item.category}</p>
                  </div>
                </div>
                <span className="text-[13px] font-semibold text-white font-mono">{item.score}</span>
              </div>
            ))}
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111318]/90 backdrop-blur-[4px]">
            <Unlock className="h-[24px] w-[24px] text-white" strokeWidth={1.8} />
            <p className="mt-2 max-w-[400px] text-center text-[13px] font-medium leading-snug text-white">
              Unlock Calip.io Pro to access new features
            </p>
            <Link
              href="/pro"
              className="cl-btn-primary mt-2.5 h-[34px] px-4 text-[12px]"
            >
              Activate with @99/ month
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
