"use client";

import { useEffect, useState } from "react";
import { syncAttempts } from "@/lib/ccdv/attempts-api";
import type { AttemptRecord } from "@/lib/ccdv/storage";

export function useAttempts(): AttemptRecord[] | null {
  const [attempts, setAttempts] = useState<AttemptRecord[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    syncAttempts().then((list) => {
      if (!cancelled) setAttempts(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return attempts;
}
