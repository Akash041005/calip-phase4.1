"use client";

import { useState, useEffect } from "react";
import { X, Loader2, PlusCircle } from "lucide-react";
import { getMyStartups } from "../../lib/startupsManageApi";
import ModalPortal from "../ui/ModalPortal";

const inputClass =
  "h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-slate-400 focus:bg-white dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-white/20 dark:focus:bg-[#111318]";

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
      backdropClassName="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/75 backdrop-blur-sm p-4"
      ariaLabel="Create a new listing"
    >
      <div
        className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/[0.12] dark:bg-[#151824]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] px-5 py-4">
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white transition-colors">
            Create a new listing
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
          <label
            htmlFor="listing-startup"
            className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300"
          >
            Startup
          </label>
          {loadingStartups ? (
            <div className="flex h-[42px] items-center gap-2 px-4 text-[13px] text-slate-500 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-slate-700 dark:text-white" strokeWidth={2} />
              Loading your startups...
            </div>
          ) : startups.length === 0 ? (
            <p className="text-[13px] text-rose-500 dark:text-rose-400">
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
              className="h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-900 outline-none focus:border-slate-400 focus:bg-white dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:focus:border-white/20 transition-colors"
            >
              <option value="" disabled className="bg-white text-slate-500 dark:bg-[#111318] dark:text-slate-400">
                Select a startup
              </option>
              {startups.map((startup) => (
                <option key={startup._id} value={startup._id} className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">
                  {startup.startupName}
                </option>
              ))}
            </select>
          )}

          <label
            htmlFor="listing-token"
            className="mb-1.5 mt-4 block text-[13px] font-medium text-slate-700 dark:text-slate-300"
          >
            Payment token
          </label>
          <select
            id="listing-token"
            value={paymentToken}
            onChange={(e) => setPaymentToken(e.target.value)}
            className="h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-900 outline-none focus:border-slate-400 focus:bg-white dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:focus:border-white/20 transition-colors"
          >
            <option value="USDT" className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">USDT</option>
            <option value="USDC" className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">USDC</option>
            <option value="ETH" className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">ETH</option>
            <option value="DAI" className="bg-white text-slate-900 dark:bg-[#111318] dark:text-white">DAI</option>
          </select>

          <div className="mt-4 grid grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="listing-amount"
                className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300"
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
                className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300"
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

          {error && <p className="mt-3 text-[13px] text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={busy || startups.length === 0}
            className="cl-btn-primary mt-5 h-[44px] w-full text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin text-black" strokeWidth={2} />
            ) : (
              <PlusCircle className="h-4 w-4" strokeWidth={2} />
            )}
            {busy ? "Creating..." : "Create listing"}
          </button>
        </form>
      </div>
    </ModalPortal>
  );
}