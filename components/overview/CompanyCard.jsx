import { ArrowRight, X } from "lucide-react";

export default function CompanyCard({ startup, onRemove }) {
  const initial = startup.startupName?.[0]?.toUpperCase() ?? "?";
  const name = startup.startupName ?? "Unknown";
  const raised =
    typeof startup.funding?.valuation === "number" && startup.funding.valuation > 0
      ? "\u20B9" + startup.funding.valuation.toLocaleString("en-IN")
      : startup.currentStartupValuation || "Valuation pending";
  const category = startup.industrySector ?? "N/A";
  const growth = startup.startupStage ?? "N/A";
  const progress = Math.min(Math.max(startup.views ?? 0, 0), 100);

  return (
    <div className="flex w-full min-h-[64px] h-auto items-center flex-col sm:flex-row sm:items-center rounded-2xl border border-slate-200/90 bg-white dark:border-white/[0.12] dark:bg-[#151824] px-5 py-3.5 gap-3 shadow-sm transition-all hover:border-slate-300 dark:hover:border-white/20">
      <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-800 dark:bg-white/[0.05] dark:border-white/[0.08] text-[15px] font-semibold dark:text-white">
        {initial}
      </div>

      <div className="ml-0 sm:ml-3 flex flex-col min-w-[140px]">
        <span className="text-[14px] font-semibold leading-tight text-slate-900 dark:text-white">
          {name}
        </span>
        <span className="mt-[2px] text-[12px] text-slate-500 dark:text-[#94a3b8] font-mono">{raised}</span>
      </div>

      <div className="ml-0 sm:ml-8 flex flex-col min-w-[120px]">
        <span className="text-[13px] leading-tight text-slate-500 dark:text-[#94a3b8]">{category}</span>
        <span className="mt-[2px] text-[12px] text-emerald-600 dark:text-emerald-400 font-medium">{growth}</span>
      </div>

      <div className="ml-auto flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        <div className="flex flex-col items-end gap-1">
          <div className="h-[6px] w-[140px] sm:w-[160px] overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-[#94a3b8]">{progress}%</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex h-[32px] w-[32px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#94a3b8] transition-colors hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white"
            aria-label={`View ${name} details`}
          >
            <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={() => onRemove && onRemove(startup)}
            className="flex h-[32px] w-[32px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#94a3b8] transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400"
            aria-label={`Remove ${name} from watchlist`}
          >
            <X className="h-[14px] w-[14px]" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
