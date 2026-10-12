"use client";

import { useState, useEffect } from "react";
import Navbar from "../dashboard/Navbar";
import CompaniesTable from "./CompaniesTable";
import { searchStartups } from "../../lib/startupsApi";

export default function Companies() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Debounced search: previously every keystroke fired a fetch + 3 renders
  // (loading -> results -> loading false) with a loading flash.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      async function load() {
        setLoading(true);
        setError(null);
        try {
          const res = await searchStartups(searchQuery, 1, 100);
          if (!cancelled) setStartups(res?.startups || []);
        } catch (err) {
          if (!cancelled) setError(err?.message || "Failed to load startups");
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
      load();
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f8fafc]">
      <Navbar activePage="companies" />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pb-12">
        <div className="pt-6 border-b border-white/[0.08] pb-6">
          <p className="cl-kicker-label">
            <span className="cl-mint-dot" />
            Verified Registry
          </p>
          <h1 className="mt-2 text-[26px] sm:text-[32px] font-bold leading-tight text-white">
            Companies
          </h1>
          <p className="mt-1 text-[14px] text-[#94a3b8]">
            All verified startups and projects onboarded to the Calip ecosystem.
          </p>
        </div>

        <div className="mt-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search startups by name or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-[40px] w-full max-w-[420px] rounded-xl border border-white/[0.08] bg-[#0e1015] px-4 text-[13.5px] text-white placeholder:text-[#94a3b8] outline-none transition-colors focus:border-white/20 focus:bg-[#111318]"
            />
          </div>

          {loading ? (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-[13px] text-[#94a3b8]">Loading startups...</p>
            </div>
          ) : error ? (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-[13px] text-rose-400">{error}</p>
            </div>
          ) : (
            <CompaniesTable data={startups} />
          )}
        </div>
      </main>
    </div>
  );
}
