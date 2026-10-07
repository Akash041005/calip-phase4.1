"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../../components/dashboard/Navbar";
import TokenDetailOverview from "../../../components/overview/TokenDetailOverview";
import { getAIInsights } from "../../../lib/insightsApi";
import { getStartupById } from "../../../lib/startupsApi";
import { getAnalyticsStartup } from "../../../lib/analyticsApi";

export default function InsightsPage() {
  const params = useParams();
  const id = params?.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [insightsRes, startupRes] = await Promise.allSettled([
          getAIInsights(id).catch(() => getAnalyticsStartup(id)),
          getStartupById(id).catch(() => null),
        ]);

        if (cancelled) return;

        const insightsData =
          insightsRes.status === "fulfilled"
            ? insightsRes.value?.data || insightsRes.value
            : null;

        const startupData =
          startupRes.status === "fulfilled"
            ? startupRes.value?.startup || startupRes.value?.data || startupRes.value
            : null;

        const merged = {
          ...(startupData || {}),
          ...(insightsData || {}),
          startupName:
            insightsData?.startupName ||
            startupData?.startupName ||
            "Startup Overview",
          industrySector:
            insightsData?.category ||
            startupData?.industrySector ||
            startupData?.category ||
            "Web3 Tech",
          currentStartupValuation:
            insightsData?.valuation ||
            startupData?.funding?.valuation ||
            startupData?.currentStartupValuation,
        };

        setData(merged);
      } catch {
        // Graceful fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-[#070a0f] text-[#f8fafc]">
      <Navbar activePage="companies" />

      <main className="pb-12">
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-[14px] text-[#6366F1] font-mono animate-pulse">Loading Company Overview...</p>
          </div>
        ) : (
          <TokenDetailOverview tokenId={id} startupData={data} />
        )}
      </main>
    </div>
  );
}
