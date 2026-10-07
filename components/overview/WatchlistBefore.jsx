import { Plus } from "lucide-react";
import Link from "next/link";
import Navbar from "../dashboard/Navbar";

export default function WatchlistBefore() {
  return (
    <div className="min-h-screen bg-[#fbfbf9] dark:bg-[#0c0e14]">
      <Navbar />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pb-8">
        <div className="pt-4">
          <h1 className="text-[28px] font-bold leading-none text-[#1a1a2e] dark:text-white">
            Watchlist
          </h1>
          <p className="mt-[4px] text-[16px] text-[#6b7280] dark:text-[#9ca3af]">
            Track your saved companies and stay updated on their auction activity.
          </p>
        </div>

        <div className="mt-[48px] flex justify-center">
          <Link
            href="/companies"
            className="flex h-[44px] w-[240px] items-center justify-center gap-2 rounded-lg bg-[#6366f1] text-white transition-colors hover:bg-[#5558e3]"
          >
            <Plus className="h-[20px] w-[20px]" strokeWidth={1.5} />
            <span className="text-[15px] font-semibold leading-none">Add companies</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
