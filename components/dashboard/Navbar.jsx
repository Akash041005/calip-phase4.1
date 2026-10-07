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
    "inline-flex h-[34px] items-center justify-center gap-1.5 rounded-[8px] bg-[#6366f1] px-[12px] text-[14px] font-medium text-[#ffffff] dark:bg-[#0e1a26] dark:text-[#c5c7e8] dark:border dark-border-[#6366f1]/40 dark:shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-colors duration-150 select-none";

  const inactiveLinkClass =
    "inline-flex h-[34px] items-center justify-center gap-1.5 rounded-[8px] px-[12px] text-[14px] font-medium text-[#6b7283] hover:text-[#1a1a2e] hover:bg-[#00000008] dark:text-[#7c8193] dark:hover:text-[#c5c7e8] dark:hover:bg-[#1e2238] transition-colors duration-150 select-none";

  return (
    <header className={`sticky top-0 z-40 w-full border-b border-[#e5e7eb] bg-[#fafaf7] motion-safe:transition-transform motion-safe:duration-300 dark:border-[#2a2e3e] dark:bg-[#12141c] ${navHidden ? "-translate-y-full" : "translate-y-0"}`}>
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-[16px] sm:px-[24px] lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-0 lg:px-[40px]">
        <Link href="/dashboard" aria-label="Calip dashboard">
          <Image
            src="/caliplogo.png"
            alt="Calip"
            width={86}
            height={36}
            priority
            className="h-[36px] w-auto"
          />
        </Link>

        <nav className="hidden items-center justify-center gap-[6px] sm:gap-[8px] lg:flex">
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
                  isToolsActive ? "text-[#6366f1] dark:text-[#818cf8]" : "text-[#6b7283] dark:text-[#b0b5bf]"
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
                  className="absolute left-0 top-[40px] z-[50] w-[220px] overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-white py-[6px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:border-[#2a2e3e] dark:bg-[#16181f] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                >
                  {toolsLinks.map((tool) => {
                    const isToolCurrent = pathname === tool.href || pathname?.startsWith(tool.href + "/");
                    return (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setToolsOpen(false)}
                        className={`flex items-center justify-between px-[14px] py-[9px] text-[13px] font-medium transition-colors ${
                          isToolCurrent
                            ? "bg-[#6366f1] font-semibold text-[#ffffff] dark:bg-[#1e1b4b] dark:text-[#c5c7e8]"
                            : "text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#1a1a2e] dark:text-[#b0b5bf] dark:hover:bg-[#1e2234] dark:hover:text-white"
                        }`}
                      >
                        <span>{tool.label}</span>
                        {isToolCurrent && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1] dark:bg-[#818cf8]" />
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
            className="flex h-[36px] w-[36px] items-center justify-center rounded-[8px] border border-[#e5e7eb] bg-[#f4f5f7] dark:border-[#2a2e3e] dark:bg-[#1c202e] transition-colors lg:hidden"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="h-[18px] w-[18px] text-[#f59e0b]" strokeWidth={1.8} />
            ) : (
              <Moon className="h-[18px] w-[18px] text-[#374151] dark:text-[#b0b5bf]" strokeWidth={1.8} />
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
            className="flex h-[36px] w-[36px] items-center justify-center rounded-[8px] border border-[#e5e7eb] bg-[#f4f5f7] dark:border-[#2a2e3e] dark:bg-[#1c202e] lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-[18px] w-[18px] text-[#374151] dark:text-[#b0b5bf]" strokeWidth={2} />
            ) : (
              <Menu className="h-[18px] w-[18px] text-[#374151] dark:text-[#b0b5bf]" strokeWidth={2} />
            )}
          </button>

          <div className="hidden items-center gap-[12px] lg:flex">
            <Link
              href="/"
              aria-label="Search startups"
              className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border border-[#e5e7eb] bg-[#f4f5f7] text-[#374151] transition-colors duration-150 hover:bg-[#e5e7eb] dark:border-[#2a2e3e] dark:bg-[#1c202e] dark:text-[#b0b5bf] dark:hover:bg-[#2a2e3e]"
            >
              <Search className="h-[15px] w-[15px]" strokeWidth={1.5} />
            </Link>

            {isAuthenticated && <NotificationBell />}

            <ConnectWalletButton />

            {/* Profile -> User Insights */}
            <Link
              href="/profile"
              aria-label="User Insights"
              title="User Insights"
              className={`flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border transition-colors duration-150 ${
                currentActive === "profile"
                  ? "border-[#6366f1]/30 bg-[#6366f1] text-[#ffffff] dark:border-[#818cf8]/40 dark:bg-[#1e1b4b] dark:text-[#818cf8]"
                  : "border-[#e5e7eb] bg-[#f4f5f7] text-[#374151] hover:bg-[#e5e7eb] dark:border-[#2a2e3e] dark:bg-[#1c202e] dark:text-[#b0b5bf] dark:hover:bg-[#2a2e3e]"
              }`}
            >
              <User className="h-[15px] w-[15px]" strokeWidth={1.5} />
            </Link>

            {/* Dedicated Settings Button */}
            <Link
              href="/settings"
              aria-label="Settings"
              title="Settings"
              className={`flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border transition-colors duration-150 ${
                currentActive === "settings"
                  ? "border-[#6366f1]/30 bg-[#6366f1] text-[#ffffff] dark:border-[#818cf8]/40 dark:bg-[#1e1b4b] dark:text-[#818cf8]"
                  : "border-[#e5e7eb] bg-[#f4f5f7] text-[#374151] hover:bg-[#e5e7eb] dark:border-[#2a2e3e] dark:bg-[#1c202e] dark:text-[#b0b5bf] dark:hover:bg-[#2a2e3e]"
              }`}
            >
              <SettingsIcon className="h-[15px] w-[15px]" strokeWidth={1.5} />
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border border-[#e5e7eb] bg-[#f4f5f7] dark:border-[#2a2e3e] dark:bg-[#1c202e] transition-colors duration-150 hover:bg-[#e5e7eb] dark:hover:bg-[#2a2e3e]"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <Sun className="h-[15px] w-[15px] text-[#f59e0b]" strokeWidth={1.5} />
              ) : (
                <Moon className="h-[15px] w-[15px] text-[#374151] dark:text-[#b0b5bf]" strokeWidth={1.5} />
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
            className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-[#e5e7eb] bg-[#fafaf7] dark:border-[#2a2e3e] dark:bg-[#12141c] lg:hidden"
            data-lenis-prevent
          >
            <nav className="flex flex-col gap-[4px] px-[16px] py-[12px] sm:px-[24px]">
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
