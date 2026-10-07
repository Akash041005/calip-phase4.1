"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OverviewRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect generic overview route to User Insights
    router.replace("/profile");
  }, [router]);

  return null;
}