"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { placePresaleBid, getPresaleBids } from "../../lib/presalesApi";
import { X, Check, Gavel } from "lucide-react";
import ModalPortal from "../ui/ModalPortal";
import TokenSparkline from "../marketplace/TokenSparkline";

const badgeStyles = {
  live: "bg-[#10b981] text-white",
  upcoming: "border border-[#d1d5db] bg-white text-[#6b7280] dark:border-[#3a3e4e] dark:bg-[#1c202e] dark:text-[#b0b5bf]",
  closed: "bg-[#f3f4f6] text-[#9ca3af] dark:bg-[#1c202e] dark:text-[#7c8190]",
};

const buttonConfig = {
  live: { label: "Place Bid", className: "bg-[#6366f1] text-white hover:bg-[#5558e3]" },
  upcoming: { label: "Notify Me", className: "border border-[#d1d5db] bg-white text-[#374151] hover:bg-[#f9fafb] dark:border-[#3a3e4e] dark:bg-[#1c202e] dark:text-[#b0b5bf] dark:hover:bg-[#242838]" },
  closed: { label: "View Details", className: "bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed dark:bg-[#1c202e] dark:text-[#7c8190]" },
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
  const [modalOpen, setModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("10");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [bids, setBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setBidsLoading(true);
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
      <div className="relative flex w-full flex-col rounded-2xl border border-white/[0.08] bg-[#111723]/90 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all hover:border-[#8174ff]/35 hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#172236] to-[#101928] border border-white/[0.1] text-[16px] font-bold text-[#8174ff] shadow-sm">
              {logoLetter}
            </div>
            <div className="min-w-0">
              <h3
                onClick={() => {
                  const sid = item.startupId?._id || item.startupId?.id;
                  if (sid) router.push(`/insights/${sid}`);
                }}
                title={`Open ${companyName} overview`}
                className="truncate cursor-pointer text-[15px] font-semibold text-[#f4f5fb] transition-colors hover:text-[#8174ff]"
              >
                {companyName}
              </h3>
              <span className="text-[12px] text-[#737d91]">
                {sector}
              </span>
            </div>
          </div>

          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-semibold ${
            status === "live"
              ? "bg-[#78dfc0]/15 border border-[#78dfc0]/40 text-[#78dfc0]"
              : "border border-white/[0.1] bg-white/[0.04] text-[#a6adbf]"
          }`}>
            {status === "live" && <span className="cl-mint-dot !w-1.5 !h-1.5" />}
            {status === "live" ? "Live" : status === "upcoming" ? "Coming soon" : "Closed"}
          </div>
        </div>

        <p className="mt-3.5 line-clamp-2 text-[13px] leading-relaxed text-[#a6adbf]">
          {description}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2">
            <p className="text-[10.5px] uppercase tracking-wider text-[#737d91] font-semibold">Current Bid</p>
            <p className="text-[14px] font-semibold text-white mt-0.5">
              {currentBid}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2">
            <p className="text-[10.5px] uppercase tracking-wider text-[#737d91] font-semibold">Target</p>
            <p className="text-[14px] font-semibold text-white mt-0.5">
              {targetAmount}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2">
            <p className="text-[10.5px] uppercase tracking-wider text-[#737d91] font-semibold">Equity</p>
            <p className="text-[14px] font-semibold text-white mt-0.5">
              {equityPercent}%
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2">
            <p className="text-[10.5px] uppercase tracking-wider text-[#737d91] font-semibold">Avg. Bid</p>
            <p className="text-[14px] font-semibold text-white mt-0.5">
              {avgBid}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6a60e7] to-[#78dfc0]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
          <div className="flex items-center gap-2">
            <Gavel className="h-3.5 w-3.5 text-[#8174ff]" strokeWidth={2} />
            <div>
              <p className="text-[10.5px] uppercase tracking-wider text-[#737d91] font-semibold">Last Bid</p>
              <p className="text-[13.5px] font-semibold text-white">
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
            onClick={() => status === "live" && setModalOpen(true)}
            disabled={status === "closed"}
            className="cl-btn-primary h-[38px] w-full text-[13.5px]"
          >
            {button.label}
          </button>
        </div>
      </div>

      <ModalPortal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        backdropClassName="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
        ariaLabel={`Place Bid — ${companyName}`}
      >
        <div
          className="w-full max-w-[440px] max-h-[85vh] overflow-y-auto rounded-[16px] border border-[#f0f0f0] bg-white p-6 shadow-xl dark:border-[#2a2e3e] dark:bg-[#181c28]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-semibold text-[#1a1a2e] dark:text-white">
              Place Bid — {companyName}
            </h3>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb] dark:bg-[#1c202e] dark:text-[#b0b5bf]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {bids.length > 0 && (
            <div className="mt-4 rounded-lg border border-[#e5e7eb] dark:border-[#2a2e3e] bg-[#f9fafb] dark:bg-[#12151f] p-3">
              <p className="text-[12px] font-semibold text-[#374151] dark:text-[#b0b5bf]">
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
              <label className="block text-[13px] font-medium text-[#374151] dark:text-[#b0b5bf]">
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
                className="mt-1 h-[40px] w-full rounded-lg border border-[#e5e7eb] px-3 text-[14px] text-[#1a1a2e] outline-none focus:border-[#6366f1] dark:border-[#2a2e3e] dark:bg-[#12151f] dark:text-white"
              />
              {(Number(item.minInvestment) > 0 || Number(item.maxInvestment) > 0) && (
                <p className="mt-1 text-[11px] text-[#6b7280] dark:text-[#8b93a7]">
                  {Number(item.minInvestment) > 0 ? `Minimum ${formatINR(item.minInvestment)}` : ""}
                  {Number(item.maxInvestment) > 0
                    ? `${Number(item.minInvestment) > 0 ? " · " : ""}Maximum ${formatINR(item.maxInvestment)}`
                    : ""}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] dark:text-[#b0b5bf]">
                Tokens Requested
              </label>
              <input
                type="number"
                required
                min="1"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder="e.g. 100"
                className="mt-1 h-[40px] w-full rounded-lg border border-[#e5e7eb] px-3 text-[14px] text-[#1a1a2e] outline-none focus:border-[#6366f1] dark:border-[#2a2e3e] dark:bg-[#12151f] dark:text-white"
              />
            </div>

            {errorMsg && <p className="text-[13px] text-red-500">{errorMsg}</p>}
            {successMsg && (
              <p className="flex items-center gap-1 text-[13px] text-green-600">
                <Check className="h-4 w-4" /> {successMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-[40px] w-full items-center justify-center rounded-lg bg-[#6366f1] text-[14px] font-medium text-white transition-colors hover:bg-[#5558e3] disabled:opacity-50"
            >
              {submitting ? "Submitting Bid…" : "Confirm Bid"}
            </button>
          </form>
        </div>
      </ModalPortal>
    </>
  );
}
