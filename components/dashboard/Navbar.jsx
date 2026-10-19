"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Sun,
  Moon,
  User,
  Settings as SettingsIcon,
  Menu,
  X,
  BarChart3,
  TrendingUp,
  Newspaper,
  Zap,
  Store,
  Gavel,
  LayoutDashboard,
  Users,
  CircleHelp,
  Sparkles,
} from "lucide-react";
import ConnectWalletButton from "../auth/ConnectWalletButton";
import { useAuth } from "../auth/AuthProvider";
import NotificationBell from "./NotificationBell";
import { stopScroll, startScroll } from "../motion/SmoothScrollProvider";
import { useTheme } from "../auth/ThemeProvider";

// ─── 1. GLOBAL PLATFORM NAVIGATION (Left Side) ──────────────────────────────
// Common, exploratory, ecosystem-wide pages. No nested hidden dropdowns!
const globalPlatformNav = [
  { label: "Dashboard", href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { label: "Marketplace", href: "/marketplace", key: "marketplace", icon: Store },
  { label: "Auction", href: "/auction/live", key: "auction", icon: Gavel },
  { label: "Analytics", href: "/analytics", key: "analytics", icon: BarChart3 },
  { label: "Signals", href: "/trending", key: "signals", icon: Newspaper },
  { label: "Founders", href: "/founders", key: "founders", icon: Users },
  { label: "FAQ", href: "/faq", key: "faq", icon: CircleHelp, highlighted: true },
];

// ─── 2. USER-SPECIFIC COMMAND ACTIONS (Right Side) ──────────────────────────
// Actions & pages specific to the user's personal operations and portfolio
const userPersonalNav = [
  { label: "Performance", href: "/performance-summary", key: "performance", icon: TrendingUp },
  { label: "My Startups", href: "/my-startups", key: "my-startups", icon: Zap },
];

function resolveActivePage(pathname, propActive) {
  if (propActive) {
    if (propActive === "trending") return "signals";
    return propActive;
  }
  if (!pathname || pathname === "/" || pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/product-tour") || pathname.startsWith("/landing")) return "product-tour";
  if (pathname.startsWith("/marketplace")) return "marketplace";
  if (pathname.startsWith("/auction")) return "auction";
  if (pathname.startsWith("/analytics")) return "analytics";
  if (pathname.startsWith("/trending") || pathname.startsWith("/signals")) return "signals";
  if (pathname.startsWith("/founders")) return "founders";
  if (pathname.startsWith("/faq")) return "faq";
  if (pathname.startsWith("/performance-summary") || pathname.startsWith("/performance")) return "performance";
  if (pathname.startsWith("/my-startups")) return "my-startups";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/settings") || pathname.startsWith("/setting")) return "settings";
  return null;
}

export default function Navbar({ activePage: propActivePage }) {
  const pathname = usePathname();
  const currentActive = resolveActivePage(pathname, propActivePage);

  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, openConnectModal } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      stopScroll();
    } else {
      document.body.style.overflow = "";
      startScroll();
    }
    return () => {
      document.body.style.overflow = "";
      startScroll();
    };
  }, [mobileOpen]);

  const activePillClass =
    "inline-flex h-[32px] items-center justify-center gap-1.5 rounded-lg bg-slate-900 border border-slate-900 px-3 text-[12.5px] font-medium text-white dark:bg-white/[0.08] dark:border-white/[0.12] dark:text-white transition-colors duration-150 select-none shadow-sm";

  const inactivePillClass =
    "inline-flex h-[32px] items-center justify-center gap-1.5 rounded-lg border border-transparent px-3 text-[12.5px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-[#94a3b8] dark:hover:text-white dark:hover:bg-white/[0.04] transition-colors duration-150 select-none";

  const highlightedActivePillClass =
    "inline-flex h-[32px] items-center justify-center gap-1.5 rounded-lg bg-emerald-600 border border-emerald-600 px-3 text-[12.5px] font-bold text-white dark:bg-white dark:border-white dark:text-zinc-950 transition-colors duration-150 select-none shadow-md";

  const highlightedInactivePillClass =
    "inline-flex h-[32px] items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50/80 px-3 text-[12.5px] font-semibold text-emerald-800 hover:bg-emerald-100 hover:border-emerald-500/50 dark:border-white/20 dark:bg-white/[0.08] dark:text-white dark:hover:bg-white/[0.14] dark:hover:border-white/35 transition-colors duration-150 select-none shadow-sm";

  const userPillActiveClass =
    "inline-flex h-[32px] items-center justify-center gap-1.5 rounded-lg bg-slate-900 border border-slate-900 px-3 text-[12.5px] font-medium text-white dark:bg-white/[0.08] dark:border-white/[0.12] dark:text-white transition-colors duration-150 select-none shadow-sm";

  const userPillInactiveClass =
    "inline-flex h-[32px] items-center justify-center gap-1.5 rounded-lg border border-transparent px-3 text-[12.5px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-[#94a3b8] dark:hover:text-white dark:hover:bg-white/[0.04] transition-colors duration-150 select-none";

  const iconBtnClass =
    "flex h-[32px] w-[32px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-[#94a3b8] dark:hover:border-white/[0.16] dark:hover:bg-white/[0.06] dark:hover:text-white";

  const iconBtnActiveClass =
    "flex h-[32px] w-[32px] items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-slate-900 dark:border-white/[0.16] dark:bg-white/[0.08] dark:text-white transition-colors duration-150";

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 dark:border-white/[0.08] dark:bg-[#090a0f]/95 backdrop-blur-md font-sans text-slate-900 dark:text-white transition-colors duration-150"
    >
      <div className="mx-auto flex h-[58px] max-w-[1440px] items-center justify-between px-3 sm:px-5 lg:px-7">
        {/* ─── LEFT SIDE: LOGO + COMMON GLOBAL PLATFORM NAV ──────────────── */}
        <div className="flex items-center gap-4 lg:gap-5">
          {/* Brand Logo (Crisp in both Dark and Light mode) */}
          <Link
            href="/"
            aria-label="Calip home"
            className="flex items-center transition-opacity hover:opacity-90 shrink-0"
          >
            <Image
              src="/caliplogo.png"
              alt="Calip"
              width={112}
              height={38}
              priority
              className="hidden dark:block h-[34px] sm:h-[36px] w-auto object-contain"
            />
            <Image
              src="/caliplogo-dark-text.png"
              alt="Calip"
              width={112}
              height={38}
              priority
              className="block dark:hidden h-[34px] sm:h-[36px] w-auto object-contain"
            />
          </Link>

          {/* Thin Divider */}
          <div className="hidden lg:block h-5 w-px bg-slate-200 dark:bg-white/[0.08]" />

          {/* Global Platform Navigation (All direct, 1-click visible!) */}
          <nav className="hidden items-center gap-1 xl:gap-1.5 lg:flex" aria-label="Platform navigation">
            {globalPlatformNav.map((link) => {
              const isActive = link.key === currentActive;
              const Icon = link.icon;
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={
                    link.highlighted
                      ? isActive
                        ? highlightedActivePillClass
                        : highlightedInactivePillClass
                      : isActive
                      ? activePillClass
                      : inactivePillClass
                  }
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      link.highlighted && !isActive ? "text-emerald-600 dark:text-emerald-400" : "opacity-80"
                    }`}
                    strokeWidth={link.highlighted ? 2.2 : 1.8}
                  />
                  <span>{link.label}</span>
                  {link.highlighted && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? "bg-white dark:bg-zinc-950" : "bg-emerald-600 dark:bg-emerald-400"
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ─── RIGHT SIDE: USER-SPECIFIC CONTROLS & ACCOUNT HUB ───────────── */}
        <div className="flex items-center gap-2">
          {/* Desktop User Portfolio Pills (Performance, My Startups) */}
          <div className="hidden xl:flex items-center gap-1 mr-1">
            {userPersonalNav.map((item) => {
              const isActive = item.key === currentActive;
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={(e) => {
                    if (!isAuthenticated) {
                      e.preventDefault();
                      openConnectModal();
                    }
                  }}
                  className={isActive ? userPillActiveClass : userPillInactiveClass}
                  title={isAuthenticated ? item.label : `Connect wallet to view ${item.label}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "opacity-80"}`} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Vertical Separator */}
          <div className="hidden xl:block h-4 w-px bg-slate-200 dark:bg-white/[0.08] mx-0.5" />

          {/* Notification Bell (Only here, no duplicate!) */}
          {isAuthenticated && (
            <div>
              <NotificationBell />
            </div>
          )}

          {/* Merged Profile & Wallet (Contains Settings, Profile, Theme Toggle & Disconnect) */}
          <div className="shrink-0">
            <ConnectWalletButton />
          </div>

          {/* Circular Product Tour Button to the right of Connect Wallet */}
          <Link
            href="/product-tour"
            className="flex h-[32px] w-[32px] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 shadow-xs dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:border-white/[0.24] dark:hover:bg-white/[0.1] dark:hover:text-white transition-all shrink-0"
            title="Product Tour"
            aria-label="Product Tour"
          >
            <Sparkles className="h-4 w-4 text-amber-500" strokeWidth={2} />
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className={`${iconBtnClass} lg:hidden ml-1`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-[16px] w-[16px]" strokeWidth={2} />
            ) : (
              <Menu className="h-[16px] w-[16px]" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* ─── MOBILE DRAWER (Organized clearly: Global vs User) ───────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[calc(100vh-58px)] overflow-y-auto border-t border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#080a0f] lg:hidden"
            data-lenis-prevent
          >
            <div className="flex flex-col px-4 py-4 gap-1">
              {/* Global Platform Section */}
              <p className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#64748b]">
                Global Platform
              </p>
              {globalPlatformNav.map((link) => {
                const isActive = link.key === currentActive;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={closeMobile}
                    className={`flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition-colors ${
                      isActive
                        ? "bg-slate-100 border border-slate-300 text-slate-900 shadow-sm dark:bg-white/[0.08] dark:border-white/[0.12] dark:text-white"
                        : link.highlighted
                        ? "bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold dark:bg-white/[0.06] dark:border-white/20 dark:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-[#a6adbf] dark:hover:bg-white/[0.05] dark:hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        link.highlighted ? "text-emerald-600 dark:text-emerald-400" : "opacity-80"
                      }`}
                      strokeWidth={1.8}
                    />
                    <span>{link.label}</span>
                    {link.highlighted && (
                      <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Help & Docs
                      </span>
                    )}
                  </Link>
                );
              })}

              <Link
                href="/product-tour"
                onClick={closeMobile}
                className={`flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition-colors ${
                  currentActive === "product-tour"
                    ? "bg-slate-100 border border-slate-300 text-slate-900 shadow-sm dark:bg-white/[0.08] dark:border-white/[0.12] dark:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-[#a6adbf] dark:hover:bg-white/[0.05] dark:hover:text-white"
                }`}
              >
                <Sparkles className="h-4 w-4 shrink-0 text-amber-500" strokeWidth={2} />
                <span>Product Tour</span>
              </Link>

              <div className="my-2 h-px bg-slate-200 dark:bg-white/[0.07]" />

              {/* User Portfolio Section */}
              <p className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#64748b]">
                Your Portfolio & Tools
              </p>
              {userPersonalNav.map((link) => {
                const isActive = link.key === currentActive;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={(e) => {
                      closeMobile();
                      if (!isAuthenticated) {
                        e.preventDefault();
                        openConnectModal();
                      }
                    }}
                    className={`flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition-colors ${
                      isActive
                        ? "bg-slate-900 border border-slate-900 text-white shadow-sm dark:bg-white/[0.08] dark:border-white/[0.12] dark:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-[#a6adbf] dark:hover:bg-white/[0.05] dark:hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} strokeWidth={1.8} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <div className="my-2 h-px bg-slate-200 dark:bg-white/[0.07]" />

              {/* Account Section */}
              <p className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#64748b]">
                Account & Preferences
              </p>
              <Link
                href="/profile"
                onClick={(e) => {
                  closeMobile();
                  if (!isAuthenticated) {
                    e.preventDefault();
                    openConnectModal();
                  }
                }}
                className={`flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition-colors ${
                  currentActive === "profile"
                    ? "bg-slate-100 border border-slate-300 text-slate-900 dark:bg-white/[0.08] dark:border-white/[0.12] dark:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-[#a6adbf] dark:hover:bg-white/[0.05] dark:hover:text-white"
                }`}
              >
                <User className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                <span>Profile & Insights</span>
              </Link>
              <Link
                href="/settings"
                onClick={(e) => {
                  closeMobile();
                  if (!isAuthenticated) {
                    e.preventDefault();
                    openConnectModal();
                  }
                }}
                className={`flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition-colors ${
                  currentActive === "settings"
                    ? "bg-slate-100 border border-slate-300 text-slate-900 dark:bg-white/[0.08] dark:border-white/[0.12] dark:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-[#a6adbf] dark:hover:bg-white/[0.05] dark:hover:text-white"
                }`}
              >
                <SettingsIcon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                <span>Settings</span>
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-10 items-center justify-between rounded-xl px-3 text-[13.5px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-[#a6adbf] dark:hover:bg-white/[0.05] dark:hover:text-white transition-colors"
              >
                <span className="flex items-center gap-3">
                  {isDark ? (
                    <Sun className="h-4 w-4 text-[#f59e0b]" strokeWidth={1.8} />
                  ) : (
                    <Moon className="h-4 w-4" strokeWidth={1.8} />
                  )}
                  {isDark ? "Dark Theme Active" : "Light Theme Active"}
                </span>
                <span className="text-[11px] font-semibold text-slate-800 dark:text-zinc-300">
                  Switch to {isDark ? "Light" : "Dark"}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
