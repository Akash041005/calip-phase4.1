"use client";

import { useState } from "react";
import { X, Loader2, ShoppingCart } from "lucide-react";
import ModalPortal from "../ui/ModalPortal";

export default function BuyModal({ listing, onClose, onSubmit }) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const startup = listing?.startupId || {};
  const pricePerToken = Number(listing?.pricePerToken) || 0;
  const available = Number(listing?.availableTokens) || 0;
  const tokenAmt = Number(amount) || 0;

  const totalPrice = tokenAmt * pricePerToken;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!tokenAmt || tokenAmt <= 0) {
      setError("Enter a valid token amount.");
      return;
    }
    if (tokenAmt > available) {
      setError(`Only ${available} tokens available in this listing.`);
      return;
    }
    setError("");
    setBusy(true);
    try {
      await onSubmit({
        listingId: listing._id || listing.listingId,
        tokenAmount: tokenAmt,
        maxPaymentAmount: totalPrice,
      });
    } catch (err) {
      setError(err?.message || "Transaction failed. Please try again.");
      setBusy(false);
    }
  };

  const inputClass =
    "h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-slate-400 focus:bg-white dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-white/20 dark:focus:bg-[#111318]";

  return (
    <ModalPortal
      isOpen={true}
      onClose={onClose}
      backdropClassName="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/75 backdrop-blur-sm p-4"
      ariaLabel="Buy tokens"
    >
      <div
        className="w-full max-w-[440px] max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/[0.12] dark:bg-[#151824]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] px-5 py-4">
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white transition-colors">
            Buy tokens
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-[#0e1015] transition-colors">
            <p className="text-[12px] text-slate-500 dark:text-slate-400">
              {startup.startupName || "Startup"}
            </p>
            <p className="mt-1 text-[16px] font-bold font-mono text-slate-900 dark:text-white transition-colors">
              {Number(pricePerToken).toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
              })}{" "}
              per token
            </p>
            <p className="mt-1 text-[12px] font-mono text-slate-500 dark:text-slate-400">
              {available.toLocaleString("en-IN")} tokens available
            </p>
          </div>

          <label
            htmlFor="buy-amount"
            className="mb-1.5 mt-4 block text-[13px] font-medium text-slate-700 dark:text-slate-300"
          >
            Token amount
          </label>
          <input
            id="buy-amount"
            type="number"
            min="1"
            max={available}
            step="any"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
            }}
            placeholder="e.g. 100"
            className={inputClass}
          />

          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/[0.08] dark:bg-[#0e1015] transition-colors">
            <span className="text-[13px] text-slate-500 dark:text-slate-400">Total payment</span>
            <span className="text-[16px] font-bold font-mono text-slate-900 dark:text-white transition-colors">
              ₹ {Number(totalPrice || 0).toLocaleString("en-IN")}
            </span>
          </div>

          {error && (
            <p className="mt-3 text-[13px] text-rose-500 dark:text-rose-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="cl-btn-primary mt-5 h-[44px] w-full text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin text-black" strokeWidth={2} />
            ) : (
              <ShoppingCart className="h-4 w-4" strokeWidth={2} />
            )}
            {busy ? "Processing..." : "Confirm purchase"}
          </button>
        </form>
      </div>
    </ModalPortal>
  );
}