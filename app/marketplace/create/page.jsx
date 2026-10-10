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
    <div className="min-h-screen bg-[#090a0f] text-[#f8fafc]">
      <Navbar activePage="marketplace" />
      <main className="mx-auto max-w-[1440px] px-4 pb-[80px] sm:px-6 lg:px-10">
        <Link
          href="/marketplace"
          className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>
        <div className="mt-6 text-center">
          <p className="cl-kicker-label">
            <span className="cl-mint-dot" />
            Step 1 · Startup Token Application
          </p>
          <h1 className="mt-2 text-[28px] sm:text-[34px] font-bold text-white tracking-tight">
            Register Startup Token
          </h1>
          <p className="mt-1 text-[13.5px] text-[#94a3b8]">
            Submit your startup to begin the automated token onboarding and verification process.
          </p>
        </div>
        <ApplicationForm />
      </main>
    </div>
  );
}
