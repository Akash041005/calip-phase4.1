"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/dashboard/Navbar";
import AuctionFilterTabs from "../../../components/auction/AuctionFilterTabs";
import AuctionCard from "../../../components/auction/AuctionCard";
import { getUpcomingPresales } from "../../../lib/presalesApi";

export default function AuctionUpcomingPage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getUpcomingPresales()
      .then((res) => {
        if (!cancelled) setAuctions(res.data ?? res);
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
    <div className="min-h-screen bg-[#fbfbf9] dark:bg-[#0c0e14]">
      <Navbar />

      <main className="mx-auto max-w-[1440px] px-[16px] sm:px-[24px] lg:px-[40px] pb-8">
        <div className="pt-5">
          <h1 className="text-[28px] font-bold leading-none text-[#1a1a2e] dark:text-white">
            Auction
          </h1>
          <p className="mt-[4px] text-[16px] text-[#6b7280] dark:text-[#9ca3af]">
            Participate in live auctions and invest in vetted early-stage
            startups.
          </p>
        </div>

        <div className="mt-[16px]">
          <AuctionFilterTabs activeTab="upcoming" />
        </div>

        <div className="mt-[24px]">
          {loading && (
            <p className="py-20 text-center text-[#6b7280] dark:text-[#9ca3af]">Loading auctions...</p>
          )}

          {error && (
            <p className="py-20 text-center text-[#ef4444]">{error}</p>
          )}

          {!loading && !error && auctions.length === 0 && (
            <p className="py-20 text-center text-[#6b7280] dark:text-[#9ca3af]">No auctions found</p>
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
    </div>
  );
}
