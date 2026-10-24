"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  FolderKanban,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { truncateAddress } from "../../lib/format";
import { getParticipationHistory } from "../../lib/participationApi";

export default function TraderPortfolioBanner() {
  const { isAuthenticated, walletAddress, user, openConnectModal } = useAuth();
  const [participations, setParticipations] = useState([]);
  const [ethBalance, setEthBalance] = useState("0.00 ETH");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !walletAddress) {
      setParticipations([]);
      setEthBalance("0.00 ETH");
      return;
    }

    // 1. Fetch live wallet balance from MetaMask provider
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum
        .request({
          method: "eth_getBalance",
          params: [walletAddress, "latest"],
        })
        .then((balanceHex) => {
          try {
            const wei = BigInt(balanceHex);
            const eth = Number(wei) / 1e18;
            setEthBalance(`${eth.toFixed(4)} ETH`);
          } catch {
            setEthBalance("0.00 ETH");
          }
        })
        .catch(() => setEthBalance("0.00 ETH"));
    }

    // 2. Fetch participation history for active bids and held allocations
    setLoading(true);
    getParticipationHistory()
      .then((res) => {
        const parts = res?.data || res?.participations || (Array.isArray(res) ? res : []);
        setParticipations(parts.filter(Boolean));
      })
      .catch(() => setParticipations([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated, walletAddress]);

  if (!isAuthenticated) {
    return (
      <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-5 sm:p-6 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/[0.04]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Wallet className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                Personal Trader Command Center
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                Connect your MetaMask or Web3 wallet to track your startup token allocations, orders, and PnL in real time.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openConnectModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors shrink-0 cursor-pointer"
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>Connect Wallet to Access</span>
          </button>
        </div>
      </div>
    );
  }

  const displayName = user?.username || (walletAddress ? truncateAddress(walletAddress) : "Verified Trader");
  const activeBids = participations.filter((p) => p.status === "pending" || p.status === "confirmed");
  const settledAllocations = participations.filter((p) => p.status === "settled" || p.status === "completed");
  const totalCommitted = participations.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  return (
    <div className="mb-8 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#111318]">
      {/* Top Row: User Greeting & Network Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-800 dark:bg-white/[0.05] dark:text-white border border-slate-200 dark:border-white/10 shadow-xs font-mono font-bold text-sm">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Welcome back, {displayName}
              </h2>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-2 py-0.5 text-[10.5px] font-mono text-emerald-700 dark:text-emerald-400">
                Connected
              </span>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
              {walletAddress} • Base Sepolia
            </p>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/performance-summary"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.08] transition-colors"
          >
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Full Portfolio</span>
          </Link>

          <Link
            href="/my-startups"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.08] transition-colors"
          >
            <FolderKanban className="h-3.5 w-3.5 text-indigo-500" />
            <span>My Startups</span>
          </Link>

          <Link
            href="/founders"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.08] transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Register Startup</span>
          </Link>
        </div>
      </div>

      {/* Bottom Row: Key Personal Metrics */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            Portfolio Value
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {totalCommitted > 0 ? `₹${totalCommitted.toLocaleString("en-IN")}` : "$0.00"}
            </span>
            {totalCommitted > 0 && (
              <span className="font-mono text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                Live
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            Available Balance
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {ethBalance}
            </span>
            <span className="font-mono text-[10.5px] text-slate-500 dark:text-zinc-400">
              Sepolia
            </span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            Allocations Held
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {settledAllocations.length} Tokens
            </span>
            <span className="text-[10.5px] font-mono text-slate-500 dark:text-zinc-400">
              {settledAllocations.length === 0 ? "None yet" : settledAllocations.map((p) => p.symbol).join(", ")}
            </span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            Active Bids
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {activeBids.length} Pending
            </span>
            <span className="font-mono text-[10.5px] text-emerald-600 dark:text-emerald-400">
              {activeBids.length === 0 ? "None" : "In Auction"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
