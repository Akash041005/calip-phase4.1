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
    <div className="flex items-center gap-[20px] px-[35px] py-[18px]">
      <div className="flex h-[59px] w-[58px] shrink-0 items-center justify-center rounded-[20px] border border-[#131622] dark:border-[#2a2e3e] bg-[#6450ea] dark:bg-[#5546d4]">
        <Wallet className="h-[28px] w-[28px] text-white" strokeWidth={1.5} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-semibold leading-none text-[#9da3b0] dark:text-[#b0b5bf]">
          {wallet.name}
        </p>
        <span className="mt-[4px] inline-block rounded-[20px] bg-[#6450ea] dark:bg-[#5546d4] px-3 py-1 text-[14px] font-semibold leading-none text-white">
          {wallet.badge}
        </span>
        <p className="mt-[4px] font-mono text-[11px] font-medium leading-none text-[#333D58] dark:text-[#9ca3af]">
          {wallet.address}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {onSetPrimary && (
          <button
            type="button"
            onClick={onSetPrimary}
            className="flex h-[36px] items-center gap-1 rounded-[10px] border border-[#e5e7eb] dark:border-[#2a2e3e] px-3 text-[13px] font-medium text-[#6366f1] transition-colors hover:bg-[#f3f4f6] dark:hover:bg-[#1c202e]"
            aria-label={`Set ${wallet.name} as primary`}
          >
            <Star className="h-[15px] w-[15px]" strokeWidth={1.5} />
            Make primary
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-[27px] w-[28px] items-center justify-center text-[#6878a0] transition-colors hover:text-[#333D58] dark:hover:text-[#b0b5bf]"
          aria-label={`Copy ${wallet.name} address`}
        >
          {copied ? (
            <Check className="h-[24px] w-[24px] text-[#0e8a4d]" strokeWidth={1.5} />
          ) : (
            <Copy className="h-[24px] w-[24px]" strokeWidth={1.5} />
          )}
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={removing || !onRemove}
          className="flex h-[59px] w-[58px] items-center justify-center rounded-[15px] border border-[#2f2763] dark:border-[#4338ca] bg-[#6450e8] dark:bg-[#5546d4] transition-colors hover:bg-[#5741dc] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Remove ${wallet.name}`}
        >
          {removing ? (
            <Loader2 className="h-[24px] w-[24px] animate-spin text-white" strokeWidth={1.5} />
          ) : (
            <Trash2 className="h-[24px] w-[24px] text-white" strokeWidth={1.5} />
          )}
        </button>
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
      <div className="flex items-center justify-between px-[35px] pt-[15px] pb-[4px]">
        <div>
          <h2 className="text-[20px] font-bold leading-none text-black dark:text-white">
            Connected Wallets
          </h2>
          <p className="mt-[6px] text-[14px] leading-none text-[#8791a7] dark:text-[#9ca3af]">
            Manage wallets linked to your account
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddWallet}
          disabled={busy || !isAuthenticated}
          className="flex h-[40px] w-[205px] items-center justify-center rounded-[20px] bg-[#6550EB] text-[15px] font-semibold text-white transition-colors hover:bg-[#5741dc] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? "Connecting..." : "+ Add Wallet"}
        </button>
      </div>

      {actionError && (
        <p className="px-[35px] pt-[10px] text-[13px] leading-[18px] text-[#dc2626] dark:text-[#fecaca]">
          {actionError}
        </p>
      )}

      <div className="mx-[35px] h-px bg-[#e5e7eb] dark:bg-[#2a2e3e]" />

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#6B54F3] border-t-transparent" />
        </div>
      ) : displayWallets.length === 0 ? (
        <p className="px-[35px] py-[18px] text-[14px] leading-none text-[#8791a7] dark:text-[#9ca3af]">
          No wallets connected{walletAddress ? ` — current session: ${truncateAddress(walletAddress)}` : " yet"}.
        </p>
      ) : (
        displayWallets.map((wallet, index) => (
          <div key={wallet.id}>
            {index > 0 && <div className="mx-[35px] h-px bg-[#e5e7eb] dark:bg-[#2a2e3e]" />}
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