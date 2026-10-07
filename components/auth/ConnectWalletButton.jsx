"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Wallet, Loader2, LogOut, Copy, Check, ChevronDown } from "lucide-react";
import { AUTH_STATUS, useAuth } from "./AuthProvider";
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

  const handleCopy = useCallback(async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; ignore.
    }
  }, [walletAddress]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  const statusLabel = {
    [AUTH_STATUS.CONNECTING]: "Connecting...",
    [AUTH_STATUS.SIGNING]: "Sign Message",
    [AUTH_STATUS.AUTHENTICATING]: "Authenticating...",
  };

  const label = isAuthenticated
    ? truncateAddress(walletAddress)
    : statusLabel[status] || "Connect Wallet";

  const icon = isLoading ? (
    <Loader2 className="h-[17px] w-[17px] animate-spin" strokeWidth={1.5} />
  ) : (
    <Wallet className="h-[17px] w-[17px]" strokeWidth={1.5} />
  );

  const baseClass =
    "flex h-[34px] items-center gap-[6px] rounded-[10px] bg-[#6366F1] px-[14px] text-white font-bold text-[13px] transition-all duration-150 shadow-[0_0_12px_rgba(99,102,241,0.25)] hover:shadow-[0_0_20px_rgba(99,102,241,0.45)] disabled:cursor-not-allowed disabled:opacity-80";

  return (
    <div ref={rootRef} className="relative">
      {reduced ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={isLoading}
          className={baseClass}
          aria-haspopup={isAuthenticated ? "menu" : undefined}
          aria-expanded={isAuthenticated ? menuOpen : undefined}
          aria-label={isAuthenticated ? `Connected wallet ${walletAddress}` : "Connect Wallet"}
        >
          {icon}
          <span className="text-[13px] font-medium leading-none">{label}</span>
          {isAuthenticated && (
            <ChevronDown className="h-[12px] w-[12px]" strokeWidth={2} />
          )}
        </button>
      ) : (
        <motion.button
          type="button"
          onClick={handleClick}
          disabled={isLoading}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={tapTransition}
          className={baseClass}
          aria-haspopup={isAuthenticated ? "menu" : undefined}
          aria-expanded={isAuthenticated ? menuOpen : undefined}
          aria-label={isAuthenticated ? `Connected wallet ${walletAddress}` : "Connect Wallet"}
        >
          {icon}
          <span className="text-[13px] font-medium leading-none">{label}</span>
          {isAuthenticated && (
            <ChevronDown className="h-[12px] w-[12px]" strokeWidth={2} />
          )}
        </motion.button>
      )}

      {error && !isAuthenticated && (
        <div
          role="alert"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[300px] rounded-[12px] border border-[#fecaca] bg-[#fef2f2] px-[14px] py-[10px] text-[12px] leading-snug text-[#b91c1c] shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        >
          {error.message}
        </div>
      )}

      {isAuthenticated && menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[270px] overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:border-[#2a2e3e] dark:bg-[#181c28]"
        >
          <div className="flex items-center gap-[10px] border-b border-[#f0f0ee] dark:border-[#2a2e3e] px-[16px] py-[14px]">
            <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[#5346ae]">
              <Wallet className="h-[16px] w-[16px] text-white" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-mono text-[13px] font-medium leading-none text-[#1a1a2e] dark:text-white">
                {truncateAddress(walletAddress)}
              </p>
              <p className="mt-[4px] truncate text-[12px] leading-none text-[#6b7280] dark:text-[#9ca3af]">
                {user?.username || user?.email || "Connected with MetaMask"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy wallet address"
              className="ml-auto flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[6px] text-[#6b7280] dark:text-[#9ca3af] transition-colors hover:bg-[#f3f3f1] dark:hover:bg-[#2a2e3e]"
            >
              {copied ? (
                <Check className="h-[14px] w-[14px] text-[#10b981]" strokeWidth={2} />
              ) : (
                <Copy className="h-[14px] w-[14px]" strokeWidth={1.5} />
              )}
            </button>
          </div>

          <Link
            href="/settings"
            onClick={() => setMenuOpen(false)}
            className="block px-[16px] py-[10px] text-[13px] font-medium leading-none text-[#374151] dark:text-[#b0b5bf] transition-colors hover:bg-[#f9f9f7] dark:hover:bg-[#1e2234]"
          >
            Settings
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-[8px] border-t border-[#f0f0ee] dark:border-[#2a2e3e] px-[16px] py-[11px] text-[13px] font-medium leading-none text-[#dc2626] transition-colors hover:bg-[#fef2f2] dark:hover:bg-[#3b1111]"
          >
            <LogOut className="h-[14px] w-[14px]" strokeWidth={1.5} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
