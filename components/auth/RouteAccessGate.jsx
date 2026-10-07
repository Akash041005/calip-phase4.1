"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Footer from "../dashboard/Footer";
import { AUTH_STATUS, useAuth } from "./AuthProvider";

export default function RouteAccessGate({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isReady, status, isAuthenticated } = useAuth();
  const isPublicLanding = pathname === "/";

  useEffect(() => {
    if (!isReady || isPublicLanding || isAuthenticated) return;
    try {
      window.sessionStorage.setItem("calip.auth.returnTo", `${pathname}${window.location.search}`);
    } catch {
      // Fall back to the dashboard when session storage is unavailable.
    }
    router.replace("/");
  }, [isReady, isPublicLanding, isAuthenticated, router]);

  if (isPublicLanding) return children;

  if (!isReady || status !== AUTH_STATUS.AUTHENTICATED || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070a0f] px-6 text-white" aria-live="polite">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0f1520] px-5 py-4 text-sm text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
          <span>{isReady ? "Connect your wallet to enter Calip." : "Checking your secure session..."}</span>
        </div>
      </main>
    );
  }

  return (
    <>
      {children}
      <Footer />
    </>
  );
}
