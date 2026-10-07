import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "../../../components/dashboard/Navbar";
import ApplicationForm from "../../../components/founders/ApplicationForm";

export const metadata = {
  title: "Calip — Create Token",
  description: "Register your startup and create its token on Calip Marketplace.",
};

export default function MarketplaceCreatePage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] dark:bg-[#0c0e14]">
      <Navbar activePage="marketplace" />
      <main className="mx-auto max-w-[1440px] px-4 pb-[80px] sm:px-6 lg:px-10">
        <Link
          href="/marketplace"
          className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6b7280] transition hover:text-[#1a1a2e] dark:text-[#9ca3af] dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>
        <p className="mt-4 text-center text-[12px] font-bold uppercase tracking-[0.24em] text-[#6366f1]">
          Step 1 · Startup Application
        </p>
        <ApplicationForm />
      </main>
    </div>
  );
}
