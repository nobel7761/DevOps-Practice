"use client";

import { useEffect, useRef, useState } from "react";
import client from "@/lib/api/client";

const SAVE_DELAY_MS = 800;

/** The learner's own experience line, saved through the existing notes API so it survives reloads. */
export function usePostExperience(topicId: string) {
  const noteId = `sd-linkedin-exp-${topicId}`;
  const [experience, setExperience] = useState("");
  const [saved, setSaved] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    client
      .get<{ content: string }>(`/notes/${noteId}`)
      .then((res) => !cancelled && setExperience(res.data?.content ?? ""))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [noteId]);

  function update(value: string) {
    setExperience(value);
    setSaved(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      client
        .put(`/notes/${noteId}`, { content: value })
        .then(() => setSaved(true))
        .catch(() => {});
    }, SAVE_DELAY_MS);
  }

  return { experience, update, saved };
}
