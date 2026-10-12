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
      className="w-full overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111318] shadow-sm"
    >
      <div className="min-w-[960px] px-6 pb-6 pt-6 sm:px-8">
        <h2 className="text-[17px] font-semibold leading-none text-white">
          Startups
        </h2>

        {/* Header */}
        <div className="mt-4 flex items-center gap-4">
          {columns.map((col) => {
            const isActive = col.key === sortKey;
            return (
              <button
                key={col.key}
                type="button"
                onClick={() => handleSort(col.key)}
                className={`flex items-center gap-1 whitespace-nowrap text-left text-[11.5px] font-semibold uppercase tracking-wider text-[#94a3b8] transition-colors hover:text-white ${
                  col.key === "startupName" ? "min-w-[200px] flex-1 pl-[54px]" : "w-[140px]"
                }`}
              >
                {col.label}
                {isActive ? (
                  sortDir === "asc" ? (
                    <ChevronUp className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                  )
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 opacity-40" strokeWidth={2} />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 border-t border-white/[0.06]" />

        {/* Rows */}
        {sortedRows.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#94a3b8]">
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
                className="flex h-12 cursor-pointer items-center gap-4 rounded-xl px-2 transition-colors hover:bg-white/[0.03]"
              >
                <div className="flex min-w-[200px] flex-1 items-center gap-3">
                  <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08] text-[14px] font-semibold text-white">
                    {(row.startupName ?? "?")[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="truncate text-[13.5px] font-semibold text-white">
                    {row.startupName ?? "—"}
                  </span>
                </div>

                <span className="w-[140px] truncate text-[13px] text-[#94a3b8]">
                  {row.industrySector ?? "—"}
                </span>

                <span className="w-[140px] truncate text-[13px] text-[#94a3b8]">
                  {row.startupStage ?? "—"}
                </span>

                <span className="w-[140px] truncate text-[13px] text-[#94a3b8]">
                  {row.fundingStatus ?? "—"}
                </span>

                <span className="w-[140px] truncate text-[13px] font-mono text-white">
                  {formatCurrency(row.currentStartupValuation)}
                </span>

                <span className="w-[140px] truncate text-[13px] font-mono text-[#94a3b8]">
                  {row.views ?? 0}
                </span>
              </div>

              {index < sortedRows.length - 1 && (
                <div className="border-t border-white/[0.06]" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
