"use client";

import { useEffect, useState } from "react";
import { History, Loader2 } from "lucide-react";
import { getTradeHistory } from "../../lib/marketplaceApi";

const statusStyles = {
  FILLED: "bg-[#d1fae5] text-[#065f46] dark:bg-[#064e3b] dark:text-[#34d399]",
  PARTIALLY_FILLED: "bg-[#fef3c7] text-[#92400e] dark:bg-[#451a03] dark:text-[#fbbf24]",
  CANCELLED: "bg-[#fee2e2] text-[#991b1b] dark:bg-[#450a0a] dark:text-[#fca5a5]",
  EXPIRED: "bg-[#f3f4f6] text-[#4b5563] dark:bg-[#1e2234] dark:text-[#9ca3af]",
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
    <div className="rounded-[16px] border border-[#e5e7eb] bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] dark:border-[#2a2e3e] dark:bg-[#181c28] dark:shadow-[0px_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between border-b border-[#e5e7eb] px-[20px] py-[16px] dark:border-[#2a2e3e]">
        <h2 className="flex items-center gap-[8px] text-[15px] font-semibold text-[#111827] dark:text-white">
          <History className="h-[16px] w-[16px] text-[#6366f1]" strokeWidth={2} />
          Trade history
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-[48px]">
          <Loader2 className="h-[20px] w-[20px] animate-spin text-[#6366f1]" strokeWidth={2} />
        </div>
      ) : rows && rows.length === 0 ? (
        <p className="px-[20px] py-[48px] text-center text-[13px] text-[#9ca3af] dark:text-[#7c8190]">
          No completed trades yet. Trades appear here once a listing is filled or cancelled.
        </p>
      ) : (
        <div className="overflow-x-auto" data-lenis-prevent>
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-[#f3f4f6] text-[11px] uppercase tracking-wide text-[#9ca3af] dark:border-[#242838] dark:text-[#7c8190]">
                <th className="px-[20px] py-[12px] font-semibold">Startup</th>
                <th className="px-[12px] py-[12px] font-semibold">Tokens</th>
                <th className="px-[12px] py-[12px] font-semibold">Price / token</th>
                <th className="px-[12px] py-[12px] font-semibold">Listing type</th>
                <th className="px-[12px] py-[12px] font-semibold">Status</th>
                <th className="px-[20px] py-[12px] text-right font-semibold">Listed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((listing) => {
                const startup = listing?.startupId || {};
                const statusClass = statusStyles[listing.status] || statusStyles.EXPIRED;
                return (
                  <tr
                    key={listing._id}
                    className="border-b border-[#f3f4f6] text-[13px] transition-colors last:border-0 hover:bg-[#f9fafb] dark:border-[#242838] dark:hover:bg-[#181c28]"
                  >
                    <td className="px-[20px] py-[14px] font-semibold text-[#111827] dark:text-white">
                      {startup.startupName || "Unknown"}
                    </td>
                    <td className="px-[12px] py-[14px] text-[#4b5563] dark:text-[#b0b5bf]">
                      {Number(listing?.totalTokens ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-[12px] py-[14px] text-[#4b5563] dark:text-[#b0b5bf]">
                      ₹ {Number(listing?.pricePerToken ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-[12px] py-[14px] text-[#4b5563] dark:text-[#b0b5bf]">
                      {listing?.listingType || "SELL"}
                    </td>
                    <td className="px-[12px] py-[14px]">
                      <span
                        className={`inline-flex items-center rounded-[6px] px-[8px] py-[3px] text-[11px] font-semibold ${statusClass}`}
                      >
                        {listing.status?.replace("_", " ") || "—"}
                      </span>
                    </td>
                    <td className="px-[20px] py-[14px] text-right text-[#9ca3af] dark:text-[#7c8190]">
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