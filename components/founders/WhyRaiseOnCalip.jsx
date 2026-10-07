import { Globe, Sparkle } from "lucide-react";
import { raiseBenefits } from "./foundersMockData";

const benefitIcons = {
  sparkle: Sparkle,
  globe: Globe,
};

export default function WhyRaiseOnCalip() {
  return (
    <section className="mt-[80px] sm:mt-[100px] lg:mt-[140px]">
      <h2 className="text-center text-[32px] font-bold leading-[48px] tracking-[-0.5px] text-[#111827] dark:text-white">
        Why raise on Calip?
      </h2>

      <div className="mt-[50px] flex flex-wrap justify-center gap-x-[45px] gap-y-[62px]">
        {raiseBenefits.map((benefit) => {
          const Icon = benefitIcons[benefit.icon];
          return (
            <div
              key={benefit.id}
              className="min-h-[195px] h-auto w-[400px] max-w-full rounded-[20px] border border-[#e5e7eb] bg-white p-[22px] shadow-[0_2px_4px_0px_rgba(0,0,0,0.25)] dark:border-[#2a2e3e] dark:bg-[#181c28] dark:shadow-[0_2px_4px_0px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center gap-[10px]">
                <div className="relative h-[25px] w-[25px] shrink-0">
                  <div className="absolute inset-x-0 top-1/2 mx-auto h-[20px] w-[20px] -translate-y-1/2 rounded-[5px] border border-[#e5e7eb] bg-[#f4f5f7] dark:border-[#2a2e3e] dark:bg-[#1c202e]" />
                  <Icon
                    className="absolute left-[6px] top-[6px] h-[13px] w-[13px] text-[#6366f1]"
                    strokeWidth={2}
                  />
                </div>
                <h3 className="text-[15px] font-semibold leading-[22.5px] text-[#111827] dark:text-white">
                  {benefit.title}
                </h3>
              </div>

              <p className="mt-[16px] pl-[35px] text-[14px] leading-[20.8px] text-[#4b5563] dark:text-[#b0b5bf]">
                {benefit.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
