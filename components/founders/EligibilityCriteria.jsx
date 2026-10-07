import { CircleCheck } from "lucide-react";
import { eligibilityCriteria } from "./foundersMockData";

export default function EligibilityCriteria() {
  return (
    <section className="mt-[70px] sm:mt-[90px] lg:mt-[120px]">
      <h2 className="text-center text-[32px] font-bold leading-[48px] tracking-[-0.5px] text-[#111827] dark:text-white">
        Eligibility criteria
      </h2>

      <p className="mx-auto mt-[36px] max-w-[1000px] text-center text-[16px] sm:text-[22px] md:text-[28px] leading-[1.3] text-[#4b5563] dark:text-[#b0b5bf]">
        We welcome startups from all industries and geographies.
        Here&apos;s what we look for when reviewing applications.
      </p>

      <ul className="mx-auto mt-[60px] max-w-[900px] space-y-[46px]">
        {eligibilityCriteria.map((item) => (
          <li key={item} className="flex items-center gap-[20px] sm:gap-[30px] lg:gap-[43px]">
            <CircleCheck
              className="h-[24px] w-[24px] shrink-0 text-[#10b981]"
              strokeWidth={2}
            />
            <span className="text-[16px] sm:text-[20px] lg:text-[24px] leading-[normal] text-[#4b5563] dark:text-[#b0b5bf]">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
