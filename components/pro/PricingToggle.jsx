"use client";

const OPTIONS = [
  { key: "monthly", label: "Monthly" },
  { key: "annual", label: "Annually" },
];

export default function PricingToggle({ billing, onBillingChange }) {
  return (
    <div className="relative flex h-[41.58px] w-[226.528px] rounded-[10px] bg-[#f4f5f7] dark:bg-[#1c202e]">
      <span
        className={`absolute top-0 h-[41.58px] w-[121.586px] rounded-[10px] bg-white dark:bg-[#2a2e3e] transition-all duration-300 ease-out ${
          billing === "monthly" ? "left-0" : "left-[104.94px]"
        }`}
      />
      {OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onBillingChange(option.key)}
          aria-pressed={billing === option.key}
          className={`relative z-10 flex flex-1 items-center justify-center text-[14px] leading-none transition-colors duration-300 ${
            billing === option.key ? "text-black dark:text-white" : "text-[#9ca3af]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
