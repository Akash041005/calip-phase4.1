import Navbar from "../../components/dashboard/Navbar";
import FoundersHero from "../../components/founders/FoundersHero";
import WhyRaiseOnCalip from "../../components/founders/WhyRaiseOnCalip";
import EligibilityCriteria from "../../components/founders/EligibilityCriteria";
import HowItWorks from "../../components/founders/HowItWorks";

export const metadata = {
  title: "Calip — For Founders",
  description:
    "List your startup on Calip to unlock transparent token auctions, AI-powered investor matching, and on-chain equity management all in one platform.",
};

export default function FoundersPage() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f5fb]">
      <Navbar activePage="founders" />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pb-16">
        <FoundersHero />
        <WhyRaiseOnCalip />
        <EligibilityCriteria />
        <HowItWorks />

        {/* MARKETPLACE BRIDGE BANNER */}
        <section className="mt-16 rounded-2xl border border-white/[0.08] bg-[#111318] p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.35)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="cl-kicker-label flex items-center gap-2 justify-center md:justify-start">
              <span className="cl-mint-dot" />
              Secondary Capital & Liquidity
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Ready to explore live market listings?
            </h2>
            <p className="text-[13.5px] text-slate-400 max-w-xl">
              Founders and investors connect directly on the Calip Marketplace. Browse active startup allocations, secondary trades, and peer-to-peer liquidity.
            </p>
          </div>

          <a
            href="/marketplace"
            className="cl-btn-primary px-6 py-3 text-[14px] whitespace-nowrap flex-shrink-0"
          >
            <span>Explore Marketplace</span>
            <span className="text-lg">→</span>
          </a>
        </section>
      </main>
    </div>
  );
}
