"use client";

import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import client from "@/lib/api/client";
import type { SdAttempt, SdAttemptResult, SdQuizStatus } from "./sd-quiz.types";

type Phase =
  | { name: "loading" }
  | { name: "unavailable" }
  | { name: "error"; message: string }
  | { name: "intro" }
  | { name: "answering"; attempt: SdAttempt }
  | { name: "submitting"; attempt: SdAttempt }
  | { name: "result"; result: SdAttemptResult };

const errorMessage = (error: unknown) =>
  isAxiosError(error)
    ? (error.response?.data?.message ?? error.message)
    : "কিছু একটা ভুল হয়েছে।";

/** Drives one topic's quiz: status → attempt (20 questions) → result → retry with a fresh 20. */
export function useSdQuiz(topicId: string) {
  const [phase, setPhase] = useState<Phase>({ name: "loading" });
  const [status, setStatus] = useState<SdQuizStatus | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const loadStatus = useCallback(async () => {
    const res = await client.get<SdQuizStatus>(`/sd-quiz/${topicId}/status`);
    setStatus(res.data);
    return res.data;
  }, [topicId]);

  useEffect(() => {
    let cancelled = false;
    loadStatus()
      .then(
        (loaded) =>
          !cancelled &&
          setPhase(
            loaded.available ? { name: "intro" } : { name: "unavailable" },
          ),
      )
      .catch(
        (error) =>
          !cancelled &&
          setPhase({ name: "error", message: errorMessage(error) }),
      );
    return () => {
      cancelled = true;
    };
  }, [loadStatus]);

  const start = useCallback(async () => {
    setPhase({ name: "loading" });
    setAnswers({});
    try {
      const res = await client.post<SdAttempt>(`/sd-quiz/${topicId}/attempts`);
      setPhase({ name: "answering", attempt: res.data });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404)
        setPhase({ name: "unavailable" });
      else setPhase({ name: "error", message: errorMessage(error) });
    }
  }, [topicId]);

  const submit = useCallback(async () => {
    if (phase.name !== "answering") return;
    const { attempt } = phase;
    setPhase({ name: "submitting", attempt });
    try {
      const res = await client.post<SdAttemptResult>(
        `/sd-quiz/attempts/${attempt.attemptId}/submit`,
        { answers },
      );
      setPhase({ name: "result", result: res.data });
      await loadStatus();
    } catch (error) {
      setPhase({ name: "error", message: errorMessage(error) });
    }
  }, [answers, loadStatus, phase]);

  const answer = useCallback((questionId: string, optionIndex: number) => {
    setAnswers((current) => ({ ...current, [questionId]: optionIndex }));
  }, []);

  return { phase, status, answers, start, submit, answer };
}

export type SdQuiz = ReturnType<typeof useSdQuiz>;
