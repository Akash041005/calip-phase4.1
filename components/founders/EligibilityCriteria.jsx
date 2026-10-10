import { CheckCircle2 } from "lucide-react";
import { eligibilityCriteria } from "./foundersMockData";

export default function EligibilityCriteria() {
  return (
    <section className="mt-14 sm:mt-18">
      <div className="text-center">
        <h2 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-white">
          Eligibility Criteria
        </h2>
        <p className="mt-1.5 text-[13.5px] text-[#a6adbf]">
          We welcome high-momentum teams across all sectors. Here is what we evaluate during onboarding.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-3xl space-y-3">
        {eligibilityCriteria.map((item) => (
          <div
            key={item}
            className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-[#111318] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.25)] hover:border-white/20 transition-all"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="text-[14px] font-medium text-white">
              {item}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
