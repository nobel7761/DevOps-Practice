"use client";

import { useEffect, useRef, useState } from "react";
import client from "@/lib/api/client";

/**
 * Persists completed simulator missions in the existing progress system
 * (content_progress, type "challenge", key "<simulatorId>:<challengeId>").
 * Returns the ids completed in earlier sessions, merged in on load.
 */
export function useChallengeProgress(
  simulatorId: string,
  completedIds: string[],
) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const posted = useRef(new Set<string>());
  const prefix = `${simulatorId}:`;

  useEffect(() => {
    let cancelled = false;
    client
      .get<{ completedKeys: string[] }>("/progress")
      .then((res) => {
        if (cancelled) return;
        const ids = res.data.completedKeys
          .filter((k) => k.startsWith(prefix))
          .map((k) => k.slice(prefix.length));
        ids.forEach((id) => posted.current.add(id));
        setSavedIds(ids);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [prefix]);

  useEffect(() => {
    for (const id of completedIds) {
      if (posted.current.has(id)) continue;
      posted.current.add(id);
      client
        .post(`/progress/challenge/${encodeURIComponent(prefix + id)}/complete`)
        .catch(() => posted.current.delete(id));
    }
  }, [completedIds, prefix]);

  return savedIds;
}
