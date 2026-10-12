"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/dashboard/Navbar";
import AuctionFilterTabs from "../../../components/auction/AuctionFilterTabs";
import AuctionCard from "../../../components/auction/AuctionCard";
import { getActivePresales, isPresaleOpenForBidding } from "../../../lib/presalesApi";

import Footer from "../../../components/dashboard/Footer";

export default function AuctionLivePage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getActivePresales()
      .then((res) => {
        if (!cancelled) {
          const rows = res.data ?? res;
          setAuctions(Array.isArray(rows) ? rows.filter((item) => isPresaleOpenForBidding(item)) : []);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load auctions");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#090a0f] dark:text-[#f8fafc] transition-colors">
      <Navbar activePage="auction" />

      <main className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="pt-8 pb-4 border-b border-slate-200 dark:border-white/[0.06]">
          <p className="cl-kicker-label">
            <span className="cl-mint-dot" />
            Live Auctions
          </p>
          <h1 className="mt-2 text-[32px] font-bold leading-tight text-slate-900 dark:text-white sm:text-[40px]">
            Auction
          </h1>
          <p className="mt-2 text-[14.5px] text-slate-600 dark:text-[#a6adbf]">
            Participate in live community auctions and invest in vetted early-stage startups.
          </p>
        </div>

        <div className="mt-6">
          <AuctionFilterTabs activeTab="live" />
        </div>

        <div className="mt-[24px]">
          {loading && (
            <p className="py-20 text-center text-slate-500 dark:text-[#9ca3af]">Loading auctions...</p>
          )}

          {error && (
            <p className="py-20 text-center text-rose-500">{error}</p>
          )}

          {!loading && !error && auctions.length === 0 && (
            <div className="py-20 text-center rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#111318]">
              <p className="text-base font-semibold text-slate-900 dark:text-white">No active auctions</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-[#9ca3af]">No auctions are open for bidding right now.</p>
            </div>
          )}

          {!loading && !error && auctions.length > 0 && (
            <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 xl:grid-cols-3">
              {auctions.map((item) => (
                <AuctionCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
