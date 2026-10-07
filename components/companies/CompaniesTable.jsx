"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

const columns = [
  { key: "startupName", label: "Name" },
  { key: "industrySector", label: "Sector" },
  { key: "startupStage", label: "Stage" },
  { key: "fundingStatus", label: "Funding Status" },
  { key: "currentStartupValuation", label: "Valuation" },
  { key: "views", label: "Views" },
];

const formatCurrency = (val) => {
  if (val == null) return "—";
  return `₹ ${Number(val).toLocaleString("en-IN")}`;
};

export default function CompaniesTable({ data = [] }) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const sortedRows = useMemo(() => {
    if (!sortKey) return data;
    const rows = [...data];
    rows.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp =
        typeof aVal === "number"
          ? aVal - bVal
          : String(aVal ?? "").localeCompare(String(bVal ?? ""));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [data, sortKey, sortDir]);

  function handleSort(key) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div
      data-lenis-prevent
      className="w-full overflow-x-auto rounded-[14px] border border-[#f0f0f0] dark:border-[#2a2e3e] bg-white dark:bg-[#181c28] shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
    >
      <div className="min-w-[960px] px-6 pb-4 pt-6 sm:px-10">
        <h2 className="text-lg font-semibold leading-none text-[#1a1a2e] dark:text-white">
          Startups
        </h2>

        {/* Header */}
        <div className="mt-3 flex items-center gap-4">
          {columns.map((col) => {
            const isActive = col.key === sortKey;
            return (
              <button
                key={col.key}
                type="button"
                onClick={() => handleSort(col.key)}
                className={`flex items-center gap-1 whitespace-nowrap text-left text-[13px] leading-none text-[#9ca3af] dark:text-[#7c8190] transition-colors hover:text-[#6366f1] ${
                  col.key === "startupName" ? "min-w-[200px] flex-1 pl-[54px]" : "w-[140px]"
                }`}
              >
                {col.label}
                {isActive ? (
                  sortDir === "asc" ? (
                    <ChevronUp className="h-4 w-4 text-[#6366f1]" strokeWidth={2} />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#6366f1]" strokeWidth={2} />
                  )
                ) : (
                  <ChevronDown className="h-4 w-4" strokeWidth={2} />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 border-t border-[#e5e7eb] dark:border-[#2a2e3e]" />

        {/* Rows */}
        {sortedRows.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#9ca3af] dark:text-[#7c8190]">
            No startups found
          </div>
        ) : (
          sortedRows.map((row, index) => (
            <div key={row._id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (row._id) router.push(`/insights/${row._id}`);
                }}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && row._id) {
                    e.preventDefault();
                    router.push(`/insights/${row._id}`);
                  }
                }}
                className="flex h-11 cursor-pointer items-center gap-4 transition-colors hover:bg-[#fafafa] dark:hover:bg-[#1c202e]"
              >
                <div className="flex min-w-[200px] flex-1 items-center gap-3 pl-1">
                  <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-lg bg-[#eef2ff] dark:bg-[#1c202e] text-[16px] font-semibold text-[#6366f1]">
                    {(row.startupName ?? "?")[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="truncate text-[14px] font-semibold text-[#1a1a2e] dark:text-white">
                    {row.startupName ?? "—"}
                  </span>
                </div>

                <span className="w-[140px] truncate text-[13px] text-[#374151] dark:text-[#b0b5bf]">
                  {row.industrySector ?? "—"}
                </span>

                <span className="w-[140px] truncate text-[13px] text-[#374151] dark:text-[#b0b5bf]">
                  {row.startupStage ?? "—"}
                </span>

                <span className="w-[140px] truncate text-[13px] text-[#374151] dark:text-[#b0b5bf]">
                  {row.fundingStatus ?? "—"}
                </span>

                <span className="w-[140px] truncate text-[14px] text-[#1a1a2e] dark:text-white">
                  {formatCurrency(row.currentStartupValuation)}
                </span>

                <span className="w-[140px] truncate text-[14px] text-[#1a1a2e] dark:text-white">
                  {row.views ?? 0}
                </span>
              </div>

              {index < sortedRows.length - 1 && (
                <div className="border-t border-[#e5e7eb] dark:border-[#2a2e3e] pb-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
