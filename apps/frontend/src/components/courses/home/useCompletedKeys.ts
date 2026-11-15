"use client";

import { useEffect, useState } from "react";
import client from "@/lib/api/client";

/** The user's completed content keys (null while loading). Failure just means "no progress shown". */
export function useCompletedKeys() {
  const [keys, setKeys] = useState<Set<string> | null>(null);
  useEffect(() => {
    let cancelled = false;
    client
      .get<{ completedKeys: string[] }>("/progress")
      .then((r) => !cancelled && setKeys(new Set(r.data.completedKeys)))
      .catch(() => !cancelled && setKeys(new Set()));
    return () => {
      cancelled = true;
    };
  }, []);
  return keys;
}
