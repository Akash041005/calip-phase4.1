"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/dashboard/Navbar";
import AuctionFilterTabs from "../../../components/auction/AuctionFilterTabs";
import AuctionCard from "../../../components/auction/AuctionCard";
import {
  getActivePresales,
  getCompletedPresales,
  getUpcomingPresales,
  isPresaleEnded,
} from "../../../lib/presalesApi";

export default function AuctionClosedPage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCompletedPresales(), getActivePresales(), getUpcomingPresales()])
      .then((responses) => {
        if (!cancelled) {
          const rows = responses.flatMap((res) => {
            const data = res.data ?? res;
            return Array.isArray(data) ? data : [];
          });
          const uniqueRows = [...new Map(rows.map((item) => [item._id, item])).values()];
          setAuctions(uniqueRows.filter((item) => isPresaleEnded(item)));
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
    <div className="min-h-screen bg-[#090a0f] text-[#f4f5fb]">
      <Navbar activePage="auction" />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 border-b border-white/[0.08] pb-6">
          <p className="cl-kicker-label">
            <span className="cl-mint-dot" />
            Auction Archive & Concluded Rounds
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Completed Startup Auctions
          </h1>
          <p className="mt-1 text-sm text-[#94a3b8]">
            Explore concluded presales and startups that successfully graduated to the secondary marketplace.
          </p>
        </div>

        <div className="mb-6">
          <AuctionFilterTabs activeTab="closed" />
        </div>

        <div>
          {loading && (
            <div className="py-24 text-center">
              <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
              <p className="text-sm text-slate-400">Loading concluded auctions...</p>
            </div>
          )}

          {error && (
            <div className="py-16 text-center">
              <p className="text-sm text-red-400 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-xl py-3 px-6 inline-block">{error}</p>
            </div>
          )}

          {!loading && !error && auctions.length === 0 && (
            <div className="py-20 text-center rounded-2xl border border-white/[0.08] bg-[#111318]">
              <p className="text-base font-semibold text-white">No closed auctions</p>
              <p className="mt-1 text-sm text-slate-400">Past auctions will appear here once bonding curves conclude.</p>
            </div>
          )}

          {!loading && !error && auctions.length > 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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
