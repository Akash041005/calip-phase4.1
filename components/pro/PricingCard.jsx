"use client";

function CircleTick({ className }) {
  return (
    <svg
      viewBox="0 0 20.2503 20.2309"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M19.5001 11.2302C18.7501 14.9802 15.9228 18.5107 11.9541 19.3001C7.98544 20.0895 3.95812 18.2435 1.96556 14.7216C-0.0269939 11.1999 0.464916 6.79703 3.1856 3.80181C5.90629 0.80656 10.5001 -0.0197598 14.2501 1.48024"
        stroke="#16A34A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.75014 9.73022L10.5001 13.4802L19.5001 3.73022"
        stroke="#16A34A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossMark({ className }) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10.7665 9.001L16.884 2.884C17.1117 2.64825 17.2377 2.33249 17.2348 2.00475C17.232 1.677 17.1005 1.36349 16.8688 1.13173C16.637 0.899967 16.3235 0.768505 15.9958 0.765657C15.668 0.762809 15.3523 0.888802 15.1165 1.1165L8.999 7.2335L2.882 1.1165C2.64759 0.882161 2.32971 0.750517 1.99825 0.750517C1.66679 0.750517 1.34891 0.882161 1.1145 1.1165C0.880161 1.35091 0.748517 1.66879 0.748517 2.00025C0.748517 2.33171 0.880161 2.64959 1.1145 2.884L7.2315 9.001L1.1005 15.1325C0.925319 15.3072 0.805947 15.5299 0.757518 15.7725C0.709089 16.0151 0.733786 16.2666 0.828476 16.4951C0.923166 16.7236 1.08359 16.9189 1.28939 17.0561C1.4952 17.1934 1.73713 17.2664 1.9845 17.266C2.3045 17.266 2.6245 17.144 2.8685 16.9L8.9995 10.7685L15.1165 16.8855C15.2326 17.0016 15.3704 17.0936 15.5221 17.1564C15.6738 17.2192 15.8363 17.2515 16.0005 17.2515C16.2477 17.2514 16.4893 17.1781 16.6948 17.0408C16.9002 16.9035 17.0604 16.7083 17.155 16.48C17.2496 16.2516 17.2744 16.0004 17.2263 15.758C17.1781 15.5155 17.0592 15.2928 16.8845 15.118L10.7665 9.001Z"
        fill="#DD2E44"
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
      className={`flex w-full max-w-[580px] flex-col rounded-[20px] px-[24px] sm:px-[42px] pb-[27px] pt-[19.5px] ${
        isFree
          ? "bg-white dark:bg-[#181c28] dark:border dark:border-[#2a2e3e]"
          : "bg-[linear-gradient(212.865deg,rgba(123,58,237,0.92)_32.012%,rgba(115,65,229,0.96)_66.439%,rgba(176,163,221,0.91)_104.62%)]"
      }`}
    >
      <span
        className={`font-sans text-[14px] font-semibold uppercase leading-none tracking-[0.5px] ${
          isFree ? "text-[#9ca3af]" : "text-white"
        }`}
      >
        {plan.name}
      </span>

      <div className="mt-[9px] flex items-baseline leading-[54px]">
        <span
          className={`font-sans text-[36px] font-extrabold leading-[54px] ${
            isFree ? "text-[#111827]" : "text-white"
          }`}
        >
          {price}
        </span>
        {plan.divider && (
          <span
            className={`font-sans text-[36px] font-extrabold leading-[54px] ${
              isFree ? "text-[#111827]" : "text-[#f4f5f7]"
            }`}
          >
            {plan.divider}
          </span>
        )}
        {suffix && (
          <span
            className={`ml-[4px] font-sans text-[16px] font-extrabold leading-[54px] ${
              isFree ? "text-[#111827]" : "text-[#f4f5f7]"
            }`}
          >
            {suffix}
          </span>
        )}
      </div>

      <p
        className={`mt-[10px] font-sans text-[14px] leading-[22.4px] ${
          isFree ? "text-[#4b5563]" : "text-white"
        }`}
      >
        {plan.description}
      </p>

      <div className="mt-[68px] flex flex-col gap-[25px] pl-[6px]">
        {plan.features.map((feature) => (
          <div key={feature.id} className="flex h-[21px] items-center gap-[2px]">
            <span className="flex h-[21px] w-[24px] shrink-0 items-center justify-center">
              {feature.included ? (
                <CircleTick className="h-[24px] w-[24px]" />
              ) : (
                <CrossMark className="h-[18px] w-[18px]" />
              )}
            </span>
            <span
              className={`font-sans text-[16px] sm:text-[20px] leading-[21px] ${
                feature.included
                  ? isFree
                    ? "text-[#4b5563] dark:text-[#b0b5bf]"
                    : "text-white"
                  : "text-[#cbcfd4]"
              }`}
            >
              {feature.label}
            </span>
          </div>
        ))}
      </div>

      {onUpgrade ? (
        <button
          type="button"
          onClick={onUpgrade}
          className="mx-auto mt-[26.5px] flex h-[52.389px] w-full max-w-[516.518px] items-center justify-center rounded-[20px] bg-[#f4f5f7] text-[16px] sm:text-[20px] font-bold leading-none text-[#4b5563] transition-colors hover:bg-[#e5e7eb] dark:bg-[#1c202e] dark:text-white dark:hover:bg-[#242838]"
        >
          {plan.cta}
        </button>
      ) : (
        <div className="mx-auto mt-[26.5px] flex h-[52.389px] w-full max-w-[516.518px] items-center justify-center rounded-[20px] bg-[#f4f5f7] dark:bg-[#1c202e]">
          <span className="text-[16px] sm:text-[20px] font-semibold leading-none text-[#4b5563] dark:text-white">
            {plan.cta}
          </span>
        </div>
      )}
    </div>
  );
}
