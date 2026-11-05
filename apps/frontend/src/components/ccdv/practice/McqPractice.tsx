"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/shared/shadcn";
import { isAnswerCorrect } from "@/lib/ccdv/scoring";
import { saveMcqBest } from "@/lib/ccdv/storage";
import type { CcdvMcq } from "@/lib/data/ccdv/types";
import QuestionBody from "../question/QuestionBody";
import { toggleSelection } from "../question/toggle-selection";
import PracticeSummary from "./PracticeSummary";

export default function McqPractice({
  chapterId,
  mcqs,
}: {
  chapterId: string;
  mcqs: CcdvMcq[];
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const finished = index >= mcqs.length;

  useEffect(() => {
    if (finished && mcqs.length > 0) {
      saveMcqBest(chapterId, { correct, total: mcqs.length });
    }
  }, [finished, chapterId, correct, mcqs.length]);

  const restart = () => {
    setIndex(0);
    setSelected([]);
    setRevealed(false);
    setCorrect(0);
  };

  if (finished) {
    return (
      <PracticeSummary
        correct={correct}
        total={mcqs.length}
        onRestart={restart}
      />
    );
  }

  const question = mcqs[index];
  const check = () => {
    setRevealed(true);
    if (isAnswerCorrect(question, selected)) setCorrect((value) => value + 1);
  };
  const next = () => {
    setIndex((value) => value + 1);
    setSelected([]);
    setRevealed(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        প্রশ্ন {index + 1} / {mcqs.length}
      </p>
      <QuestionBody
        question={question}
        selected={selected}
        revealed={revealed}
        onToggle={(i) =>
          setSelected((prev) =>
            toggleSelection(prev, i, question.answerIndexes.length),
          )
        }
      />
      {revealed ? (
        <Button onClick={next}>
          {index + 1 === mcqs.length ? "Result দেখো" : "পরের প্রশ্ন"}
        </Button>
      ) : (
        <Button
          disabled={selected.length !== question.answerIndexes.length}
          onClick={check}
        >
          উত্তর যাচাই করো
        </Button>
      )}
    </div>
  );
}
