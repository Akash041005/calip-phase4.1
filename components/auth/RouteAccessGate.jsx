"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, ShieldCheck, Wallet, ArrowRight } from "lucide-react";
import Navbar from "../dashboard/Navbar";
import Footer from "../dashboard/Footer";
import { AUTH_STATUS, useAuth } from "./AuthProvider";

// Only user-facing state-mutating routes require an active Web3 wallet session:
const PROTECTED_PREFIXES = [
  "/performance-summary",
  "/performance",
  "/my-startups",
  "/profile",
  "/settings",
  "/marketplace/create",
];

function isRouteProtected(pathname) {
  if (!pathname || pathname.startsWith("/admin")) return false;
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default function RouteAccessGate({ children }) {
  const pathname = usePathname();
  const { isReady, isAuthenticated, openConnectModal } = useAuth();

  const requiresAuth = isRouteProtected(pathname);

  // If the route is public, render immediately without blocking:
  if (!requiresAuth) {
    return <>{children}</>;
  }

  // If checking session on initial load of a protected route:
  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-slate-900 dark:bg-[#090a0f] dark:text-white transition-colors" aria-live="polite">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700 shadow-sm dark:border-white/[0.08] dark:bg-[#111318] dark:text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin text-slate-900 dark:text-white" />
          <span>Verifying secure Web3 session…</span>
        </div>
      </main>
    );
  }

  // If unauthenticated visitor hits a protected route, render an elegant gate rather than breaking or looping:
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 dark:bg-[#090a0f] dark:text-white transition-colors duration-150">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200/90 bg-white p-8 sm:p-10 text-center shadow-xl dark:border-white/[0.08] dark:bg-[#111318]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white shadow-sm">
              <Lock className="h-6 w-6" strokeWidth={1.8} />
            </div>

            <h1 className="mt-5 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Wallet Connection Required
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
              This area contains your personal portfolio metrics, transaction history, and registered startup operations. Connect your Web3 wallet to access your private account.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={openConnectModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>

              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-white/[0.1] dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.08] transition-colors"
              >
                <span>Explore Markets</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-zinc-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Base Mainnet Supported • Non-Custodial Sign In</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
