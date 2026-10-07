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
    <div className="flex flex-col gap-4 rounded-[20px] border border-[#e5e7eb] bg-white p-[20px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)] dark:border-[#2a2e3e] dark:bg-[#181c28] sm:flex-row sm:items-center sm:justify-between sm:px-[25px] sm:py-[18px]">
      <div className="flex items-center gap-[17.5px]">
        <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[10px] bg-[#e3eaf7] dark:bg-[#1f293d]">
          <span className="text-[20px] font-semibold leading-[25px] text-[#3b7bf8] dark:text-[#60a5fa]">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="text-[18px] font-bold leading-[22px] text-[#111827] dark:text-white">
            {name}
          </h2>
          <div className="mt-[4px] flex flex-wrap items-center gap-2 text-[13px] text-[#4b5563] dark:text-[#9ca3af]">
            <span>{sector}</span>
            <span>•</span>
            <span>{stage}</span>
            <span>•</span>
            <span className="font-medium text-[#111827] dark:text-white">Valuation: {valuation}</span>
            <span>•</span>
            <span className="capitalize text-[#10b981] font-medium">{sentiment} sentiment</span>
          </div>
        </div>
      </div>

      <div className="flex h-[64px] w-[78px] shrink-0 flex-col items-center justify-center rounded-[10px] bg-[#eef2ff] dark:bg-[#201d3b]">
        <span className="text-[28px] font-bold leading-none text-[#7a49e8] dark:text-[#a78bfa]">
          {aiScore}
        </span>
        <span className="mt-[3px] text-[10px] font-medium leading-[14px] text-[#7a49e8] dark:text-[#a78bfa]">
          AI Score
        </span>
      </div>
    </div>
  );
}
