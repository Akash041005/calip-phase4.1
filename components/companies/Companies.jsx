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
    <div className="min-h-screen bg-[#fbfbf9] dark:bg-[#0c0e14]">
      <Navbar activePage="companies" />

      <main className="mx-auto max-w-[1440px] px-[16px] sm:px-[24px] lg:px-[40px] pb-8">
        <div className="pt-4">
          <h1 className="text-[22px] sm:text-[28px] font-bold leading-none text-[#1a1a2e] dark:text-white">
            Companies
          </h1>
          <p className="mt-[4px] text-[14px] sm:text-[16px] text-[#6b7280] dark:text-[#9ca3af]">
            All verified startups onboarded to the Calip platform.
          </p>
        </div>

        <div className="mt-[16px] sm:mt-[24px]">
          <div className="mb-[16px]">
            <input
              type="text"
              placeholder="Search startups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-[40px] w-full max-w-[400px] rounded-[10px] border border-[#e5e7eb] dark:border-[#2a2e3e] bg-white dark:bg-[#181c28] px-4 text-[14px] text-[#1a1a2e] dark:text-white placeholder:text-[#9ca3af] dark:placeholder:text-[#7c8190] outline-none transition-colors focus:border-[#6366f1]"
            />
          </div>

          {loading ? (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-[14px] text-[#6b7280] dark:text-[#9ca3af]">Loading startups...</p>
            </div>
          ) : error ? (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-[14px] text-[#ef4444]">{error}</p>
            </div>
          ) : (
            <CompaniesTable data={startups} />
          )}
        </div>
      </main>
    </div>
  );
}
