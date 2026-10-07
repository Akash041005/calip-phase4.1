"use client";

import { useState, useEffect } from "react";
import { X, Loader2, PlusCircle } from "lucide-react";
import { getMyStartups } from "../../lib/startupsManageApi";
import ModalPortal from "../ui/ModalPortal";

const inputClass =
  "h-[42px] w-full rounded-[10px] border border-[#e5e7eb] bg-[#f4f5f7] px-4 text-[14px] sm:text-[16px] text-[#1a1a2e] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#6366f1] focus:bg-white dark:border-[#2a2e3e] dark:bg-[#1c202e] dark:text-white dark:placeholder:text-[#7c8190] dark:focus:bg-[#181c28]";

export default function CreateListingModal({ onClose, onSubmit }) {
  const [startups, setStartups] = useState([]);
  const [startupId, setStartupId] = useState("");
  const [paymentToken, setPaymentToken] = useState("USDT");
  const [tokenAmount, setTokenAmount] = useState("");
  const [pricePerToken, setPricePerToken] = useState("");
  const [loadingStartups, setLoadingStartups] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getMyStartups()
      .then((res) => {
        const list = res?.startups || (Array.isArray(res) ? res : []);
        if (!cancelled) setStartups(list.filter(Boolean));
      })
      .catch(() => {
        if (!cancelled) setStartups([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingStartups(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!startupId) {
      setError("Select a startup to list.");
      return;
    }
    if (!Number(tokenAmount) || Number(tokenAmount) <= 0) {
      setError("Enter a valid token amount.");
      return;
    }
    if (!Number(pricePerToken) || Number(pricePerToken) <= 0) {
      setError("Enter a valid price per token.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await onSubmit({
        startupId,
        paymentToken,
        tokenAmount: Number(tokenAmount),
        pricePerToken: Number(pricePerToken),
      });
    } catch (err) {
      setError(err?.message || "Failed to create listing.");
      setBusy(false);
    }
  };

  return (
    <ModalPortal
      isOpen={true}
      onClose={onClose}
      backdropClassName="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      ariaLabel="Create a new listing"
    >
      <div
        className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto rounded-[16px] border border-[#e5e7eb] bg-white shadow-xl dark:border-[#2a2e3e] dark:bg-[#141620]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-[20px] py-[14px] dark:border-[#2a2e3e]">
          <h3 className="text-[16px] font-semibold text-black dark:text-white">
            Create a new listing
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
          <label
            htmlFor="listing-startup"
            className="mb-[8px] block text-[13px] font-medium text-[#374151] dark:text-[#b0b5bf]"
          >
            Startup
          </label>
          {loadingStartups ? (
            <div className="flex h-[42px] items-center gap-[8px] px-4 text-[13px] text-[#9ca3af]">
              <Loader2 className="h-[14px] w-[14px] animate-spin" strokeWidth={2} />
              Loading your startups...
            </div>
          ) : startups.length === 0 ? (
            <p className="text-[13px] text-[#F0395A]">
              No startups found. Submit a startup from the Founders page first.
            </p>
          ) : (
            <select
              id="listing-startup"
              value={startupId}
              onChange={(e) => {
                setStartupId(e.target.value);
                setError("");
              }}
              className="h-[42px] w-full appearance-none rounded-[10px] border border-[#e5e7eb] bg-[#f4f5f7] px-4 text-[14px] sm:text-[16px] text-[#1a1a2e] outline-none transition-colors focus:border-[#6366f1] dark:border-[#2a2e3e] dark:bg-[#1c202e] dark:text-white"
            >
              <option value="" disabled>
                Select a startup
              </option>
              {startups.map((startup) => (
                <option key={startup._id} value={startup._id}>
                  {startup.startupName}
                </option>
              ))}
            </select>
          )}

          <label
            htmlFor="listing-token"
            className="mb-[8px] mt-[16px] block text-[13px] font-medium text-[#374151] dark:text-[#b0b5bf]"
          >
            Payment token
          </label>
          <select
            id="listing-token"
            value={paymentToken}
            onChange={(e) => setPaymentToken(e.target.value)}
            className="h-[42px] w-full appearance-none rounded-[10px] border border-[#242730] bg-[#f4f5f7] px-4 text-[16px] text-[#1a1a2e] outline-none transition-colors focus:border-[#6366f1] dark:border-[#2a2e3e] dark:bg-[#1c202e] dark:text-white"
          >
            <option value="USDT">USDT</option>
            <option value="USDC">USDC</option>
            <option value="ETH">ETH</option>
            <option value="DAI">DAI</option>
          </select>

          <div className="mt-[16px] grid grid-cols-2 gap-[14px]">
            <div>
              <label
                htmlFor="listing-amount"
                className="mb-[8px] block text-[13px] font-medium text-[#374151] dark:text-[#b0b5bf]"
              >
                Token amount
              </label>
              <input
                id="listing-amount"
                type="number"
                min="1"
                step="any"
                value={tokenAmount}
                onChange={(e) => {
                  setTokenAmount(e.target.value);
                  setError("");
                }}
                placeholder="e.g. 1000"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="listing-price"
                className="mb-[8px] block text-[13px] font-medium text-[#374151] dark:text-[#b0b5bf]"
              >
                Price per token
              </label>
              <input
                id="listing-price"
                type="number"
                min="0.01"
                step="any"
                value={pricePerToken}
                onChange={(e) => {
                  setPricePerToken(e.target.value);
                  setError("");
                }}
                placeholder="e.g. 0.005"
                className={inputClass}
              />
            </div>
          </div>

          {error && <p className="mt-[12px] text-[13px] text-[#F0395A]">{error}</p>}

          <button
            type="submit"
            disabled={busy || startups.length === 0}
            className="mt-[20px] flex h-[46px] w-full items-center justify-center gap-[8px] rounded-[10px] bg-[#6366f1] text-[15px] font-semibold text-white transition-colors hover:bg-[#5558e3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin" strokeWidth={2} />
            ) : (
              <PlusCircle className="h-[17px] w-[17px]" strokeWidth={2} />
            )}
            {busy ? "Creating..." : "Create listing"}
          </button>
        </form>
      </div>
    </ModalPortal>
  );
}