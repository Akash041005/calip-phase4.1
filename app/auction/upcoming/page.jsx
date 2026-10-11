"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/dashboard/Navbar";
import AuctionFilterTabs from "../../../components/auction/AuctionFilterTabs";
import AuctionCard from "../../../components/auction/AuctionCard";
import { getUpcomingPresales, isPresaleEnded } from "../../../lib/presalesApi";

import Footer from "../../../components/dashboard/Footer";

export default function AuctionUpcomingPage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getUpcomingPresales()
      .then((res) => {
        if (!cancelled) {
          const rows = res.data ?? res;
          setAuctions(Array.isArray(rows) ? rows.filter((item) => !isPresaleEnded(item)) : []);
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#090a0f] dark:text-[#f4f5fb] transition-colors">
      <Navbar activePage="auction" />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 border-b border-slate-200 dark:border-white/[0.08] pb-6">
          <p className="cl-kicker-label">
            <span className="cl-mint-dot" />
            Upcoming Launches & Presales
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Upcoming Startup Auctions
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-[#94a3b8]">
            Preview pending auctions and get ready before the on-chain bonding curves open.
          </p>
        </div>

        <div className="mb-6">
          <AuctionFilterTabs activeTab="upcoming" />
        </div>

        <div>
          {loading && (
            <div className="py-24 text-center">
              <div className="inline-block w-8 h-8 border-2 border-slate-300 border-t-slate-900 dark:border-white/20 dark:border-t-white rounded-full animate-spin mb-3" />
              <p className="text-sm text-slate-500 dark:text-[#94a3b8]">Loading upcoming auctions...</p>
            </div>
          )}

          {error && (
            <div className="py-16 text-center">
              <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 dark:text-red-400 dark:bg-[rgba(239,68,68,0.1)] dark:border-[rgba(239,68,68,0.2)] rounded-xl py-3 px-6 inline-block">{error}</p>
            </div>
          )}

          {!loading && !error && auctions.length === 0 && (
            <div className="py-20 text-center rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-white/[0.08] dark:bg-[#111318]">
              <p className="text-base font-semibold text-slate-900 dark:text-white">No upcoming auctions</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Stay tuned for new startup drops and primary presales.</p>
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

      <Footer />
    </div>
  );
}
