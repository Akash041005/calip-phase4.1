export default function BeforePortfolioChart() {
  return (
    <div className="h-[340px] w-full rounded-2xl border border-white/[0.08] bg-[#111318] shadow-sm">
      <div className="flex h-full flex-col p-[24px]">
        <div className="mb-1">
          <h2 className="text-[17px] font-semibold text-white">Portfolio Value</h2>
          <p className="mt-[2px] text-[13px] text-[#94a3b8]">Last 7 months</p>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center">
          <svg width="100%" height="100%" viewBox="0 0 733 207" preserveAspectRatio="none">
            <line x1="0" y1="207" x2="733" y2="207" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />
            <line x1="0" y1="157" x2="733" y2="157" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="107" x2="733" y2="107" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="57" x2="733" y2="57" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="7" x2="733" y2="7" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="0" x2="0" y2="207" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />
            <line x1="122" y1="0" x2="122" y2="207" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="245" y1="0" x2="245" y2="207" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="367" y1="0" x2="367" y2="207" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="489" y1="0" x2="489" y2="207" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="611" y1="0" x2="611" y2="207" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="733" y1="0" x2="733" y2="207" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" strokeDasharray="4 4" />
            {/* Zero baseline indicator */}
            <path d="M0 205 L733 205" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
}
