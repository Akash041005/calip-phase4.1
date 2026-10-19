"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "../../lib/adminApi";

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/admin/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090a0f] text-slate-400 text-xs">
      Loading Administrative Gateway...
    </div>
  );
}
