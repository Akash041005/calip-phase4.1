"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import LandingPage from "../components/landing/LandingPage";
import { useAuth } from "../components/auth/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { isReady, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isReady && isAuthenticated) router.replace("/dashboard");
  }, [isReady, isAuthenticated, router]);

  if (isReady && isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070a0f] text-white" aria-live="polite">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
        <span className="sr-only">Opening your Calip workspace</span>
      </main>
    );
  }

  return <LandingPage />;
}
