"use client";

import { useEffect, useState } from "react";
import Navbar from "../../../components/dashboard/Navbar";
import AnalyticsHeader from "../../../components/analytics/AnalyticsHeader";
import { GitCompare, Zap, ArrowRight } from "lucide-react";
import {
  getLeaderboard,
  getStartupComparison,
} from "../../../lib/analyticsApi";

const FALLBACK_STARTUPS = [
  {
    startupName: "NovaPay",
    sector: "FinTech",
    stage: "Series A",
    score: 94,
    sentiment: "Very Bullish",
    valuation: 420000000,
    raised: 180000000,
  },
  {
    startupName: "VoltGrid",
    sector: "CleanTech",
    stage: "Seed",
    score: 89,
    sentiment: "Bullish",
    valuation: 280000000,
    raised: 95000000,
  },
  {
    startupName: "FleetAI",
    sector: "AI & ML",
    stage: "Series A",
    score: 92,
    sentiment: "Bullish",
    valuation: 360000000,
    raised: 140000000,
  },
  {
    startupName: "MediSync",
    sector: "HealthTech",
    stage: "Pre-Seed",
    score: 85,
    sentiment: "Neutral",
    valuation: 180000000,
    raised: 55000000,
  },
  {
    startupName: "CleanLoop",
    sector: "CleanTech",
    stage: "Seed",
    score: 81,
    sentiment: "Positive",
    valuation: 210000000,
    raised: 75000000,
  },
];

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
        if (list.length === 0) {
          setRows(FALLBACK_STARTUPS);
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
        if (!cancelled) setRows(FALLBACK_STARTUPS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = rows && rows.length > 0 ? rows : FALLBACK_STARTUPS;

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f5fb]">
      <Navbar activePage="analytics" />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pb-16">
        <div className="pt-6 sm:pt-8">
          <AnalyticsHeader />
        </div>

        <div className="mt-6">
          <div className="relative w-full rounded-2xl border border-white/[0.08] bg-[#111318] shadow-[0_4px_24px_rgba(0,0,0,0.35)] overflow-hidden">
            {/* Table Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.08] p-5 sm:p-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white">
                    <GitCompare className="h-3.5 w-3.5" />
                  </span>
                  <h3 className="text-[16px] font-bold text-white">
                    Multi-Entity Head-to-Head Comparison
                  </h3>
                </div>
                <p className="mt-1 text-[12px] text-slate-400">
                  Side-by-side metric comparison of top tier startups by valuation and sentiment
                </p>
              </div>

              <span className="rounded-lg bg-white/[0.05] border border-white/[0.08] px-3 py-1 font-mono text-[11.5px] font-semibold text-white">
                Comparing {items.length} Entities
              </span>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto" data-lenis-prevent>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[10.5px] uppercase tracking-wider text-slate-400 font-semibold">
                    <th className="py-3.5 px-5 sm:px-6">Company</th>
                    <th className="py-3.5 px-4">Sector</th>
                    <th className="py-3.5 px-4">Stage</th>
                    <th className="py-3.5 px-4 text-center">AI Score</th>
                    <th className="py-3.5 px-4 text-center">Sentiment</th>
                    <th className="py-3.5 px-4 text-right">Valuation</th>
                    <th className="py-3.5 px-5 sm:px-6 text-right">Capital Raised</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {items.map((entry, idx) => (
                    <tr
                      key={entry._id || entry.startupId || entry.startupName || idx}
                      className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    >
                      {/* Name & Mark */}
                      <td className="py-3.5 px-5 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold bg-white/[0.05] border border-white/[0.08] text-white shadow-sm">
                            {(entry.startupName || "ST").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-[13.5px] group-hover:text-emerald-400 transition leading-tight">
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
                        <span className="inline-flex items-center rounded-md bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 text-[11.5px] font-medium text-slate-300">
                          {entry.sector || entry.industrySector || "N/A"}
                        </span>
                      </td>

                      {/* Stage */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center rounded-md bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 text-[11px] font-semibold text-slate-300">
                          {entry.stage || entry.startupStage || "N/A"}
                        </span>
                      </td>

                      {/* AI Score */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-mono text-[12px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Zap className="h-3 w-3" />
                          {entry.score || entry.aiScore || 85}/100
                        </span>
                      </td>

                      {/* Sentiment */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          (entry.sentiment || "").toLowerCase().includes("bullish") || (entry.sentiment || "").toLowerCase().includes("positive")
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {entry.sentiment || "Positive"}
                        </span>
                      </td>

                      {/* Valuation */}
                      <td className="py-3.5 px-4 text-right font-mono text-[13px] font-bold text-white">
                        {formatCurrency(entry.valuation ?? entry.funding?.valuation)}
                      </td>

                      {/* Raised */}
                      <td className="py-3.5 px-5 sm:px-6 text-right font-mono text-[13px] font-semibold text-slate-400">
                        {formatCurrency(entry.raised ?? entry.funding?.raised)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}