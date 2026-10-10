import { howItWorksSteps } from "./foundersMockData";

export default function HowItWorks() {
  return (
    <section className="mt-14 sm:mt-18">
      <div className="text-center">
        <h2 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-white">
          How It Works
        </h2>
        <p className="mt-1.5 text-[13.5px] text-[#a6adbf]">
          From onboarding to active on-chain community allocations in four streamlined steps.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {howItWorksSteps.map((step, idx) => (
          <div
            key={step.id}
            className="cl-card-interactive relative rounded-2xl border border-white/[0.08] bg-[#111318] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.35)] flex flex-col justify-between"
          >
            <div>
              <span className="inline-block font-mono text-[11px] font-bold text-white bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded">
                0{idx + 1}
              </span>
              <h3 className="mt-3 text-[16px] font-bold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
