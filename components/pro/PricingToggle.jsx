"use client";

const OPTIONS = [
  { key: "monthly", label: "Monthly" },
  { key: "annual", label: "Annually" },
];

export default function PricingToggle({ billing, onBillingChange }) {
  return (
    <div className="relative flex h-[42px] w-[220px] rounded-lg border border-white/[0.08] bg-[#0e1015] p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onBillingChange(option.key)}
          aria-pressed={billing === option.key}
          className={`relative z-10 flex flex-1 items-center justify-center rounded-md text-[13px] font-semibold transition-all duration-200 ${
            billing === option.key
              ? "bg-white text-black shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
