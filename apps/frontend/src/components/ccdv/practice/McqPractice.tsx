"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/shared/shadcn";
import type { CcdvMcq } from "@/lib/data/ccdv/types";
import QuestionBody from "../question/QuestionBody";
import PracticeSummary from "./PracticeSummary";
import { useMcqSession } from "./useMcqSession";

export default function McqPractice({
  chapterId,
  mcqs,
}: {
  chapterId: string;
  mcqs: CcdvMcq[];
}) {
  const session = useMcqSession(chapterId, mcqs);
  if (!session.ready) return null;

  if (session.finished) {
    return (
      <PracticeSummary
        mcqs={mcqs}
        answers={session.answers}
        history={session.history}
        onReset={session.reset}
      />
    );
  }

  const { question, index, selected, revealed } = session;
  const resumed = !revealed && session.answers.length > 0;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          প্রশ্ন {index + 1} / {mcqs.length}
          {resumed &&
            " · আগের উত্তরগুলো সংরক্ষিত ছিল, সেখান থেকেই চালিয়ে যাচ্ছ"}
        </p>
        {session.answers.length > 0 && (
          <Button size="sm" variant="outline" onClick={session.reset}>
            <RotateCcw className="size-4" /> Reset
          </Button>
        )}
      </div>
      <QuestionBody
        question={question}
        selected={
          revealed ? (session.answers[index]?.selected ?? selected) : selected
        }
        revealed={revealed}
        onToggle={session.toggle}
      />
      {revealed ? (
        <Button onClick={session.next}>
          {index + 1 === mcqs.length ? "Result দেখো" : "পরের প্রশ্ন"}
        </Button>
      ) : (
        <Button
          disabled={selected.length !== question.answerIndexes.length}
          onClick={session.check}
        >
          উত্তর যাচাই করো
        </Button>
      )}
    </div>
  );
}
