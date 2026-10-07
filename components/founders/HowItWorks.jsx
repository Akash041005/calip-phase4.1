import { howItWorksSteps } from "./foundersMockData";

export default function HowItWorks() {
  return (
    <section className="mt-[60px] sm:mt-[80px] lg:mt-[110px]">
      <h2 className="text-center text-[32px] font-bold leading-[48px] tracking-[-0.5px] text-[#111827] dark:text-white">
        How it Works ?
      </h2>

      <div className="mt-[60px] flex flex-wrap justify-center gap-[32px]">
        {howItWorksSteps.map((step) => (
          <div
            key={step.id}
            className="min-h-[195px] h-auto w-[300px] max-w-full rounded-[20px] border border-[#e5e7eb] bg-white p-[26px] shadow-[0_2px_4px_0px_rgba(0,0,0,0.25)] dark:border-[#2a2e3e] dark:bg-[#181c28] dark:shadow-[0_2px_4px_0px_rgba(0,0,0,0.5)]"
          >
            <h3 className="text-[20px] font-semibold leading-[22.5px] text-[#111827] dark:text-white">
              {step.title}
            </h3>
            <p className="mt-[26px] max-w-[209px] text-[16px] leading-[20.8px] text-[#4b5563] dark:text-[#b0b5bf]">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
