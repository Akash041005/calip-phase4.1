import { Sora } from "next/font/google";
import Navbar from "../../components/dashboard/Navbar";
import FoundersHero from "../../components/founders/FoundersHero";
import WhyRaiseOnCalip from "../../components/founders/WhyRaiseOnCalip";
import EligibilityCriteria from "../../components/founders/EligibilityCriteria";
import HowItWorks from "../../components/founders/HowItWorks";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Calip — For Founders",
  description:
    "List your startup on Calip to unlock transparent token auctions, AI-powered investor matching, and on-chain equity management all in one platform.",
};

export default function FoundersPage() {
  return (
    <div
      className={`${sora.className} min-h-screen bg-[#fafaf8] dark:bg-[#0c0e14]`}
    >
      <Navbar activePage="founders" />

      <main className="mx-auto max-w-[1440px] px-[40px] pb-[80px]">
        <FoundersHero />
        <WhyRaiseOnCalip />
        <EligibilityCriteria />
        <HowItWorks />

        {/* MARKETPLACE BRIDGE BANNER */}
        <section className="mt-16 rounded-2xl border border-[#1a2436] bg-gradient-to-r from-[#0e1626] via-[#101b30] to-[#161338] p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[12px] font-bold text-[#818cf8] uppercase tracking-wider">
              Secondary Capital & Liquidity
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Ready to explore live market listings?
            </h2>
            <p className="text-[14px] text-[#94a3b8] max-w-xl">
              Founders and investors connect directly on the Calip Marketplace. Browse active startup allocations, secondary trades, and peer-to-peer liquidity.
            </p>
          </div>

          <a
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-xl bg-[#6366f1] px-6 py-3 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:bg-[#5254e4] transition whitespace-nowrap flex-shrink-0"
          >
            <span>Explore Marketplace</span>
            <span className="text-lg">→</span>
          </a>
        </section>
      </main>
    </div>
  );
}
