import { Plus } from "lucide-react";
import Link from "next/link";
import Navbar from "../dashboard/Navbar";

export default function WatchlistBefore() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f8fafc]">
      <Navbar />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pb-12">
        <div className="pt-4">
          <h1 className="text-[28px] font-extrabold tracking-tight text-white">
            Watchlist
          </h1>
          <p className="mt-1 text-[15px] text-slate-400">
            Track your saved companies and stay updated on their auction activity.
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/companies"
            className="cl-btn-primary flex h-[44px] w-[240px] items-center justify-center gap-2 text-[15px] font-semibold"
          >
            <Plus className="h-5 w-5" strokeWidth={1.5} />
            <span>Add companies</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
