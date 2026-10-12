function formatValuation(val) {
  if (!val) return null;
  const num = Number(val);
  if (isNaN(num)) return String(val);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

export default function CompanyCard({ data }) {
  const base = data || {};
  const name = base.startupName ?? "Company";
  const sector = base.industrySector ?? "Sector";
  const aiScore = base.aiScore ?? 0;
  const stage = base.startupStage ?? "Growth";
  const sentiment = base.sentiment ?? "positive";
  const valuation = formatValuation(base.valuation) || "₹15 Cr";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 dark:border-white/[0.12] dark:bg-[#151824] transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-800 dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white transition-colors">
          <span className="text-[18px] font-bold">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="text-[18px] font-bold text-slate-900 dark:text-white transition-colors">
            {name}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
            <span>{sector}</span>
            <span>•</span>
            <span>{stage}</span>
            <span>•</span>
            <span className="font-medium text-slate-900 dark:text-white">Valuation: {valuation}</span>
            <span>•</span>
            <span className="capitalize text-emerald-600 dark:text-emerald-400 font-medium">{sentiment} sentiment</span>
          </div>
        </div>
      </div>

      <div className="flex h-16 w-20 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-white/[0.08] dark:bg-[#0e1015] transition-colors">
        <span className="text-[26px] font-extrabold font-mono text-slate-900 dark:text-white">
          {aiScore}
        </span>
        <span className="mt-0.5 text-[10px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
          AI Score
        </span>
      </div>
    </div>
  );
}
