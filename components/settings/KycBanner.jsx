import { Shield } from "lucide-react";
import SettingsCard from "./SettingsCard";

export default function KycBanner() {
  return (
    <SettingsCard className="border-[#452f0d]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-[35px] py-[19px]">
        <div className="flex h-[59px] w-[58px] shrink-0 items-center justify-center rounded-[20px] bg-[#6450ea]">
          <Shield className="h-[34px] w-[35px] text-white" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[14px] sm:text-[16px] font-semibold leading-none text-black">
            Identity Verification (KYC)
          </p>
          <p className="mt-[6px] text-[12px] leading-none text-[#6878a0]">
            Verify your identity to unlock higher limits
          </p>
          <span className="mt-[8px] inline-flex h-[21px] w-[126px] items-center justify-center rounded-[5px] border border-[#3c3184] bg-[#6551ED] text-[9px] font-bold uppercase tracking-wide text-white">
            Not Verified
          </span>
        </div>

        <button
          type="button"
          className="flex h-[40px] w-full sm:w-[205px] shrink-0 items-center justify-center rounded-[20px] bg-[#6651F1] text-[12px] sm:text-[13px] font-semibold text-white transition-colors hover:bg-[#5741dc]"
        >
          Start Verification
        </button>
      </div>
    </SettingsCard>
  );
}
