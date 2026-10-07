"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../../components/dashboard/Navbar";
import TokenDetail from "../../../components/marketplace/TokenDetail";
import { getTokens } from "../../../lib/tradingApi";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../../../lib/usersApi";

export default function MarketplaceTokenPage() {
  const params = useParams();
  const id = params?.id;
  const [token, setToken] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getTokens({ search: id, limit: 50 })
      .then((res) => {
        if (cancelled) return;
        const items = res.items || [];
        const found = items.find((t) => t.id === id || t.startupId === id) || items[0] || null;
        setToken(found);
        setNotFound(!found);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getWatchlist()
      .then((res) => {
        if (cancelled) return;
        const items = res?.items || res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
        const found = items.some((w) => {
          const sid = w?._id || w?.id;
          return sid && (sid === id || (token && sid === token.startupId));
        });
        setWatched(found);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [id, token]);

  async function handleToggleWatch(adding) {
    if (!token) return;
    try {
      if (adding) {
        await addToWatchlist(token.startupId);
        setWatched(true);
      } else {
        await removeFromWatchlist(token.startupId);
        setWatched(false);
      }
    } catch {
      // WatchlistButton surfaces its own error state.
    }
  }

  return (
    <div className="min-h-screen bg-[#070a0f] text-[#f8fafc]">
      <Navbar activePage="marketplace" />
      <main className="pb-12">
        {notFound ? (
          <div className="mx-auto max-w-5xl px-4 py-20 text-center">
            <p className="text-base font-semibold text-white">Token not found.</p>
            <p className="mt-1 text-[13px] text-[#94a3b8]">
              It may have been removed, or the link is incorrect.
            </p>
          </div>
        ) : !token ? (
          <div className="mx-auto max-w-5xl px-4 py-20 text-center">
            <p className="text-[13px] text-[#94a3b8]">Loading token…</p>
          </div>
        ) : (
          <TokenDetail token={token} watched={watched} onToggleWatch={handleToggleWatch} />
        )}
      </main>
    </div>
  );
}
