"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Search, Sun, Moon, User, Settings as SettingsIcon, Menu, X } from "lucide-react";
import ConnectWalletButton from "../auth/ConnectWalletButton";
import { useAuth } from "../auth/AuthProvider";
import NotificationBell from "./NotificationBell";
import { stopScroll, startScroll } from "../motion/SmoothScrollProvider";
import { useTheme } from "../auth/ThemeProvider";

const navLinks = [
  { label: "Dashboard", href: "/dashboard", key: "dashboard" },
  { label: "Marketplace", href: "/marketplace", key: "marketplace" },
  { label: "Auction", href: "/auction/live", key: "auction" },
  { label: "Founders", href: "/founders", key: "founders" },
];

const toolsLinks = [
  { label: "Analytics", href: "/analytics" },
  { label: "Trending News", href: "/trending" },
  { label: "Performance Summary", href: "/performance-summary" },
  { label: "My Startups", href: "/my-startups" },
];

function resolveActivePage(pathname, propActive) {
  if (propActive) {
    return propActive;
  }
  if (!pathname || pathname === "/" || pathname.startsWith("/dashboard")) {
    return "dashboard";
  }
  if (pathname.startsWith("/marketplace")) return "marketplace";
  if (pathname.startsWith("/auction")) return "auction";
  if (pathname.startsWith("/founders")) return "founders";
  if (pathname.startsWith("/companies") || pathname.startsWith("/insights")) return "dashboard";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/settings") || pathname.startsWith("/setting")) return "settings";
  if (pathname.startsWith("/faq")) return "faq";
  if (
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/trending") ||
    pathname.startsWith("/performance-summary") ||
    pathname.startsWith("/my-startups")
  ) {
    return "tools";
  }
  return null;
}

