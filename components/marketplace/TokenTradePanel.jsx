"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { getListings, createListing, buyTokens } from "../../lib/marketplaceApi";
import { getPortfolioSummary } from "../../lib/portfolioApi";

function unwrapListings(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.listings)) return response.listings;
  return [];
}

function unwrapHoldings(response) {
  const payload = response?.data || response;
  return Array.isArray(payload?.holdings) ? payload.holdings : [];
}

export default function TokenTradePanel({ token, startupId: startupIdProp }) {
  const startupId = startupIdProp || token?.startupId || null;
  const [mode, setMode] = useState("buy");
  const [listings, setListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState("");
  const [availableBalance, setAvailableBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedListing = useMemo(
    () => listings.find((listing) => String(listing._id) === selectedListingId) || null,
    [listings, selectedListingId]
  );
  const quantity = Number(amount);
  const pricePerToken = mode === "buy"
    ? Number(selectedListing?.pricePerToken) || 0
    : Number(sellPrice || token?.price) || 0;
  const total = quantity * pricePerToken;
  const maxAmount = mode === "buy"
    ? Number(selectedListing?.availableTokens) || 0
    : availableBalance;
  const currency = mode === "buy" ? (selectedListing?.currency || "USDT") : "USDT";

  async function refreshData(isCancelled = () => false) {
    const [listingResult, portfolioResult] = await Promise.allSettled([
      getListings(1, 100),
      getPortfolioSummary(),
    ]);
    if (isCancelled()) return;

    if (listingResult.status === "fulfilled") {
      const active = unwrapListings(listingResult.value).filter((listing) => {
        const listedStartupId = typeof listing.startupId === "object"
          ? listing.startupId?._id
          : listing.startupId;
        return String(listedStartupId) === String(startupId) && ["ACTIVE", "OPEN"].includes(String(listing.status).toUpperCase());
      });
      setListings(active);
      setSelectedListingId((current) =>
        active.some((listing) => String(listing._id) === current)
          ? current
          : String(active[0]?._id || "")
      );
    } else {
      setError("Could not load active sell listings.");
    }

    if (portfolioResult.status === "fulfilled") {
      const holding = unwrapHoldings(portfolioResult.value).find((entry) =>
        String(entry.startupId?._id || entry.startupId) === String(startupId)
      );
      setAvailableBalance(Math.max(0, Number(holding?.tokensHeld) || 0));
    } else {
      setAvailableBalance(0);
    }
  }

  useEffect(() => {
    if (!startupId) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    refreshData(() => cancelled)
      .catch(() => {
        if (!cancelled) setError("Could not load trading data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [startupId]);

  function switchMode(nextMode) {
    setMode(nextMode);
    setAmount("");
    setError("");
    setNotice("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    if (!startupId) {
      setError("This token is not linked to a startup listing yet.");
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Enter a valid token amount.");
      return;
    }
    if (quantity > maxAmount) {
      setError(`Maximum available amount is ${maxAmount.toLocaleString("en-IN")} tokens.`);
      return;
    }
    if (mode === "buy" && !selectedListing) {
      setError("Choose an active sell listing first.");
      return;
    }
    if (!Number.isFinite(pricePerToken) || pricePerToken <= 0) {
      setError("Enter a valid price per token.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "buy") {
        await buyTokens({
          listingId: selectedListing._id,
          tokenAmount: quantity,
          maxPaymentAmount: total,
        });
        setNotice("Buy transaction submitted. Your balance will update after confirmation.");
      } else {
        await createListing({
          startupId,
          paymentToken: "USDT",
          tokenAmount: quantity,
          pricePerToken,
        });
        setNotice("Sell listing submitted. It will be visible after backend confirmation.");
      }
      setAmount("");
      await refreshData();
    } catch (submitError) {
      setError(submitError?.message || `${mode === "buy" ? "Purchase" : "Listing"} failed. Please try again.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111318] p-5 sm:p-6 shadow-sm" aria-labelledby="token-trade-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 id="token-trade-heading" className="truncate text-[16px] font-bold text-white">Trade ${token?.symbol}</h2>
          <p className="mt-1 text-[11px] text-zinc-400">Direct peer-to-peer liquidity and secondary settlement.</p>
        </div>
        <div className="grid min-w-[150px] grid-cols-2 rounded-lg border border-white/[0.08] bg-[#0e1015] p-1" role="tablist" aria-label="Trade action">
          {["buy", "sell"].map((nextMode) => (
            <button
              key={nextMode}
              type="button"
              role="tab"
              aria-selected={mode === nextMode}
              onClick={() => switchMode(nextMode)}
              className={`min-h-8 rounded-md px-3 text-[12px] font-semibold capitalize transition ${
                mode === nextMode
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {nextMode}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid min-w-0 grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-1">
        {mode === "buy" ? (
          <div className="min-w-0">
            <label htmlFor="trade-listing" className="mb-1.5 block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Active Sell Listing</label>
            {loading ? (
              <div className="flex h-11 items-center gap-2 rounded-lg bg-[#0e1015] border border-white/[0.08] px-3 text-[12px] text-zinc-400"><Loader2 className="h-4 w-4 animate-spin text-white" /> Loading listings...</div>
            ) : listings.length === 0 ? (
              <p className="rounded-lg border border-white/[0.08] bg-[#0e1015] px-3 py-3 text-[12px] leading-relaxed text-zinc-400">No active sell listings are available for this startup.</p>
            ) : (
              <select
                id="trade-listing"
                value={selectedListingId}
                onChange={(event) => { setSelectedListingId(event.target.value); setAmount(""); setError(""); }}
                className="h-11 w-full min-w-0 rounded-lg border border-white/[0.08] bg-[#0e1015] px-3 text-[12.5px] text-white outline-none focus:border-white/20"
              >
                {listings.map((listing) => (
                  <option key={listing._id} value={listing._id} className="bg-[#111318] text-white">
                    {`${Number(listing.pricePerToken).toLocaleString("en-US")} ${listing.currency || "USDT"}`} / token · {Number(listing.availableTokens).toLocaleString("en-IN")} available
                  </option>
                ))}
              </select>
            )}
          </div>
        ) : (
          <div className="min-w-0 rounded-lg border border-white/[0.08] bg-[#0e1015] px-3.5 py-2.5">
            <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Your Available Balance</p>
            <p className="mt-1 break-words font-mono text-[15px] font-bold text-white">
              {loading ? "Loading…" : `${availableBalance.toLocaleString("en-IN")} ${token?.symbol}`}
            </p>
          </div>
        )}

        <div className="min-w-0">
          <label htmlFor="trade-amount" className="mb-1.5 block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Token Amount</label>
          <input
            id="trade-amount"
            type="number"
            min="0.000001"
            max={maxAmount || undefined}
            step="any"
            inputMode="decimal"
            value={amount}
            onChange={(event) => { setAmount(event.target.value); setError(""); setNotice(""); }}
            placeholder="0.00"
            disabled={loading || (mode === "buy" ? !selectedListing : availableBalance <= 0)}
            className="h-11 w-full min-w-0 rounded-lg border border-white/[0.08] bg-[#0e1015] px-3 font-mono text-[14px] text-white outline-none placeholder:text-zinc-600 focus:border-white/20 disabled:opacity-50"
          />
        </div>

        {mode === "sell" && (
          <div className="min-w-0">
            <label htmlFor="trade-sell-price" className="mb-1.5 block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Price per Token (USDT)</label>
            <input
              id="trade-sell-price"
              type="number"
              min="0.000001"
              step="any"
              inputMode="decimal"
              value={sellPrice}
              onChange={(event) => { setSellPrice(event.target.value); setError(""); setNotice(""); }}
              placeholder={Number(token?.price || 0).toFixed(4)}
              className="h-11 w-full min-w-0 rounded-lg border border-white/[0.08] bg-[#0e1015] px-3 font-mono text-[14px] text-white outline-none placeholder:text-zinc-600 focus:border-white/20"
            />
          </div>
        )}

        <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-[#0e1015] px-3.5 py-3 md:col-span-2 xl:col-span-1">
          <span className="shrink-0 text-[12px] text-zinc-400">{mode === "buy" ? "Estimated Total" : "Listing Value"}</span>
          <span className="min-w-0 break-all text-right font-mono text-[14px] font-bold text-white">{`${Number.isFinite(total) ? total.toLocaleString("en-US", { maximumFractionDigits: 6 }) : "0.00"} ${currency}`}</span>
        </div>

        <div className="min-w-0 md:col-span-2 xl:col-span-1">
          {error && <p role="alert" className="mb-2 break-words text-[12px] leading-relaxed text-rose-400">{error}</p>}
          {notice && <p role="status" className="mb-2 break-words text-[12px] leading-relaxed text-emerald-400">{notice}</p>}
          <button
            type="submit"
            disabled={busy || loading || (mode === "buy" ? !selectedListing : availableBalance <= 0)}
            className="cl-btn-primary min-h-11 w-full text-[13.5px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : <ArrowUpRight className="h-4 w-4" />}
            {busy ? "Submitting…" : mode === "buy" ? `Buy ${token?.symbol}` : "Create Sell Listing"}
          </button>
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
            {mode === "buy" ? "Purchase executes against the selected active listing." : "This creates an on-chain order; execution occurs when matched."}
          </p>
        </div>
      </form>
    </section>
  );
}
