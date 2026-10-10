import { ChevronDown, Upload } from "lucide-react";

export default function InsightsHeader({ companyName }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-[24px] font-semibold leading-[30px] text-[#111827] dark:text-white">
          AI Insights
        </h1>
        <p className="mt-[5px] text-[14px] leading-[21px] text-[#4b5563] dark:text-[#9ca3af]">
          AI-generated investment insights, risk analysis, and growth predictions.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-[36px] min-w-[120px] max-w-[200px] items-center justify-between rounded-xl border border-white/[0.08] bg-[#111318] px-3">
          <span className="truncate text-[13px] text-slate-300">{companyName}</span>
          <ChevronDown
            className="ml-1 h-3.5 w-3.5 shrink-0 text-slate-400"
            strokeWidth={2}
          />
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex h-[36px] items-center gap-2 rounded-xl border border-white/[0.08] bg-[#111318] px-3.5 text-slate-300 hover:border-white/20 hover:text-white transition-colors"
        >
          <Upload className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} />
          <span className="text-[13px] font-medium">Export Report</span>
        </button>
      </div>
    </div>
  );
}