export default function Navbar({ activePage: propActivePage }) {
  const pathname = usePathname();
  const currentActive = resolveActivePage(pathname, propActivePage);
  const isToolsActive = currentActive === "tools";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const toolsRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!toolsOpen) return;
    const handleClickOutside = (e) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [toolsOpen]);

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

  // Auto-hide on scroll up, reveal on scroll down.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        if (mobileOpen) {
          setNavHidden(false);
        } else if (y <= 8) {
          setNavHidden(false);
        } else if (y < lastY - 4) {
          setNavHidden(true);
        } else if (y > lastY + 2) {
          setNavHidden(false);
        }
        lastY = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileOpen]);

  const activeLinkClass =
    "inline-flex h-[34px] items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#6a60e7]/25 to-[#8174ff]/25 border border-[#8174ff]/50 px-4 text-[13.5px] font-semibold text-white shadow-[0_0_16px_rgba(129,116,255,0.22)] transition-all duration-150 select-none";

  const inactiveLinkClass =
    "inline-flex h-[34px] items-center justify-center gap-1.5 rounded-full px-4 text-[13.5px] font-medium text-[#a6adbf] hover:text-white hover:bg-white/[0.05] transition-all duration-150 select-none";

  return (
    <header className={`sticky top-0 z-40 w-full border-b border-[#e5e7eb] bg-[#fafaf7]/90 dark:border-white/[0.08] dark:bg-[#080a0f]/90 backdrop-blur-md motion-safe:transition-transform motion-safe:duration-300 ${navHidden ? "-translate-y-full" : "translate-y-0"}`}>
      <div className="mx-auto flex h-[64px] max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" aria-label="Calip dashboard" className="flex items-center transition-opacity hover:opacity-90">
          <Image
            src="/caliplogo.png"
            alt="Calip"
            width={88}
            height={34}
            priority
            className="h-[32px] w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center justify-center gap-2 lg:flex">
          {navLinks.map((link) => {
            const isActive = link.key === currentActive;
            return (
              <Link
                key={link.key}
                href={link.href}
                className={isActive ? activeLinkClass : inactiveLinkClass}
              >
                {link.label}
              </Link>
            );
          })}

          <div ref={toolsRef} className="relative">
            <button
              type="button"
              onClick={() => setToolsOpen((o) => !o)}
              className={isToolsActive ? activeLinkClass : inactiveLinkClass}
              aria-expanded={toolsOpen}
            >
              <span>Discover Tools</span>
              <ChevronDown
                className={`h-[11px] w-[11px] transition-transform duration-150 ${toolsOpen ? "rotate-180" : ""} ${
                  isToolsActive ? "text-white" : "text-[#737d91]"
                }`}
                strokeWidth={2}
              />
            </button>

            <AnimatePresence>
              {toolsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 top-[42px] z-[50] w-[220px] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0d111b]/95 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                >
                  {toolsLinks.map((tool) => {
                    const isToolCurrent = pathname === tool.href || pathname?.startsWith(tool.href + "/");
                    return (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setToolsOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-3.5 py-2 text-[13px] font-medium transition-all ${
                          isToolCurrent
                            ? "bg-[#8174ff]/20 font-semibold text-white shadow-[0_0_12px_rgba(129,116,255,0.2)]"
                            : "text-[#a6adbf] hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        <span>{tool.label}</span>
                        {isToolCurrent && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#8174ff]" />
                        )}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/faq"
            className={currentActive === "faq" ? activeLinkClass : inactiveLinkClass}
          >
            FAQs
          </Link>
        </nav>

        <div className="flex items-center justify-end gap-[10px] sm:gap-[12px]">
          {/* Mobile Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[#b6bdcc] transition-all hover:border-[#8174ff]/40 hover:text-white hover:bg-white/[0.08] lg:hidden"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="h-[16px] w-[16px] text-[#f59e0b]" strokeWidth={1.8} />
            ) : (
              <Moon className="h-[16px] w-[16px] text-[#b6bdcc]" strokeWidth={1.8} />
            )}
          </button>

          {/* Mobile Notification Bell */}
          {isAuthenticated && (
            <div className="lg:hidden">
              <NotificationBell />
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[#b6bdcc] transition-all hover:border-white/[0.2] hover:text-white lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-[18px] w-[18px]" strokeWidth={2} />
            ) : (
              <Menu className="h-[18px] w-[18px]" strokeWidth={2} />
            )}
          </button>

          <div className="hidden items-center gap-[10px] lg:flex">
            <Link
              href="/"
              aria-label="Search startups"
              className="flex h-[36px] w-[36px] items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[#b6bdcc] transition-all duration-150 hover:border-[#8174ff]/40 hover:bg-white/[0.08] hover:text-white"
            >
              <Search className="h-[15px] w-[15px]" strokeWidth={1.7} />
            </Link>

            {isAuthenticated && <NotificationBell />}

            <ConnectWalletButton />

            {/* Profile -> User Insights */}
            <Link
              href="/profile"
              aria-label="User Insights"
              title="User Insights"
              className={`flex h-[36px] w-[36px] items-center justify-center rounded-full border transition-all duration-150 ${
                currentActive === "profile"
                  ? "border-[#8174ff]/50 bg-[#8174ff]/20 text-white shadow-[0_0_14px_rgba(129,116,255,0.25)]"
                  : "border-white/[0.08] bg-white/[0.04] text-[#b6bdcc] hover:border-[#8174ff]/40 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <User className="h-[15px] w-[15px]" strokeWidth={1.7} />
            </Link>

            {/* Dedicated Settings Button */}
            <Link
              href="/settings"
              aria-label="Settings"
              title="Settings"
              className={`flex h-[36px] w-[36px] items-center justify-center rounded-full border transition-all duration-150 ${
                currentActive === "settings"
                  ? "border-[#8174ff]/50 bg-[#8174ff]/20 text-white shadow-[0_0_14px_rgba(129,116,255,0.25)]"
                  : "border-white/[0.08] bg-white/[0.04] text-[#b6bdcc] hover:border-[#8174ff]/40 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <SettingsIcon className="h-[15px] w-[15px]" strokeWidth={1.7} />
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-[36px] w-[36px] items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[#b6bdcc] transition-all duration-150 hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-white"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <Sun className="h-[15px] w-[15px] text-[#f59e0b]" strokeWidth={1.7} />
              ) : (
                <Moon className="h-[15px] w-[15px] text-[#b6bdcc]" strokeWidth={1.7} />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[calc(100vh-64px)] overflow-y-auto border-t border-[#e5e7eb] bg-[#fafaf7] dark:border-white/[0.08] dark:bg-[#080a0f] lg:hidden"
            data-lenis-prevent
          >
            <nav className="flex flex-col gap-[6px] px-[16px] py-[14px] sm:px-[24px]">
              {navLinks.map((link) => {
                const isActive = link.key === currentActive;
                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={closeMobile}
                    className={`flex h-[42px] items-center rounded-[10px] px-[14px] text-[15px] font-medium transition-colors ${
                      isActive
                        ? "bg-[#6366f1] text-[#ffffff] dark:bg-[#1e1b4b] dark:text-[#818cf8]"
                        : "text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#1a1a2e] dark:text-[#b0b5bf] dark:hover:bg-[#1e2234] dark:hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="my-[6px] border-t border-[#e5e7eb] dark:border-[#2a2e3e]" />

              <p className="px-[14px] pt-1 text-[12px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                Discover Tools
              </p>

              {toolsLinks.map((tool) => {
                const isToolActive = pathname === tool.href || pathname?.startsWith(tool.href + "/");
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={closeMobile}
                    className={`flex h-[42px] items-center justify-between rounded-[10px] px-[14px] text-[15px] font-medium transition-colors ${
                      isToolActive
                        ? "bg-[#6366f1] text-[13px] font-medium hover:text-[#ffffff] dark:bg-[#1e1b4b] dark:text-[#818cf8]"
                        : "text-[#6b7283] hover:bg-[#f3f4f6] hover:text-[#1a1a2e] dark:text-[#b0b5bf] dark:hover:bg-[#1e2234] dark:hover:text-white"
                    }`}
                  >
                    <span>{tool.label}</span>
                    {isToolActive && <span className="h-2 w-2 rounded-full bg-[#6366f1] dark:bg-[#818cf8]" />}
                  </Link>
                );
              })}

              <div className="my-[6px] border-t border-[#e5e7eb] dark:border-[#2a2e3e]" />

              <Link
                href="/faq"
                onClick={closeMobile}
                className={`flex h-[42px] items-center rounded-[10px] px-[14px] text-[15px] font-medium transition-colors ${
                  currentActive === "faq"
                    ? "bg-[#6366f1] text-[#ffffff] dark:bg-[#1e1b4b] dark:text-[#818cf8]"
                    : "text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#1a1a2e] dark:text-[#b0b5bf] dark:hover:bg-[#1e2234] dark:hover:text-white"
                }`}
              >
                FAQs
              </Link>

              {/* User Insights */}
              <Link
                href="/profile"
                onClick={closeMobile}
                className={`flex h-[42px] items-center gap-[10px] rounded-[10px] px-[14px] text-[15px] font-medium transition-colors ${
                  currentActive === "profile"
                    ? "bg-[#6366f1] text-[#ffffff] dark:bg-[#1e1b4b] dark:text-[#818cf8]"
                    : "text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#1a1a2e] dark:text-[#b0b5bf] dark:hover:bg-[#1e2234] dark:hover:text-white"
                }`}
              >
                <User className="h-[16px] w-[16px]" strokeWidth={1.5} />
                User Insights
              </Link>

              {/* Settings */}
              <Link
                href="/settings"
                onClick={closeMobile}
                className={`flex h-[42px] items-center gap-[10px] rounded-[10px] px-[14px] text-[15px] font-medium transition-colors ${
                  currentActive === "settings"
                    ? "bg-[#6366f1] text-[#ffffff] dark:bg-[#1e1b4b] dark:text-[#818cf8]"
                    : "text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#1a1a2e] dark:text-[#b0b5bf] dark:hover:bg-[#1e2234] dark:hover:text-white"
                }`}
              >
                <SettingsIcon className="h-[16px] w-[16px]" strokeWidth={1.5} />
                Settings
              </Link>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-[42px] items-center justify-between rounded-[10px] px-[14px] text-[15px] font-medium text-[#4b5563] dark:text-[#b0b5bf] transition-colors hover:bg-[#f3f4f6] hover:text-[#1a1a2e] dark:hover:bg-[#1e2234] dark:hover:text-white"
              >
                <span className="flex items-center gap-[10px]">
                  {isDark ? (
                    <Sun className="h-[16px] w-[16px] text-[#f59e0b]" strokeWidth={1.8} />
                  ) : (
                    <Moon className="h-[16px] w-[16px] text-[#374151] dark:text-[#b0b5bf]" strokeWidth={1.8} />
                  )}
                  {isDark ? "Dark Theme Active" : "Light Theme Active"}
                </span>
                <span className="text-[12px] font-semibold text-[#6366f1] dark:text-[#818cf8]">
                  Switch to {isDark ? "Light" : "Dark"}
                </span>
              </button>

              <div className="py-[8px]">
                <ConnectWalletButton />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
