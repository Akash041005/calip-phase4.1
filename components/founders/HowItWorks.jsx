import { howItWorksSteps } from "./foundersContent";

export default function HowItWorks() {
  return (
    <section className="mt-14 sm:mt-18">
      <div className="text-center">
        <h2 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
          How It Works
        </h2>
        <p className="mt-1.5 text-[13.5px] text-slate-600 dark:text-[#a6adbf] transition-colors">
          From onboarding to active on-chain community allocations in four streamlined steps.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {howItWorksSteps.map((step, idx) => (
          <div
            key={step.id}
            className="cl-card-interactive relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:border-slate-300 dark:border-white/[0.08] dark:bg-[#111318] dark:hover:border-white/20 transition-all flex flex-col justify-between"
          >
            <div>
              <span className="inline-block font-mono text-[11px] font-bold text-slate-800 bg-slate-100 border border-slate-200 dark:text-white dark:bg-white/[0.06] dark:border-white/[0.08] px-2 py-0.5 rounded transition-colors">
                0{idx + 1}
              </span>
              <h3 className="mt-3 text-[16px] font-bold text-slate-900 dark:text-white transition-colors">
                {step.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400 transition-colors">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
