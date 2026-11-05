"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { scoreAnswers } from "@/lib/ccdv/scoring";
import {
  clearDraft,
  loadDraft,
  saveAttempt,
  saveDraft,
  type AttemptRecord,
  type ExamDraft,
} from "@/lib/ccdv/storage";
import client from "@/lib/api/client";
import { EXAM_MINUTES } from "@/lib/data/ccdv/blueprint";
import type { CcdvExam } from "@/lib/data/ccdv/types";
import { toggleSelection } from "../question/toggle-selection";

export type ExamPhase = "intro" | "running" | "review" | "result";

const TOTAL_SEC = EXAM_MINUTES * 60;

export function useExamSession(exam: CcdvExam, contentId: string) {
  const [phase, setPhase] = useState<ExamPhase>("intro");
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(TOTAL_SEC);
  const [startedAt, setStartedAt] = useState(0);
  const [draft, setDraft] = useState<ExamDraft | null>(null);
  const [attempt, setAttempt] = useState<AttemptRecord | null>(null);
  const indexRef = useRef(0);
  indexRef.current = index;
  const submittedRef = useRef(false);

  useEffect(() => {
    setDraft(loadDraft(exam.number));
  }, [exam.number]);

  const start = useCallback(
    (resume: boolean) => {
      const saved = resume ? draft : null;
      setAnswers(saved?.answers ?? {});
      setFlagged(saved?.flagged ?? []);
      setTimeSpent(saved?.timeSpent ?? {});
      setIndex(saved?.currentIndex ?? 0);
      setRemaining(saved?.remainingSec ?? TOTAL_SEC);
      setStartedAt(saved?.startedAt ?? Date.now());
      submittedRef.current = false;
      setPhase("running");
    },
    [draft],
  );

  const submit = useCallback(
    (timedOut: boolean) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      const result = scoreAnswers(exam.questions, answers);
      const record: AttemptRecord = {
        id: `${exam.id}-${Date.now()}`,
        examNumber: exam.number,
        startedAt,
        submittedAt: Date.now(),
        durationSec: TOTAL_SEC - Math.max(remaining, 0),
        timedOut,
        answers,
        flagged,
        timeSpent,
        result,
      };
      saveAttempt(record);
      clearDraft(exam.number);
      client.post(`/progress/video/${contentId}/complete`).catch(() => {});
      setAttempt(record);
      setPhase("result");
    },
    [exam, answers, startedAt, remaining, flagged, timeSpent, contentId],
  );

  const running = phase === "running" || phase === "review";

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => value - 1);
      const qid = exam.questions[indexRef.current]?.id;
      if (phase === "running" && qid) {
        setTimeSpent((prev) => ({ ...prev, [qid]: (prev[qid] ?? 0) + 1 }));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, phase, exam.questions]);

  useEffect(() => {
    if (running && remaining <= 0) submit(true);
  }, [running, remaining, submit]);

  const saveSlot = Math.floor(remaining / 5);
  useEffect(() => {
    if (!running) return;
    saveDraft(exam.number, {
      answers,
      flagged,
      timeSpent,
      remainingSec: remaining,
      startedAt,
      currentIndex: index,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, answers, flagged, index, saveSlot]);

  const toggleOption = (optionIndex: number) => {
    const question = exam.questions[index];
    setAnswers((prev) => ({
      ...prev,
      [question.id]: toggleSelection(
        prev[question.id] ?? [],
        optionIndex,
        question.answerIndexes.length,
      ),
    }));
  };

  const toggleFlag = () => {
    const qid = exam.questions[index].id;
    setFlagged((prev) =>
      prev.includes(qid) ? prev.filter((id) => id !== qid) : [...prev, qid],
    );
  };

  return {
    phase,
    setPhase,
    answers,
    flagged,
    index,
    setIndex,
    remaining,
    draft,
    attempt,
    start,
    submit,
    toggleOption,
    toggleFlag,
  };
}
