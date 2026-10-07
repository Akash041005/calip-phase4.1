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

      <div className="flex items-center gap-[12px]">
        <div className="flex h-[34px] min-w-[120px] max-w-[200px] items-center justify-between rounded-[12px] border border-[#e5e7eb] bg-white px-[12px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)] dark:border-[#2a2e3e] dark:bg-[#181c28]">
          <span className="truncate text-[13px] text-[#4b5563] dark:text-[#9ca3af]">{companyName}</span>
          <ChevronDown
            className="ml-1 h-[12px] w-[12px] shrink-0 text-[#4b5563] dark:text-[#9ca3af]"
            strokeWidth={2}
          />
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex h-[34px] items-center gap-[6px] rounded-[12px] border border-[#e5e7eb] bg-white px-[12px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)] transition-colors hover:bg-gray-50 dark:border-[#2a2e3e] dark:bg-[#181c28] dark:hover:bg-[#202535]"
        >
          <Upload className="h-[14px] w-[14px] text-[#4b5563] dark:text-[#9ca3af]" strokeWidth={1.75} />
          <span className="text-[13px] font-medium text-[#4b5563] dark:text-[#9ca3af]">Export Report</span>
        </button>
      </div>
    </div>
  );
}
