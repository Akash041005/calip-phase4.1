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
    "h-[42px] w-full rounded-[10px] border border-[#e5e7eb] bg-[#f4f5f7] px-4 text-[14px] sm:text-[16px] text-[#1a1a2e] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#6366f1] focus:bg-white dark:border-[#2a2e3e] dark:bg-[#1c202e] dark:text-white dark:placeholder:text-[#7c8190] dark:focus:bg-[#181c28]";

  return (
    <ModalPortal
      isOpen={true}
      onClose={onClose}
      backdropClassName="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      ariaLabel="Buy tokens"
    >
      <div
        className="w-full max-w-[440px] max-h-[85vh] overflow-y-auto rounded-[16px] border border-[#e5e7eb] bg-white shadow-xl dark:border-[#2a2e3e] dark:bg-[#141620]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-[20px] py-[14px] dark:border-[#2a2e3e]">
          <h3 className="text-[16px] font-semibold text-black dark:text-white">
            Buy tokens
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] text-[#6b7280] transition-colors hover:bg-[#f3f4f6] dark:text-[#9ca3af] dark:hover:bg-[#1e2234]"
          >
            <X className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-[20px] py-[20px]">
          <div className="rounded-[12px] bg-[#f9fafb] px-[16px] py-[14px] dark:bg-[#181c28]">
            <p className="text-[12px] text-[#6b7280] dark:text-[#9ca3af]">
              {startup.startupName || "Startup"}
            </p>
            <p className="mt-[4px] text-[15px] font-semibold text-[#111827] dark:text-white">
              {Number(pricePerToken).toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
              })}{" "}
              per token
            </p>
            <p className="mt-[2px] text-[12px] text-[#9ca3af] dark:text-[#7c8190]">
              {available.toLocaleString("en-IN")} tokens available
            </p>
          </div>

          <label
            htmlFor="buy-amount"
            className="mb-[8px] mt-[18px] block text-[13px] font-medium text-[#374151] dark:text-[#b0b5bf]"
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

          <div className="mt-[16px] flex items-center justify-between rounded-[12px] border border-[#e5e7eb] px-[16px] py-[12px] dark:border-[#2a2e3e]">
            <span className="text-[13px] text-[#6b7280] dark:text-[#9ca3af]">Total payment</span>
            <span className="text-[16px] font-bold text-[#111827] dark:text-white">
              ₹ {Number(totalPrice || 0).toLocaleString("en-IN")}
            </span>
          </div>

          {error && (
            <p className="mt-[12px] text-[13px] text-[#F0395A]">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-[20px] flex h-[46px] w-full items-center justify-center gap-[8px] rounded-[10px] bg-[#6366f1] text-[15px] font-semibold text-white transition-colors hover:bg-[#5558e3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin" strokeWidth={2} />
            ) : (
              <ShoppingCart className="h-[17px] w-[17px]" strokeWidth={2} />
            )}
            {busy ? "Processing..." : "Confirm purchase"}
          </button>
        </form>
      </div>
    </ModalPortal>
  );
}