"use client";

import { useEffect, useState } from "react";
import { isAnswerCorrect } from "@/lib/ccdv/scoring";
import { saveMcqBest } from "@/lib/ccdv/storage";
import { loadStudy, resetMcqStudy, saveMcqStudy } from "@/lib/ccdv/study-api";
import type { McqAnswerRecord, McqAttemptRecord } from "@/lib/ccdv/study-types";
import type { CcdvMcq } from "@/lib/data/ccdv/types";
import { toggleSelection } from "../question/toggle-selection";

/**
 * State of one chapter's practice MCQs: the current attempt (resumable), the finished attempts
 * (history), and a reset that starts over. Everything is saved to the database as you answer.
 */
export function useMcqSession(chapterId: string, mcqs: CcdvMcq[]) {
  const [ready, setReady] = useState(false);
  const [answers, setAnswers] = useState<McqAnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);
  const [history, setHistory] = useState<McqAttemptRecord[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadStudy(chapterId).then((study) => {
      if (cancelled) return;
      setAnswers(study.mcq.current?.answers ?? []);
      setFinished(study.mcq.current?.finished ?? false);
      setHistory(study.mcq.history);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  const index = revealed ? answers.length - 1 : answers.length;
  const question = mcqs[index];

  const toggle = (optionIndex: number) =>
    setSelected((prev) =>
      toggleSelection(prev, optionIndex, question.answerIndexes.length),
    );

  const check = () => {
    const record: McqAnswerRecord = {
      index,
      selected,
      correct: isAnswerCorrect(question, selected),
    };
    const next = [...answers, record];
    setAnswers(next);
    setRevealed(true);
    void saveMcqStudy(chapterId, next, mcqs.length, false);
  };

  const next = async () => {
    setSelected([]);
    setRevealed(false);
    if (answers.length < mcqs.length) return;
    setFinished(true);
    saveMcqBest(chapterId, {
      correct: answers.filter((a) => a.correct).length,
      total: mcqs.length,
    });
    const study = await saveMcqStudy(chapterId, answers, mcqs.length, true);
    setHistory(study.mcq.history);
  };

  const reset = async () => {
    await resetMcqStudy(chapterId);
    setAnswers([]);
    setFinished(false);
    setSelected([]);
    setRevealed(false);
  };

  return {
    ready,
    answers,
    finished,
    history,
    selected,
    revealed,
    index,
    question,
    toggle,
    check,
    next,
    reset,
  };
}
