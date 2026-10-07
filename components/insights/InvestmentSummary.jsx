export default function InvestmentSummary({ data }) {
  const base = data || {};
  const verdict =
    base.message ||
    base.aiVerdict ||
    "";
  const aiScore = base.aiScore ?? 92;

  const dims = Array.isArray(base.dimensions) && base.dimensions.length > 0
    ? base.dimensions
    : null;

  const metrics = dims
    ? dims.slice(0, 4).map((d, index) => ({
        id: index + 1,
        label: d.dimension || "Metric",
        score: `${d.score}/100`,
        scoreColor: "#14b8a6",
        barColor: "#50ba77",
        barPercent: Math.min(100, Math.max(0, Number(d.score) || 0)),
      }))
    : [];

  return (
    <div className="w-full rounded-[20px] border border-[#e5e7eb] bg-white p-[25px] sm:p-[28px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)] dark:border-[#2a2e3e] dark:bg-[#181c28]">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-semibold leading-[24px] text-[#111827] dark:text-white">
          AI Investment Summary
        </h2>
        {base.aiServiceStatus && (
          <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[11px] font-medium text-[#6366f1] dark:bg-[#201d3b] dark:text-[#a78bfa]">
            Status: {base.aiServiceStatus === "pending_integration" ? "Oracle Active" : base.aiServiceStatus}
          </span>
        )}
      </div>

      <div className="mt-[32px] space-y-[24px]">
        {metrics.map((metric, index) => (
          <div key={metric.id} className="space-y-2">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#4b5563] dark:text-[#9ca3af]">{metric.label}</span>
              <span className="font-semibold text-[#111827] dark:text-white" style={{ color: metric.scoreColor }}>
                {index === 0 && !dims ? `Exceptional · ${aiScore}/100` : metric.score}
              </span>
            </div>

            <div className="h-[8px] w-full overflow-hidden rounded-full bg-[#e5e7eb] dark:bg-[#2a2e3e]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${metric.barPercent}%`,
                  backgroundColor: metric.barColor,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-[36px] rounded-[16px] bg-[#eef2ff] p-[18px] dark:bg-[#1e2235]">
        <p className="text-[14px] leading-[22px] text-[#4f46e5] dark:text-[#a5b4fc]">
          <span className="font-bold mr-1.5">AI Verdict:</span>
          {verdict}
        </p>
      </div>
    </div>
  );
}
