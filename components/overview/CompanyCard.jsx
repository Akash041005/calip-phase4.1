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
    <div className="flex w-full min-h-[68px] h-auto items-center flex-col sm:flex-row sm:items-center rounded-[14px] border border-[#f0f0f0] dark:border-[#2a2e3e] bg-white dark:bg-[#181c28] px-[20px] py-3 gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg bg-[#eef2ff] dark:bg-[#1c202e] text-[16px] font-semibold text-[#6366f1]">
        {initial}
      </div>

      <div className="ml-0 sm:ml-[14px] flex flex-col">
        <span className="text-[14px] font-semibold leading-tight text-[#1a1a2e] dark:text-white">
          {name}
        </span>
        <span className="mt-[1px] text-[12px] text-[#9ca3af] dark:text-[#7c8190]">{raised}</span>
      </div>

      <div className="ml-0 sm:ml-[100px] flex flex-col">
        <span className="text-[13px] leading-tight text-[#374151] dark:text-[#b0b5bf]">{category}</span>
        <span className="mt-[1px] text-[13px] text-[#10b981]">{growth}</span>
      </div>

      <div className="ml-auto flex items-center gap-[12px]">
        <div className="flex flex-col items-end gap-[4px]">
          <div className="h-[10px] w-full sm:w-[180px] overflow-hidden rounded-full bg-[#f3f4f6] dark:bg-[#1c202e]">
            <div
              className="h-full rounded-full bg-[#6366f1] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[13px] text-[#374151] dark:text-[#b0b5bf]">{progress}%</span>
        </div>

        <div className="flex items-center gap-[5px]">
          <button
            type="button"
            className="flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#f3f4f6] dark:bg-[#1c202e] transition-colors hover:bg-[#e5e7eb] dark:hover:bg-[#2a2e3e]"
            aria-label={`View ${name} details`}
          >
            <ArrowRight className="h-[13px] w-[13px] text-[#374151] dark:text-[#b0b5bf]" strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={() => onRemove && onRemove(startup)}
            className="flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#f3f4f6] dark:bg-[#1c202e] transition-colors hover:bg-[#e5e7eb] dark:hover:bg-[#2a2e3e]"
            aria-label={`Remove ${name} from watchlist`}
          >
            <X className="h-[18px] w-[18px] text-[#374151] dark:text-[#b0b5bf]" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
