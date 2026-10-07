"use client";

import { useEffect, useState } from "react";
import { Sora } from "next/font/google";
import Navbar from "../../../components/dashboard/Navbar";
import AnalyticsHeader from "../../../components/analytics/AnalyticsHeader";
import {
  getLeaderboard,
  getStartupComparison,
} from "../../../lib/analyticsApi";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

function formatCurrency(val) {
  if (val == null || Number.isNaN(Number(val))) return "N/A";
  const num = Number(val);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

function resolveList(payload) {
  return Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.startups)
        ? payload.startups
        : [];
}

export default function ComparisonPage() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getLeaderboard()
      .then((res) => {
        if (cancelled) return;
        const list = resolveList(res);
        const ids = list.slice(0, 5).map((entry) => entry._id || entry.startupId).filter(Boolean);
        return getStartupComparison(ids).then((compareRes) => {
          if (cancelled) return;
          const compared = resolveList(compareRes);
          setRows(compared.length > 0 ? compared : list.slice(0, 5));
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load comparisons");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={`${sora.className} min-h-screen bg-[#fafaf8] dark:bg-[#1c202e]`}>
      <Navbar />

      <main className="mx-auto max-w-[1440px] px-[16px] pb-[24px] sm:px-[24px] lg:px-[40px]">
        <div className="pt-[16px]">
          <AnalyticsHeader />
        </div>

        <div className="mt-[40px]">
          <div className="flex h-[410px] flex-col items-start rounded-[16px] border border-[#e5e7eb] p-[24px] bg-white shadow-[0px_1px_1.5px_rgba(0,0,0,0.08),0px_1px_1px_rgba(0,0,0,0.04)] dark:border-[#2a2e3e] dark:bg-[#181c28] dark:shadow-[0px_4px_24px_rgba(0,0,0,0.3)]">
            <h3 className="text-[15px] font-semibold leading-[22.5px] text-[#111827] dark:text-white">
              Startup Comparison
            </h3>
            <p className="mt-[4px] text-[12px] leading-[18px] text-[#9ca3af] dark:text-[#7c8190]">
              {loading
                ? "Loading top startups by valuation..."
                : `Comparing the top ${rows?.length ?? 0} startups by valuation.`}
            </p>

            <div className="h-[330px] w-full overflow-auto" data-lenis-prevent>
              {loading ? (
                <div className="flex h-[280px] items-center justify-center text-[13px] text-[#9ca3af] dark:text-[#7c8190]">
                  Loading...
                </div>
              ) : error ? (
                <div className="flex h-[280px] items-center justify-center text-[13px] text-[#ef4444]">
                  {error}
                </div>
              ) : rows && rows.length > 0 ? (
                <table className="mt-[8px] w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className="border-b-[0.8px] border-[#e5e7eb] dark:border-[#2a2e3e] text-[11px] font-semibold uppercase leading-[16.5px] tracking-[0.4px] text-[#9ca3af] dark:text-[#7c8190]">
                      {["Company", "Sector", "Stage", "AI Score", "Sentiment", "Valuation", "Raised"].map(
                        (header) => (
                          <th key={header} className="px-[12px] py-[10px] font-semibold">
                            {header}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((entry) => (
                      <tr
                        key={entry._id || entry.startupId || entry.startupName}
                        className="border-b-[0.8px] border-[#f3f4f6] last:border-0 dark:border-[#2a2e3e]"
                      >
                        <td className="px-[12px] py-[12px] text-[13px] font-semibold leading-[19.5px] text-[#111827] dark:text-white">
                          {entry.startupName || "Unknown"}
                        </td>
                        <td className="px-[12px] py-[12px] text-[12px] leading-[18px] text-[#4b5563] dark:text-[#9ca3af]">
                          {entry.sector || entry.industrySector || "N/A"}
                        </td>
                        <td className="px-[12px] py-[12px] text-[12px] leading-[18px] text-[#4b5563] dark:text-[#9ca3af]">
                          {entry.stage || entry.startupStage || "N/A"}
                        </td>
                        <td className="px-[12px] py-[12px] text-[12px] font-semibold leading-[18px] text-[#6366f1]">
                          {entry.score || entry.aiScore || "—"}
                        </td>
                        <td className="px-[12px] py-[12px] text-[12px] font-medium capitalize leading-[18px] text-[#10b981]">
                          {entry.sentiment || "positive"}
                        </td>
                        <td className="px-[12px] py-[12px] text-[12px] font-semibold leading-[18px] text-[#111827] dark:text-white">
                          {formatCurrency(entry.valuation ?? entry.funding?.valuation)}
                        </td>
                        <td className="px-[12px] py-[12px] text-[12px] leading-[18px] text-[#4b5563] dark:text-[#9ca3af]">
                          {formatCurrency(entry.raised ?? entry.funding?.raised)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex h-[280px] items-center justify-center text-[13px] text-[#9ca3af] dark:text-[#7c8190]">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}