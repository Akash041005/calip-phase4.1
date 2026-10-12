"use client";

const OPTIONS = [
  { key: "monthly", label: "Monthly" },
  { key: "annual", label: "Annually" },
];

export default function PricingToggle({ billing, onBillingChange }) {
  return (
    <div className="relative flex h-[42px] w-[220px] rounded-lg border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#0e1015] p-1 shadow-xs transition-colors">
      {OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onBillingChange(option.key)}
          aria-pressed={billing === option.key}
          className={`relative z-10 flex flex-1 items-center justify-center rounded-md text-[13px] font-semibold transition-all duration-200 ${
            billing === option.key
              ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-black"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
