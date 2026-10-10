"use client";

function CircleTick({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="9" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5" />
      <path
        d="M6 10L8.5 12.5L14 7"
        stroke="#10b981"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossMark({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 6L14 14M14 6L6 14"
        stroke="rgba(148, 163, 184, 0.35)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PricingCard({ plan, billing, onUpgrade }) {
  const isFree = plan.variant === "free";
  const price = plan.price[billing];
  const suffix = plan.suffix?.[billing];

  return (
    <div
      className={`relative flex w-full max-w-[540px] flex-col rounded-2xl p-7 sm:p-9 transition-all ${
        isFree
          ? "border border-white/[0.08] bg-[#111318]"
          : "border border-white/20 bg-[#13161f] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      }`}
    >
      {!isFree && (
        <span className="absolute top-6 right-6 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
          INSTITUTIONAL
        </span>
      )}

      <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-400">
        {plan.name}
      </span>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-[38px] font-extrabold text-white">
          {price}
        </span>
        {plan.divider && (
          <span className="text-[32px] font-extrabold text-slate-500">
            {plan.divider}
          </span>
        )}
        {suffix && (
          <span className="text-[15px] font-medium text-slate-400">
            {suffix}
          </span>
        )}
      </div>

      <p className="mt-3 text-[13.5px] leading-relaxed text-slate-400">
        {plan.description}
      </p>

      <div className="mt-8 flex flex-col gap-4 border-t border-white/[0.08] pt-6">
        {plan.features.map((feature) => (
          <div key={feature.id} className="flex items-center gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              {feature.included ? (
                <CircleTick className="h-5 w-5" />
              ) : (
                <CrossMark className="h-4 w-4" />
              )}
            </span>
            <span
              className={`text-[14px] leading-snug ${
                feature.included
                  ? "text-slate-200 font-medium"
                  : "text-slate-500"
              }`}
            >
              {feature.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10">
        {onUpgrade ? (
          <button
            type="button"
            onClick={onUpgrade}
            className="cl-btn-primary h-[44px] w-full text-[14px]"
          >
            {plan.cta}
          </button>
        ) : (
          <div className="cl-btn-secondary h-[44px] w-full text-[14px] opacity-75 cursor-default">
            {plan.cta}
          </div>
        )}
      </div>
    </div>
  );
}
