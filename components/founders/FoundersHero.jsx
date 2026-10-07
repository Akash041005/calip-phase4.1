import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function FoundersHero() {
  return (
    <section className="pt-[40px]">
      <p className="text-center text-[24px] font-semibold text-black dark:text-white">
        For Founders
      </p>

      <h1 className="mt-[20px] text-center text-[32px] sm:text-[42px] lg:text-[48px] font-bold leading-[1.1] text-[#6051b4]">
        Calip
      </h1>
      <p className="text-center text-[24px] sm:text-[30px] lg:text-[36px] font-bold leading-[1.3] text-[#c39fe3]">
        Web 3 investment for start ups
      </p>

      <p className="mx-auto mt-[16px] max-w-[520px] text-center text-[20px] font-bold leading-[30px] text-[#4b5563] dark:text-[#b0b5bf]">
        List your startup on Calip to unlock transparent token auctions,
        AI-powered investor matching, and on-chain equity management all in one
        platform.
      </p>

      <div className="mt-[40px] flex flex-wrap items-center justify-center gap-3.5">
        <Link
          href="/marketplace"
          className="inline-flex h-[44px] px-6 items-center justify-center gap-[8px] rounded-[10px] bg-[#6366f1] text-[14px] font-semibold text-white transition-colors hover:bg-[#5346ae] shadow-lg shadow-[#6366f1]/20"
        >
          Explore Marketplace
          <ArrowRight className="h-[14px] w-[14px]" strokeWidth={2} />
        </Link>

        <Link
          href="/marketplace/create"
          className="inline-flex h-[44px] px-6 items-center justify-center gap-[8px] rounded-[10px] border border-[#6366f1]/40 bg-[#6366f1]/10 text-[14px] font-semibold text-[#818cf8] hover:bg-[#6366f1] hover:text-white transition-all shadow-sm"
        >
          Create Token
          <ExternalLink className="h-[14px] w-[14px]" strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
}
