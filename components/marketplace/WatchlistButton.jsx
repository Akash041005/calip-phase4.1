"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { addToWatchlist, removeFromWatchlist } from "../../lib/usersApi";

// Reusable watchlist toggle. Structured for the real backend:
// same props + labels work unchanged once lib/*Api reconnects.
export default function WatchlistButton({
  startupId,
  startupName,
  watched,
  onToggle,
  showLabel = true,
  className = "",
}) {
  const [status, setStatus] = useState("idle"); // idle | adding | removing | error

  async function handleClick(e) {
    e.stopPropagation();
    if (!startupId || status === "adding" || status === "removing") return;
    const adding = !watched;
    setStatus(adding ? "adding" : "removing");
    try {
      if (adding) {
        await addToWatchlist(startupId);
      } else {
        await removeFromWatchlist(startupId);
      }
      onToggle?.(adding);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  const busy = status === "adding" || status === "removing";

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        aria-label={watched ? `Remove ${startupName} from watchlist` : `Add ${startupName} to watchlist`}
        title={watched ? "In Watchlist" : "Add to Watchlist"}
        className={`inline-flex items-center gap-1.5 rounded-xl border text-[12px] font-semibold transition disabled:opacity-60 ${
          watched
            ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-3 py-1.5"
            : "border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:border-slate-300 hover:text-slate-900 shadow-xs dark:border-white/[0.08] dark:bg-[#111318] dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
        } ${className}`}
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-700 dark:text-white" />
        ) : (
          <Star className={`h-3.5 w-3.5 ${watched ? "fill-emerald-500 text-emerald-500" : ""}`} />
        )}
        {showLabel && <span>{busy ? (watched ? "Removing..." : "Adding...") : watched ? "In Watchlist" : "Add to Watchlist"}</span>}
      </button>
      {status === "error" && (
        <span className="text-[11px] text-rose-400">Could not update. Try again.</span>
      )}
    </span>
  );
}
