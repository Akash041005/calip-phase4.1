import { Shield } from "lucide-react";
import SettingsCard from "./SettingsCard";

export default function KycBanner() {
  return (
    <SettingsCard>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
            <Shield className="h-5 w-5 text-white" strokeWidth={1.5} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-semibold text-white">
                Identity Verification (KYC)
              </p>
              <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                Not Verified
              </span>
            </div>
            <p className="mt-1 text-[13px] text-slate-400">
              Verify your identity to unlock institutional limits and direct investment rounds.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="cl-btn-primary h-9 px-5 text-[13px] w-full sm:w-auto"
        >
          Start Verification
        </button>
      </div>
    </SettingsCard>
  );
}
