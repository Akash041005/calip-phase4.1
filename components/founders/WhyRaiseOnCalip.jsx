import { Globe, Sparkle } from "lucide-react";
import { raiseBenefits } from "./foundersContent";

const benefitIcons = {
  sparkle: Sparkle,
  globe: Globe,
};

export default function WhyRaiseOnCalip() {
  return (
    <section className="mt-14 sm:mt-18">
      <div className="text-center">
        <h2 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
          Why raise on Calip?
        </h2>
        <p className="mt-1.5 text-[13.5px] text-slate-600 dark:text-[#a6adbf] transition-colors">
          Traditional venture capital is fragmented and slow. Calip provides a frictionless liquidity highway.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {raiseBenefits.map((benefit) => {
          const Icon = benefitIcons[benefit.icon] || Sparkle;
          return (
            <div
              key={benefit.id}
              className="cl-card-interactive rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:border-slate-300 dark:border-white/[0.08] dark:bg-[#111318] dark:hover:border-white/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-800 dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white transition-colors">
                  <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                </div>
                <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white transition-colors">
                  {benefit.title}
                </h3>
              </div>

              <p className="mt-3.5 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400 transition-colors">
                {benefit.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
