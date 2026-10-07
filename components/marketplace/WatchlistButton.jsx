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
        className={`inline-flex items-center gap-1.5 rounded-lg border text-[12px] font-semibold transition disabled:opacity-60 ${
          watched
            ? "border-[#6366f1]/50 bg-[#6366f1]/15 px-3 py-1.5 text-[#818cf8]"
            : "border-white/10 bg-white/5 px-3 py-1.5 text-neutral-300 hover:border-[#6366f1]/50 hover:text-white"
        } ${className}`}
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Star className={`h-3.5 w-3.5 ${watched ? "fill-[#818cf8]" : ""}`} />
        )}
        {showLabel && <span>{busy ? (watched ? "Removing..." : "Adding...") : watched ? "In Watchlist" : "Add to Watchlist"}</span>}
      </button>
      {status === "error" && (
        <span className="text-[11px] text-rose-400">Could not update. Try again.</span>
      )}
    </span>
  );
}
