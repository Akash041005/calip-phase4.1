"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { placePresaleBid, getPresaleBids } from "../../lib/presalesApi";
import { X, Check, Gavel } from "lucide-react";
import ModalPortal from "../ui/ModalPortal";
import TokenSparkline from "../marketplace/TokenSparkline";
import { useAuth } from "../auth/AuthProvider";

const badgeStyles = {
  live: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  upcoming: "border border-white/[0.08] bg-[#0e1015] text-[#94a3b8]",
  closed: "border border-white/[0.06] bg-[#0e1015] text-[#64748b]",
};

const buttonConfig = {
  live: { label: "Place Bid", className: "cl-btn-primary" },
  upcoming: { label: "Notify Me", className: "rounded-xl border border-white/[0.08] bg-[#111318] text-white hover:border-white/20 transition-colors" },
  closed: { label: "View Details", className: "rounded-xl border border-white/[0.06] bg-[#0e1015] text-[#64748b] cursor-not-allowed" },
};

function formatINR(value) {
  if (value == null) return "₹0";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function mapStatus(item) {
  const raw = item.status;
  const now = Date.now();
  const startDate = item.startDate ? new Date(item.startDate).getTime() : null;
  const endDate = item.endDate ? new Date(item.endDate).getTime() : null;

  if ((raw === "completed" || raw === "cancelled") || (Number.isFinite(endDate) && endDate < now)) return "closed";
  if (raw === "active" && Number.isFinite(startDate) && startDate > now) return "upcoming";
  if (raw === "completed") return "closed";
  if (raw === "active") return "live";
  return raw || "live";
}

export default function AuctionCard({ item }) {
  const router = useRouter();
  const { isAuthenticated, openConnectModal } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("10");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [bids, setBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(true);
  const [prevItemId, setPrevItemId] = useState(item._id);
  if (item._id !== prevItemId) {
    setPrevItemId(item._id);
    setBidsLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    getPresaleBids(item._id)
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : res?.data || res?.bids || [];
        setBids(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setBids([]);
      })
      .finally(() => {
        if (!cancelled) setBidsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [item._id]);

  const lastBid = bids.length > 0 ? bids[bids.length - 1] : null;
  const bidTrend = bids.map((b) => Number(b.bidAmount) || 0);

  const companyName = item.startupId?.startupName || item.title || "Startup";
  const logoLetter = companyName.charAt(0).toUpperCase();
  const sector = item.startupId?.industrySector || item.startupId?.category || "Tech";
  const description = item.description || "";
  const status = mapStatus(item);
  const currentBid = formatINR(item.tokenPrice);
  const targetAmount = formatINR((item.totalTokens || 0) * (item.tokenPrice || 0));
  const avgBid = formatINR(item.tokenPrice);
  const equityPercent =
    item.totalTokens > 0
      ? `${(((item.soldTokens || 0) / item.totalTokens) * 100).toFixed(1)}`
      : "N/A";
  const progressPercent =
    item.totalTokens > 0 ? ((item.soldTokens || 0) / item.totalTokens) * 100 : 0;

  const badge = badgeStyles[status];
  const button = buttonConfig[status];

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!bidAmount || !tokenAmount) return;
    const amount = Number(bidAmount);
    const tokens = Number(tokenAmount);
    const minInvestment = Number(item.minInvestment) || 0;
    const maxInvestment = Number(item.maxInvestment) || 0;
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(tokens) || tokens <= 0) {
      setErrorMsg("Enter a valid positive bid amount and token quantity.");
      return;
    }
    if (amount < minInvestment || (maxInvestment > 0 && amount > maxInvestment)) {
      setErrorMsg(
        `Bid amount must be between ${formatINR(minInvestment)} and ${maxInvestment > 0 ? formatINR(maxInvestment) : "no maximum"}.`
      );
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await placePresaleBid(item._id, {
        bidAmount: Number(bidAmount),
        tokenAmount: Number(tokenAmount),
      });
      setSuccessMsg("Bid placed successfully!");
      getPresaleBids(item._id)
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.data || res?.bids || [];
          if (Array.isArray(list)) setBids(list);
        })
        .catch(() => {});
      setTimeout(() => {
        setModalOpen(false);
        setSuccessMsg("");
        setBidAmount("");
      }, 1500);
    } catch (err) {
      setErrorMsg(err?.message || "Failed to place bid");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative flex w-full flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:-translate-y-0.5 dark:border-white/[0.08] dark:bg-[#111318] dark:hover:border-white/[0.18]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-[16px] font-bold text-slate-800 shadow-xs dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white">
              {logoLetter}
            </div>
            <div className="min-w-0">
              <h3
                onClick={() => {
                  const sid = item.startupId?._id || item.startupId?.id;
                  if (sid) router.push(`/insights/${sid}`);
                }}
                title={`Open ${companyName} overview`}
                className="truncate cursor-pointer text-[15px] font-semibold text-slate-900 transition-colors hover:text-slate-700 dark:text-white dark:hover:text-zinc-200"
              >
                {companyName}
              </h3>
              <span className="text-[12px] text-slate-500 dark:text-[#94a3b8]">
                {sector}
              </span>
            </div>
          </div>

          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-semibold ${
            status === "live"
              ? "bg-emerald-50 border border-emerald-500/30 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
              : "border border-slate-200 bg-slate-50 text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-[#94a3b8]"
          }`}>
            {status === "live" && <span className="cl-mint-dot !w-1.5 !h-1.5" />}
            {status === "live" ? "Live" : status === "upcoming" ? "Coming soon" : "Closed"}
          </div>
        </div>

        <p className="mt-3.5 line-clamp-2 text-[13px] leading-relaxed text-slate-600 dark:text-[#94a3b8]">
          {description}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 dark:border-white/[0.06] dark:bg-[#0e1015]">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-500 font-semibold">Current Bid</p>
            <p className="text-[14px] font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">
              {currentBid}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 dark:border-white/[0.06] dark:bg-[#0e1015]">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-500 font-semibold">Target</p>
            <p className="text-[14px] font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">
              {targetAmount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 dark:border-white/[0.06] dark:bg-[#0e1015]">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-500 font-semibold">Equity</p>
            <p className="text-[14px] font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">
              {equityPercent}%
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 dark:border-white/[0.06] dark:bg-[#0e1015]">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-500 font-semibold">Avg. Bid</p>
            <p className="text-[14px] font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">
              {avgBid}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/[0.06] dark:bg-[#0e1015]">
          <div className="flex items-center gap-2">
            <Gavel className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" strokeWidth={2} />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-500 font-semibold">Last Bid</p>
              <p className="text-[13.5px] font-semibold text-slate-900 dark:text-white font-mono">
                {bidsLoading ? "…" : lastBid ? formatINR(lastBid.bidAmount) : "No bids yet"}
              </p>
            </div>
          </div>
          {!bidsLoading && bidTrend.length > 1 && (
            <TokenSparkline points={bidTrend} positive width={96} height={28} />
          )}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              if (status !== "live") return;
              if (!isAuthenticated) {
                openConnectModal();
                return;
              }
              setModalOpen(true);
            }}
            disabled={status === "closed"}
            className="cl-btn-primary h-[38px] w-full text-[13px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {!isAuthenticated && status === "live" ? "Connect Wallet to Bid" : button.label}
          </button>
        </div>
      </div>

      <ModalPortal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        backdropClassName="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        ariaLabel={`Place Bid — ${companyName}`}
      >
        <div
          className="w-full max-w-[440px] max-h-[85vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#111318] p-6 shadow-2xl text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-bold text-white">
              Place Bid — {companyName}
            </h3>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.05] text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {bids.length > 0 && (
            <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#0e1015] p-3.5">
              <p className="text-[12px] font-semibold text-[#94a3b8]">
                Recent bids ({bids.length})
              </p>
              <ul className="mt-2 max-h-[140px] space-y-1.5 overflow-y-auto">
                {[...bids].reverse().slice(0, 5).map((bid) => (
                  <li
                    key={bid._id}
                    className="flex items-center justify-between font-mono text-[12px] text-[#6b7280] dark:text-[#9ca3af]"
                  >
                    <span>{bid.bidder || "0x…"}</span>
                    <span className="font-semibold text-[#1a1a2e] dark:text-white">
                      {formatINR(bid.bidAmount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handlePlaceBid} className="mt-4 space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-slate-300">
                Bid Amount (INR)
              </label>
              <input
                type="number"
                required
                min={Math.max(1, Number(item.minInvestment) || 1)}
                max={Number(item.maxInvestment) > 0 ? Number(item.maxInvestment) : undefined}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="e.g. 50000"
                className="mt-1.5 h-[42px] w-full rounded-xl border border-white/[0.08] bg-[#0e1015] px-3.5 text-[14px] text-white outline-none focus:border-white/20 placeholder:text-zinc-600 transition-colors"
              />
              {(Number(item.minInvestment) > 0 || Number(item.maxInvestment) > 0) && (
                <p className="mt-1 text-[11px] text-zinc-400">
                  {Number(item.minInvestment) > 0 ? `Minimum ${formatINR(item.minInvestment)}` : ""}
                  {Number(item.maxInvestment) > 0
                    ? `${Number(item.minInvestment) > 0 ? " · " : ""}Maximum ${formatINR(item.maxInvestment)}`
                    : ""}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-300">
                Tokens Requested
              </label>
              <input
                type="number"
                required
                min="1"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder="e.g. 100"
                className="mt-1.5 h-[42px] w-full rounded-xl border border-white/[0.08] bg-[#0e1015] px-3.5 text-[14px] text-white outline-none focus:border-white/20 placeholder:text-zinc-600 transition-colors"
              />
            </div>

            {errorMsg && <p className="text-[13px] text-rose-400">{errorMsg}</p>}
            {successMsg && (
              <p className="flex items-center gap-1 text-[13px] text-emerald-400">
                <Check className="h-4 w-4" /> {successMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="cl-btn-primary h-[42px] w-full text-[14px] font-semibold disabled:opacity-50"
            >
              {submitting ? "Submitting Bid…" : "Confirm Bid"}
            </button>
          </form>
        </div>
      </ModalPortal>
    </>
  );
}
