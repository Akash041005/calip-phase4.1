"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Wallet,
  X,
  Loader2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AUTH_STATUS, useAuth } from "./AuthProvider";

export default function ConnectWalletModal() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    status,
    error,
    isAuthenticated,
    isConnectModalOpen,
    closeConnectModal,
    connectAndAuthenticate,
    loginDemoAccount,
    clearError,
  } = useAuth();

  const [connectingType, setConnectingType] = useState(null); // 'metamask' | null
  const [isInstalled, setIsInstalled] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsInstalled(!!window.ethereum);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && isConnectModalOpen) {
      closeConnectModal();
      setConnectingType(null);
      // Per user explicit requirement: redirect to dashboard on login from home
      if (pathname === "/") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isConnectModalOpen, closeConnectModal, pathname, router]);

  // Handle escape key
  useEffect(() => {
    if (!isConnectModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeConnectModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isConnectModalOpen, closeConnectModal]);

  const handleMetaMaskConnect = async () => {
    setConnectingType("metamask");
    clearError();
    const ok = await connectAndAuthenticate();
    if (!ok) setConnectingType(null);
  };

  const isLoading = status === AUTH_STATUS.CONNECTING ||
    status === AUTH_STATUS.SIGNING ||
    status === AUTH_STATUS.AUTHENTICATING;

  if (!isConnectModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeConnectModal}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl dark:border-white/[0.12] dark:bg-[#0e1017] text-slate-900 dark:text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm">
                <Wallet className="h-4 w-4" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight">Connect with MetaMask</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">Base Sepolia Testnet</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={closeConnectModal}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.08] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Description */}
          <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-zinc-300">
            Sign in with your Web3 wallet using free, gasless cryptographic signature verification.
          </p>

          {/* Error Banner */}
          {error && (
            <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-50/80 p-3 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1">
                <p className="font-medium">{error.message || "Wallet connection failed"}</p>
                <p className="text-[11px] text-rose-600/80 dark:text-rose-300/80 mt-0.5">
                  Ensure MetaMask is unlocked and you approve the sign-in request.
                </p>
              </div>
            </div>
          )}

          {/* Wallet Options */}
          <div className="mt-5 space-y-3">
            {isInstalled ? (
              /* MetaMask Provider */
              <button
                type="button"
                onClick={handleMetaMaskConnect}
                disabled={isLoading}
                className="group flex w-full items-center justify-between rounded-xl border border-slate-300 bg-slate-50 p-4 transition-all hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-white/[0.12] dark:bg-white/[0.04] dark:hover:border-emerald-500/40 dark:hover:bg-white/[0.08] text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                    <svg className="h-6 w-6" viewBox="0 0 32 32" fill="none">
                      <path d="M28.08 7.37L17.29 1.13c-.8-.46-1.78-.46-2.58 0L3.92 7.37c-.8.46-1.29 1.31-1.29 2.23v12.8c0 .92.49 1.77 1.29 2.23l10.79 6.24c.8.46 1.78.46 2.58 0l10.79-6.24c.8-.46 1.29-1.31 1.29-2.23V9.6c0-.92-.49-1.77-1.29-2.23z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M16 8l8 12H8l8-12z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">MetaMask Wallet</span>
                      <span className="rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 px-1.5 py-0.5 text-[10px] font-mono font-medium">
                        Base Sepolia
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      1-click connect & auto-switch to Base Sepolia
                    </p>
                  </div>
                </div>

                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                )}
              </button>
            ) : (
              /* If MetaMask not installed */
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center justify-between rounded-xl border border-amber-500/40 bg-amber-50/70 p-4 transition-all hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
                    <svg className="h-6 w-6" viewBox="0 0 32 32" fill="none">
                      <path d="M28.08 7.37L17.29 1.13c-.8-.46-1.78-.46-2.58 0L3.92 7.37c-.8.46-1.29 1.31-1.29 2.23v12.8c0 .92.49 1.77 1.29 2.23l10.79 6.24c.8.46 1.78.46 2.58 0l10.79-6.24c.8-.46 1.29-1.31 1.29-2.23V9.6c0-.92-.49-1.77-1.29-2.23z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M16 8l8 12H8l8-12z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">Install MetaMask</span>
                      <span className="rounded bg-amber-200/80 dark:bg-amber-500/30 px-1.5 py-0.5 text-[10px] font-mono text-amber-900 dark:text-amber-300">
                        Browser Extension
                      </span>
                    </div>
                    <p className="text-[11.5px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                      Install MetaMask for Chrome, Brave, or Edge (100% Free)
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-amber-700 dark:text-amber-300 group-hover:translate-x-0.5 transition-all" />
              </a>
            )}
          </div>

          {/* Network & Info Box */}
          <div className="mt-4 rounded-xl border border-slate-200/90 bg-slate-50/80 p-3 text-[11.5px] leading-relaxed text-slate-600 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-zinc-400">
            <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              How testing works on Base Sepolia:
            </p>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              <li>Logging in only signs a free message (costs $0.00 gas).</li>
              <li>Calip automatically adds and switches MetaMask to Base Sepolia.</li>
              <li>Get free testnet ETH anytime from faucets to test bids and trades.</li>
            </ul>
          </div>

          {/* Security & Disclaimer Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Self-custodial & secure</span>
            </div>
            <span>EIP-4361 / SIWE compliant</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
