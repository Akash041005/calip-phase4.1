"use client";

import { useState, useEffect } from "react";
import { Table, ShieldCheck, Zap } from "lucide-react";
import { getLeaderboard } from "../../lib/analyticsApi";

const FALLBACK_STARTUPS = [
  {
    name: "NovaPay",
    symbol: "NOVAP",
    sector: "FinTech",
    stage: "Series A",
    aiScore: 94,
    sentiment: "Very Bullish",
    valuation: 420000000,
    raised: 180000000,
    color: "#38bdf8",
  },
  {
    name: "VoltGrid",
    symbol: "VOLTG",
    sector: "CleanTech",
    stage: "Seed",
    aiScore: 89,
    sentiment: "Bullish",
    valuation: 280000000,
    raised: 95000000,
    color: "#10b981",
  },
  {
    name: "FleetAI",
    symbol: "FLEET",
    sector: "AI & ML",
    stage: "Series A",
    aiScore: 92,
    sentiment: "Bullish",
    valuation: 360000000,
    raised: 140000000,
    color: "#38bdf8",
  },
  {
    name: "MediSync",
    symbol: "MEDIS",
    sector: "HealthTech",
    stage: "Pre-Seed",
    aiScore: 85,
    sentiment: "Neutral",
    valuation: 180000000,
    raised: 55000000,
    color: "#f59e0b",
  },
  {
    name: "AgriVerse",
    symbol: "AGRIV",
    sector: "AgriTech",
    stage: "Seed",
    aiScore: 78,
    sentiment: "Positive",
    valuation: 140000000,
    raised: 40000000,
    color: "#ec4899",
  },
  {
    name: "CleanLoop",
    symbol: "CLEAN",
    sector: "CleanTech",
    stage: "Seed",
    aiScore: 81,
    sentiment: "Positive",
    valuation: 210000000,
    raised: 75000000,
    color: "#a855f7",
  },
];

function formatCurrency(val) {
  if (val == null || isNaN(Number(val))) return "N/A";
  const num = Number(val);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

export default function StartupComparisonTable() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getLeaderboard()
      .then((res) => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        if (!cancelled && list.length > 0) {
          setCompanies(
            list.map((entry) => ({
              name: entry.startupName || "Startup",
              symbol: (entry.symbol || entry.startupName || "TOK").slice(0, 5).toUpperCase(),
              sector: entry.industrySector || entry.category || "General",
              stage: entry.startupStage || entry.stage || "Seed",
              aiScore: entry.score != null && entry.score > 0 ? entry.score : 86,
              sentiment: entry.sentiment || "Bullish",
              valuation: entry.funding?.valuation || entry.currentStartupValuation || 0,
              raised: entry.funding?.raised || 0,
              color: "#38bdf8",
            }))
          );
        } else if (!cancelled) {
          setCompanies(FALLBACK_STARTUPS);
        }
      })
      .catch(() => {
        if (!cancelled) setCompanies(FALLBACK_STARTUPS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = companies.length > 0 ? companies : FALLBACK_STARTUPS;

  return (
    <div className="relative w-full rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden dark:border-white/[0.08] dark:bg-[#111318] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] p-5 sm:p-6 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-800 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white transition-colors">
              <Table className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white transition-colors">
              Startup Valuation & Performance Comparison
            </h3>
          </div>
          <p className="mt-1 text-[12px] text-slate-500 dark:text-[#94a3b8] transition-colors">
            Cross-sector benchmark comparison across valuation, stage, and AI score
          </p>
        </div>

        <span className="rounded-md bg-slate-100 border border-slate-200 px-3 py-1 font-mono text-[11px] font-medium text-slate-700 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-[#94a3b8] transition-colors">
          {items.length} Tracked Startups
        </span>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto" data-lenis-prevent>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-[10.5px] uppercase tracking-wider text-slate-500 font-semibold dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-[#94a3b8] transition-colors">
              <th className="py-3.5 px-5 sm:px-6">Startup</th>
              <th className="py-3.5 px-4">Sector</th>
              <th className="py-3.5 px-4">Stage</th>
              <th className="py-3.5 px-4 text-center">AI Score</th>
              <th className="py-3.5 px-4 text-center">Sentiment</th>
              <th className="py-3.5 px-4 text-right">Valuation</th>
              <th className="py-3.5 px-5 sm:px-6 text-right">Capital Raised</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] transition-colors">
            {items.map((c, idx) => (
              <tr
                key={`${c.name}-${idx}`}
                className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
              >
                {/* Startup & Symbol */}
                <td className="py-3.5 px-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[12px] font-bold bg-slate-100 border border-slate-200 text-slate-800 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white shadow-sm transition-colors">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-[13.5px] group-hover:text-emerald-600 dark:group-hover:text-zinc-200 transition leading-tight">
                        {c.name}
                      </p>
                      <span className="font-mono text-[10.5px] text-slate-500 dark:text-[#94a3b8]">
                        ${c.symbol}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Sector */}
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11.5px] font-medium text-slate-700 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-[#cbd5e1] transition-colors">
                    {c.sector}
                  </span>
                </td>

                {/* Stage */}
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-white/[0.06] dark:border-white/[0.12] dark:text-zinc-300 transition-colors">
                    {c.stage}
                  </span>
                </td>

                {/* AI Score */}
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 font-mono text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Zap className="h-3 w-3" />
                    {c.aiScore}/100
                  </span>
                </td>

                {/* Sentiment */}
                <td className="py-3.5 px-4 text-center">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    c.sentiment.toLowerCase().includes("bullish") || c.sentiment.toLowerCase().includes("positive")
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-[#f59e0b]/10 text-amber-600 dark:text-[#f59e0b] border border-[#f59e0b]/25"
                  }`}>
                    {c.sentiment}
                  </span>
                </td>

                {/* Valuation */}
                <td className="py-3.5 px-4 text-right font-mono text-[13px] font-bold text-slate-900 dark:text-white transition-colors">
                  {formatCurrency(c.valuation)}
                </td>

                {/* Raised */}
                <td className="py-3.5 px-5 sm:px-6 text-right font-mono text-[13px] font-semibold text-slate-600 dark:text-[#a6adbf] transition-colors">
                  {formatCurrency(c.raised)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
