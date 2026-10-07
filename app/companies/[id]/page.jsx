"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// Compatibility route: /insights/[id] is the canonical company detail.
export default function TokenOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id || "grid";

  useEffect(() => {
    router.replace(`/insights/${id}`);
  }, [id, router]);

  return null;
}
