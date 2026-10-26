"use client";

import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { isPosted } from "@/lib/system-design/linkedin/post";

/** "Post করেছি" tick (Plan doc Section 11), stored as progress type "linkedin". Day 1-12 are always posted. */
export function usePostedState(topicId: string, day: number) {
  const [ticked, setTicked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    client
      .get<{ topicIds: string[] }>("/progress/linkedin")
      .then(
        (res) => !cancelled && setTicked(res.data.topicIds.includes(topicId)),
      )
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  function toggle(next: boolean) {
    setTicked(next);
    const request = next
      ? client.post(`/progress/linkedin/${topicId}/posted`)
      : client.delete(`/progress/linkedin/${topicId}/posted`);
    request.catch(() => setTicked(!next));
  }

  return {
    posted: isPosted(day, ticked),
    prepublished: isPosted(day, false),
    toggle,
  };
}
