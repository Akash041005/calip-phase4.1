import { Sora } from "next/font/google";
import Navbar from "../../components/dashboard/Navbar";
import Footer from "../../components/dashboard/Footer";
import ProHero from "../../components/pro/ProHero";
import PricingSection from "../../components/pro/PricingSection";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Calip — Pro",
  description:
    "Unlock the full power of investing with Calip Pro. Get AI-powered analysis, advanced portfolio analytics, and priority access to the best deals on Calip.",
};

export default function ProPage() {
  return (
    <div className={`${sora.className} min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#090a0f] dark:text-white transition-colors`}>
      <Navbar />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pb-[80px]">
        <ProHero />
        <PricingSection />
      </main>

      <Footer />
    </div>
  );
}
