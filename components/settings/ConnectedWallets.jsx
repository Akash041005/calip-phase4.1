"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Loader2, Star, Trash2, Wallet } from "lucide-react";
import SettingsCard from "./SettingsCard";
import { useAuth } from "../auth/AuthProvider";
import { truncateAddress } from "../../lib/format";
import { connectWallet, signWalletMessage, WalletError } from "../../lib/wallet";
import { requestNonce } from "../../lib/authApi";
import { getWallets, addWallet, removeWallet, setPrimaryWallet } from "../../lib/usersApi";

function WalletRow({ wallet, onCopy, onRemove, onSetPrimary, removing }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!onCopy) return;
    try {
      await onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.04]">
        <Wallet className="h-5 w-5 text-slate-700 dark:text-white" strokeWidth={1.5} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[15px] font-semibold text-slate-900 dark:text-white">
            {wallet.name}
          </p>
          <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
            {wallet.badge}
          </span>
        </div>
        <p className="mt-1 font-mono text-[12px] text-slate-500 dark:text-slate-400">
          {wallet.address}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {onSetPrimary && (
          <button
            type="button"
            onClick={onSetPrimary}
            className="cl-btn-secondary h-8 px-3 text-[12px]"
            aria-label={`Set ${wallet.name} as primary`}
          >
            <Star className="h-3.5 w-3.5" strokeWidth={1.5} />
            Make primary
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/[0.08] dark:hover:bg-white/[0.05] dark:hover:text-white"
          aria-label={`Copy ${wallet.name} address`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
          ) : (
            <Copy className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={removing}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50 dark:border-white/[0.08]"
            aria-label={`Remove ${wallet.name}`}
          >
            {removing ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" strokeWidth={1.5} />
            ) : (
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ConnectedWallets() {
  const { isAuthenticated, walletAddress } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState("");
  const [actionError, setActionError] = useState("");

  const refreshWallets = async () => {
    const res = await getWallets();
    setWallets(Array.isArray(res?.wallets) ? res.wallets : []);
    setActionError("");
    return res;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!isAuthenticated) return;
        const res = await getWallets();
        if (!cancelled) setWallets(Array.isArray(res?.wallets) ? res.wallets : []);
      } catch (err) {
        console.error("Failed to fetch wallets:", err);
        if (!cancelled) setActionError("Could not load your connected wallets.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const displayWallets = wallets.map((wallet) => ({
    id: wallet.address,
    name: wallet.provider || "MetaMask",
    address: truncateAddress(wallet.address),
    badge: wallet.isPrimary ? "Primary" : "Linked",
    fullAddress: wallet.address,
    isPrimary: Boolean(wallet.isPrimary),
  }));

  const handleCopy = async (wallet) => {
    await navigator.clipboard.writeText(wallet.fullAddress);
  };

  const handleRemove = async (wallet) => {
    setActionError("");
    setRemoving(wallet.fullAddress);
    try {
      await removeWallet(wallet.fullAddress);
      await refreshWallets();
    } catch (err) {
      console.error("Failed to remove wallet:", err);
      setActionError(
        err?.message ||
          "Could not remove this wallet. Make sure it is not the primary or only wallet."
      );
    } finally {
      setRemoving("");
    }
  };

  const handleSetPrimary = async (wallet) => {
    setActionError("");
    setBusy(true);
    try {
      await setPrimaryWallet(wallet.fullAddress);
      await refreshWallets();
    } catch (err) {
      console.error("Failed to set primary wallet:", err);
      setActionError(err?.message || "Could not set this wallet as primary.");
    } finally {
      setBusy(false);
    }
  };

  const handleAddWallet = async () => {
    if (busy) return;
    setActionError("");
    setBusy(true);
    try {
      const newAddress = await connectWallet();
      const nonceRes = await requestNonce(newAddress);
      const nonce = nonceRes?.nonce || nonceRes?.data?.nonce;
      if (!nonce) throw new Error("No nonce returned for the new wallet.");
      const message = `Sign this nonce to login: ${nonce}`;
      const signature = await signWalletMessage(message, newAddress);
      await addWallet({ walletAddress: newAddress, signature, provider: "MetaMask" });
      await refreshWallets();
    } catch (err) {
      console.error("Failed to add wallet:", err);
      setActionError(
        err instanceof WalletError
          ? err.message
          : err?.message || "Could not connect the new wallet."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SettingsCard>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <h2 className="text-[18px] font-bold text-slate-900 dark:text-white">
            Connected Wallets
          </h2>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
            Manage wallets and Web3 addresses linked to your account.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddWallet}
          disabled={busy || !isAuthenticated}
          className="cl-btn-primary h-9 px-4 text-[13px]"
        >
          {busy ? "Connecting..." : "+ Add Wallet"}
        </button>
      </div>

      {actionError && (
        <p className="pt-3 text-[13px] text-rose-400">
          {actionError}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent dark:border-white dark:border-t-transparent" />
        </div>
      ) : displayWallets.length === 0 ? (
        <p className="py-6 text-[13.5px] text-slate-500 dark:text-slate-400">
          No wallets connected{walletAddress ? ` — current session: ${truncateAddress(walletAddress)}` : " yet"}.
        </p>
      ) : (
        displayWallets.map((wallet, index) => (
          <div key={wallet.id}>
            {index > 0 && <div className="h-px bg-slate-200 dark:bg-white/[0.08]" />}
            <WalletRow
              wallet={wallet}
              onCopy={() => handleCopy(wallet)}
              onRemove={wallet.isPrimary ? undefined : () => handleRemove(wallet)}
              onSetPrimary={wallet.isPrimary ? undefined : () => handleSetPrimary(wallet)}
              removing={removing === wallet.fullAddress}
            />
          </div>
        ))
      )}
    </SettingsCard>
  );
}