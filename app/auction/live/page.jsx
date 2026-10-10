"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/dashboard/Navbar";
import AuctionFilterTabs from "../../../components/auction/AuctionFilterTabs";
import AuctionCard from "../../../components/auction/AuctionCard";
import { getActivePresales, isPresaleOpenForBidding } from "../../../lib/presalesApi";

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
    <div className="min-h-screen bg-[#080a0f] text-[#f4f5fb]">
      <Navbar activePage="auction" />

      <main className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="pt-8 pb-4 border-b border-white/[0.06]">
          <p className="cl-kicker-label">
            <span className="cl-mint-dot" />
            Live Auctions
          </p>
          <h1 className="mt-2 text-[32px] font-bold leading-tight text-white sm:text-[40px]">
            Auction
          </h1>
          <p className="mt-2 text-[14.5px] text-[#a6adbf]">
            Participate in live community auctions and invest in vetted early-stage startups.
          </p>
        </div>

        <div className="mt-6">
          <AuctionFilterTabs activeTab="live" />
        </div>

        <div className="mt-[24px]">
          {loading && (
            <p className="py-20 text-center text-[#6b7280] dark:text-[#9ca3af]">Loading auctions...</p>
          )}

          {error && (
            <p className="py-20 text-center text-[#ef4444]">{error}</p>
          )}

          {!loading && !error && auctions.length === 0 && (
            <p className="py-20 text-center text-[#6b7280] dark:text-[#9ca3af]">No auctions are open for bidding right now.</p>
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
