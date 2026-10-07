export default function BeforePortfolioChart() {
  return (
    <div className="h-[340px] w-full rounded-[14px] border border-[#f0f0f0] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:border-[#242838] dark:bg-[#181c28] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex h-full flex-col p-[24px]">
        <div className="mb-1">
          <h2 className="text-[18px] font-semibold text-[#1a1a2e] dark:text-white">Portfolio Value</h2>
          <p className="mt-[2px] text-[13px] text-[#9ca3af] dark:text-[#7c8190]">Last 7 months</p>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center">
          <svg width="100%" height="100%" viewBox="0 0 733 207" preserveAspectRatio="none">
            <line x1="0" y1="207" x2="733" y2="207" stroke="#e5e7eb" className="dark:stroke-[#242838]" strokeWidth="1" />
            <line x1="0" y1="157" x2="733" y2="157" stroke="#e5e7eb" className="dark:stroke-[#242838]" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="107" x2="733" y2="107" stroke="#e5e7eb" className="dark:stroke-[#242838]" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="57" x2="733" y2="57" stroke="#e5e7eb" className="dark:stroke-[#242838]" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="7" x2="733" y2="7" stroke="#e5e7eb" className="dark:stroke-[#242838]" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="0" x2="0" y2="207" stroke="#e5e7eb" className="dark:stroke-[#242838]" strokeWidth="1" />
            <line x1="122" y1="0" x2="122" y2="207" stroke="#e5e7eb" className="dark:stroke-[#242838]" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="245" y1="0" x2="245" y2="207" stroke="#e5e7eb" className="dark:stroke-[#242838]" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="367" y1="0" x2="367" y2="207" stroke="#e5e7eb" className="dark:stroke-[#242838]" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="489" y1="0" x2="489" y2="207" stroke="#e5e7eb" className="dark:stroke-[#242838]" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="611" y1="0" x2="611" y2="207" stroke="#e5e7eb" className="dark:stroke-[#242838]" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="733" y1="0" x2="733" y2="207" stroke="#e5e7eb" className="dark:stroke-[#242838]" strokeWidth="1" strokeDasharray="4 4" />
            {/* Zero baseline indicator */}
            <path d="M0 205 L733 205" stroke="#6366f1" strokeWidth="2" strokeOpacity="0.4" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
}
