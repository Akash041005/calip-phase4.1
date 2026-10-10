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
    <div className="min-h-screen bg-[#080a0f] text-[#f4f5fb]">
      <Navbar />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(129,116,255,0.1)] border border-[rgba(129,116,255,0.2)] text-[12px] font-medium text-[#8174ff] mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[rgba(226,232,255,0.4)]" />
            AUCTION ARCHIVE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Completed Startup Auctions
          </h1>
          <p className="mt-1 text-sm text-[rgba(226,232,255,0.6)]">
            Explore concluded presales and startups that successfully graduated to the secondary marketplace.
          </p>
        </div>

        <div className="mb-6">
          <AuctionFilterTabs activeTab="closed" />
        </div>

        <div>
          {loading && (
            <div className="py-24 text-center">
              <div className="inline-block w-8 h-8 border-2 border-[rgba(129,116,255,0.2)] border-t-[#8174ff] rounded-full animate-spin mb-3" />
              <p className="text-sm text-[rgba(226,232,255,0.5)]">Loading concluded auctions...</p>
            </div>
          )}

          {error && (
            <div className="py-16 text-center">
              <p className="text-sm text-red-400 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-xl py-3 px-6 inline-block">{error}</p>
            </div>
          )}

          {!loading && !error && auctions.length === 0 && (
            <div className="py-20 text-center rounded-2xl border border-[rgba(226,232,255,0.06)] bg-[#111723]/60">
              <p className="text-base font-semibold text-white">No closed auctions</p>
              <p className="mt-1 text-sm text-[rgba(226,232,255,0.5)]">Past auctions will appear here once bonding curves conclude.</p>
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
