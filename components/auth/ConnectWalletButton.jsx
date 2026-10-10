"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Wallet,
  Loader2,
  LogOut,
  Copy,
  Check,
  ChevronDown,
  User,
  Settings as SettingsIcon,
  Sun,
  Moon,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { AUTH_STATUS, useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import { truncateAddress } from "../../lib/format";

const tapTransition = { duration: 0.15, ease: [0.22, 1, 0.36, 1] };

export default function ConnectWalletButton() {
  const {
    status,
    walletAddress,
    user,
    error,
    connectAndAuthenticate,
    logout,
    clearError,
  } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const reduced = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef(null);

  const isAuthenticated = status === AUTH_STATUS.AUTHENTICATED;
  const isLoading =
    status === AUTH_STATUS.CONNECTING ||
    status === AUTH_STATUS.SIGNING ||
    status === AUTH_STATUS.AUTHENTICATING;

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(clearError, 6000);
    return () => clearTimeout(timer);
  }, [error, clearError]);

  // Click outside listener
  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  const handleClick = () => {
    if (isAuthenticated) {
      setMenuOpen((open) => !open);
      return;
    }
    if (isLoading) return;
    connectAndAuthenticate();
  };

  const handleCopy = useCallback(async (e) => {
    e?.stopPropagation();
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable
    }
  }, [walletAddress]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  const statusLabel = {
    [AUTH_STATUS.CONNECTING]: "Connecting...",
    [AUTH_STATUS.SIGNING]: "Sign Message",
    [AUTH_STATUS.AUTHENTICATING]: "Verifying...",
  };

  const displayName = user?.username || user?.name || truncateAddress(walletAddress);

  return (
    <div ref={rootRef} className="relative select-none">
      {/* ─── BUTTON (MERGED PROFILE & WALLET CHIP) ───────────────────── */}
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={tapTransition}
        aria-haspopup={isAuthenticated ? "menu" : undefined}
        aria-expanded={isAuthenticated ? menuOpen : undefined}
        aria-label={
          isAuthenticated
            ? `Account Profile & Wallet (${walletAddress})`
            : "Connect Wallet"
        }
        className={`flex h-[32px] items-center gap-2 rounded-lg px-3 text-[12.5px] font-medium transition-colors duration-150 ${
          isAuthenticated
            ? "border border-white/[0.12] bg-white/[0.06] text-white hover:bg-white/[0.1] hover:border-white/[0.18]"
            : "border border-white/20 bg-white text-zinc-950 font-semibold shadow-sm hover:bg-zinc-200"
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" strokeWidth={2} />
        ) : isAuthenticated ? (
          /* Profile Avatar Icon inside the pill */
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-200 text-xs border border-white/10">
            <User className="h-3 w-3" strokeWidth={2} />
          </div>
        ) : (
          <Wallet className="h-3.5 w-3.5 text-zinc-900" strokeWidth={2} />
        )}

        {/* Address / Status Label */}
        <span className="font-medium font-mono text-[12px] leading-none">
          {isAuthenticated
            ? displayName
            : statusLabel[status] || "Connect Wallet"}
        </span>

        {isAuthenticated && (
          <ChevronDown
            className={`h-3 w-3 text-[#94a3b8] transition-transform duration-200 ${
              menuOpen ? "rotate-180 text-white" : ""
            }`}
            strokeWidth={2}
          />
        )}
      </motion.button>

      {/* ─── ERROR TOAST ────────────────────────────────────────────── */}
      {error && !isAuthenticated && (
        <div
          role="alert"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[290px] rounded-xl border border-rose-500/30 bg-[#161214] p-3 text-[12px] leading-snug text-rose-300 shadow-2xl backdrop-blur-md"
        >
          {error.message}
        </div>
      )}

      {/* ─── MERGED PROFILE & WALLET HUB DROPDOWN MENU ──────────────── */}
      <AnimatePresence>
        {isAuthenticated && menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            role="menu"
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-[285px] overflow-hidden rounded-xl border border-white/[0.1] bg-[#111318] p-2 shadow-2xl backdrop-blur-xl"
          >
            {/* Identity & Wallet Header */}
            <div className="flex items-center gap-3 rounded-lg bg-white/[0.03] p-3 border border-white/[0.06]">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-white border border-white/10">
                <User className="h-5 w-5" strokeWidth={2} />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#111318]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-white">
                  {user?.username || "Verified Trader"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="truncate font-mono text-[11px] text-zinc-300">
                    {truncateAddress(walletAddress)}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    title="Copy wallet address"
                    aria-label="Copy wallet address"
                    className="flex h-5 w-5 items-center justify-center rounded text-[#94a3b8] hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-[#10b981]" strokeWidth={2.5} />
                    ) : (
                      <Copy className="h-3 w-3" strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="mt-1 space-y-0.5">
              {/* Profile Link */}
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-[#a6adbf] transition-all hover:bg-white/[0.06] hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] text-zinc-300 group-hover:bg-white/[0.1] group-hover:text-white transition-colors">
                    <User className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-medium leading-tight">Profile & Insights</p>
                    <p className="text-[10.5px] text-[#64748b] leading-tight mt-0.5">Watchlist & activity</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-white" />
              </Link>

              {/* Settings Link */}
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-[#a6adbf] transition-all hover:bg-white/[0.06] hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] text-zinc-300 group-hover:bg-white/[0.1] group-hover:text-white transition-colors">
                    <SettingsIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-medium leading-tight">Settings</p>
                    <p className="text-[10.5px] text-[#64748b] leading-tight mt-0.5">Appearance & preferences</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-white" />
              </Link>

              {/* Quick Theme Toggle Row */}
              <button
                type="button"
                onClick={toggleTheme}
                className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[#a6adbf] transition-all hover:bg-white/[0.06] hover:text-white text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] text-[#f59e0b] group-hover:bg-amber-500/20 transition-colors">
                    {isDark ? (
                      <Moon className="h-3.5 w-3.5" strokeWidth={1.8} />
                    ) : (
                      <Sun className="h-3.5 w-3.5" strokeWidth={1.8} />
                    )}
                  </div>
                  <div>
                    <p className="text-[12.5px] font-medium leading-tight">Theme Mode</p>
                    <p className="text-[10.5px] text-[#64748b] leading-tight mt-0.5">
                      {isDark ? "Dark theme active" : "Light theme active"}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-zinc-300 group-hover:underline">
                  {isDark ? "Light" : "Dark"}
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="my-1.5 h-px bg-white/[0.08]" />

            {/* Disconnect Wallet / Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-medium text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10">
                <LogOut className="h-3.5 w-3.5" strokeWidth={1.8} />
              </div>
              <span>Disconnect Wallet</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
