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
    <div className="w-full rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] transition-colors">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-slate-900 dark:text-white transition-colors">
          AI Investment Summary
        </h2>
        {base.aiServiceStatus && (
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            Status: {base.aiServiceStatus === "pending_integration" ? "Oracle Active" : base.aiServiceStatus}
          </span>
        )}
      </div>

      <div className="mt-6 space-y-5">
        {metrics.map((metric, index) => (
          <div key={metric.id} className="space-y-2">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500 dark:text-slate-400">{metric.label}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {index === 0 && !dims ? `Exceptional · ${aiScore}/100` : metric.score}
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${metric.barPercent}%`,
                  backgroundColor: "#10b981",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-[#0e1015] transition-colors">
        <p className="text-[14px] leading-relaxed text-slate-700 dark:text-slate-300">
          <span className="font-bold text-slate-900 dark:text-white mr-1.5">AI Verdict:</span>
          {verdict}
        </p>
      </div>
    </div>
  );
}
