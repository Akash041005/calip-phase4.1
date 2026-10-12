"use client";

import { useEffect, useState } from "react";
import { History, Loader2 } from "lucide-react";
import { getTradeHistory } from "../../lib/marketplaceApi";

const statusStyles = {
  FILLED: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  PARTIALLY_FILLED: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  CANCELLED: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  EXPIRED: "bg-white/5 text-slate-400 border border-white/10",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function TradeHistory() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTradeHistory(1, 20)
      .then((res) => {
        if (cancelled) return;
        const list = res?.data || (Array.isArray(res) ? res : []);
        setRows(list.filter(Boolean));
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

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-white/[0.12] dark:bg-[#151824] transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] px-5 py-4">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 dark:text-white transition-colors">
          <History className="h-4 w-4 text-slate-700 dark:text-white" strokeWidth={2} />
          Trade history
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-slate-600 dark:text-white" strokeWidth={2} />
        </div>
      ) : rows && rows.length === 0 ? (
        <p className="px-5 py-12 text-center text-[13px] text-slate-500 dark:text-slate-400">
          No completed trades yet. Trades appear here once a listing is filled or cancelled.
        </p>
      ) : (
        <div className="overflow-x-auto" data-lenis-prevent>
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.06] text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-5 py-3 font-semibold">Startup</th>
                <th className="px-3 py-3 font-semibold">Tokens</th>
                <th className="px-3 py-3 font-semibold">Price / token</th>
                <th className="px-3 py-3 font-semibold">Listing type</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Listed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((listing) => {
                const startup = listing?.startupId || {};
                const statusClass = statusStyles[listing.status] || statusStyles.EXPIRED;
                return (
                  <tr
                    key={listing._id}
                    className="border-b border-slate-100 dark:border-white/[0.04] text-[13px] transition-colors last:border-0 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white transition-colors">
                      {startup.startupName || "Unknown"}
                    </td>
                    <td className="px-3 py-3.5 text-slate-700 dark:text-slate-300 font-mono">
                      {Number(listing?.totalTokens ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-3.5 text-slate-700 dark:text-slate-300 font-mono">
                      ₹ {Number(listing?.pricePerToken ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-3.5 text-slate-500 dark:text-slate-400">
                      {listing?.listingType || "SELL"}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${statusClass}`}
                      >
                        {listing.status?.replace("_", " ") || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500 dark:text-slate-400 font-mono text-[12px]">
                      {formatDate(listing?.updatedAt || listing?.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}