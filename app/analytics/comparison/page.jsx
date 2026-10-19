"use client";

import { useEffect, useState } from "react";
import Navbar from "../../../components/dashboard/Navbar";
import AnalyticsHeader from "../../../components/analytics/AnalyticsHeader";
import Footer from "../../../components/dashboard/Footer";
import { GitCompare, Zap, Layers } from "lucide-react";
import {
  getLeaderboard,
  getStartupComparison,
} from "../../../lib/analyticsApi";

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
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getLeaderboard()
      .then((res) => {
        if (cancelled) return;
        const list = resolveList(res);
        if (list.length === 0) {
          setRows([]);
          return;
        }
        const ids = list.slice(0, 5).map((entry) => entry._id || entry.startupId).filter(Boolean);
        return getStartupComparison(ids).then((compareRes) => {
          if (cancelled) return;
          const compared = resolveList(compareRes);
          setRows(compared.length > 0 ? compared : list.slice(0, 5));
        });
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = rows || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#090a0f] dark:text-[#f4f5fb] transition-colors">
      <Navbar activePage="analytics" />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pb-16">
        <div className="pt-6 sm:pt-8">
          <AnalyticsHeader />
        </div>

        <div className="mt-6">
          <div className="relative w-full rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden dark:border-white/[0.08] dark:bg-[#111318] transition-colors">
            {/* Table Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-white/[0.08] p-5 sm:p-6 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white transition-colors">
                    <GitCompare className="h-3.5 w-3.5" />
                  </span>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white transition-colors">
                    Multi-Entity Head-to-Head Comparison
                  </h3>
                </div>
                <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400 transition-colors">
                  Side-by-side metric comparison of top tier startups by valuation and sentiment
                </p>
              </div>

              <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 font-mono text-[11.5px] font-semibold text-slate-700 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white transition-colors">
                Comparing {items.length} Entities
              </span>
            </div>

            {/* Table */}
            {loading ? (
              <div className="py-20 text-center text-[12.5px] text-slate-400 dark:text-slate-500 font-mono">
                Loading side-by-side telemetry…
              </div>
            ) : items.length === 0 ? (
              <div className="py-20 text-center text-slate-400 dark:text-slate-500">
                <Layers className="h-9 w-9 mx-auto mb-2 opacity-40" />
                <p className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200">No comparative telemetry available</p>
                <p className="text-[12px] max-w-sm mx-auto mt-1 text-slate-500 dark:text-slate-400">
                  Registered startups will appear in head-to-head benchmarking as companies complete onboarding.
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto" data-lenis-prevent>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[10.5px] uppercase tracking-wider text-slate-500 font-semibold dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-slate-400 transition-colors">
                      <th className="py-3.5 px-5 sm:px-6">Company</th>
                      <th className="py-3.5 px-4">Sector</th>
                      <th className="py-3.5 px-4">Stage</th>
                      <th className="py-3.5 px-4 text-center">AI Score</th>
                      <th className="py-3.5 px-4 text-center">Sentiment</th>
                      <th className="py-3.5 px-4 text-right">Valuation</th>
                      <th className="py-3.5 px-5 sm:px-6 text-right">Capital Raised</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] transition-colors">
                    {items.map((entry, idx) => (
                      <tr
                        key={entry._id || entry.startupId || entry.startupName || idx}
                        className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      >
                        {/* Name & Mark */}
                        <td className="py-3.5 px-5 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold bg-slate-100 border border-slate-200 text-slate-800 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white shadow-sm transition-colors">
                              {(entry.startupName || "ST").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white text-[13.5px] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition leading-tight">
                                {entry.startupName || "Unknown"}
                              </p>
                              <span className="font-mono text-[10.5px] text-slate-500">
                                ${(entry.symbol || entry.startupName || "TOK").slice(0, 5).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Sector */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11.5px] font-medium text-slate-700 dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-slate-300 transition-colors">
                            {entry.sector || entry.industrySector || "N/A"}
                          </span>
                        </td>

                        {/* Stage */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-slate-300 transition-colors">
                            {entry.stage || entry.startupStage || "N/A"}
                          </span>
                        </td>

                        {/* AI Score */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 font-mono text-[12px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Zap className="h-3 w-3" />
                            {entry.score != null && entry.score > 0 ? entry.score : 85}/100
                          </span>
                        </td>

                        {/* Sentiment */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            (entry.sentiment || "Bullish").toLowerCase().includes("bullish") || (entry.sentiment || "").toLowerCase().includes("positive")
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}>
                            {entry.sentiment || "Bullish"}
                          </span>
                        </td>

                        {/* Valuation */}
                        <td className="py-3.5 px-4 text-right font-mono text-[13px] font-bold text-slate-900 dark:text-white transition-colors">
                          {formatCurrency(entry.funding?.valuation || entry.valuation || entry.currentStartupValuation || 0)}
                        </td>

                        {/* Raised */}
                        <td className="py-3.5 px-5 sm:px-6 text-right font-mono text-[13px] font-semibold text-slate-600 dark:text-[#a6adbf] transition-colors">
                          {formatCurrency(entry.funding?.raised || entry.raised || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}