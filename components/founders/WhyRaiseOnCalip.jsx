import { Globe, Sparkle } from "lucide-react";
import { raiseBenefits } from "./foundersMockData";

const benefitIcons = {
  sparkle: Sparkle,
  globe: Globe,
};

export default function WhyRaiseOnCalip() {
  return (
    <section className="mt-14 sm:mt-18">
      <div className="text-center">
        <h2 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-white">
          Why raise on Calip?
        </h2>
        <p className="mt-1.5 text-[13.5px] text-[#a6adbf]">
          Traditional venture capital is fragmented and slow. Calip provides a frictionless liquidity highway.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {raiseBenefits.map((benefit) => {
          const Icon = benefitIcons[benefit.icon] || Sparkle;
          return (
            <div
              key={benefit.id}
              className="cl-card-interactive rounded-2xl border border-white/[0.08] bg-[#111318] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.35)] group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.08] text-white">
                  <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                </div>
                <h3 className="text-[15px] font-semibold text-white">
                  {benefit.title}
                </h3>
              </div>

              <p className="mt-3.5 text-[13px] leading-relaxed text-slate-400">
                {benefit.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
