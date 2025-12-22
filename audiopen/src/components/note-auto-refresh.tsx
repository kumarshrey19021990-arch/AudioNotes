"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export function NoteAutoRefresh({
  enabled,
  intervalMs = 2000,
}: {
  enabled: boolean;
  intervalMs?: number;
}) {
  const router = useRouter();

  React.useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => router.refresh(), intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs, router]);

  return null;
}

