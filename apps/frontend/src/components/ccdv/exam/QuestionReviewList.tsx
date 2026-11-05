"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/shadcn";
import { isAnswerCorrect } from "@/lib/ccdv/scoring";
import { lessonContentId } from "@/lib/data/ccdv/schedule";
import type { CcdvExam } from "@/lib/data/ccdv/types";
import QuestionBody from "../question/QuestionBody";

export default function QuestionReviewList({
  exam,
  answers,
}: {
  exam: CcdvExam;
  answers: Record<string, number[]>;
}) {
  const [onlyWrong, setOnlyWrong] = useState(true);
  const rows = exam.questions
    .map((question, index) => ({ question, index }))
    .filter(
      ({ question }) =>
        !onlyWrong || !isAnswerCorrect(question, answers[question.id]),
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Question review</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setOnlyWrong((v) => !v)}
        >
          {onlyWrong ? "সব প্রশ্ন দেখাও" : "শুধু ভুলগুলো দেখাও"}
        </Button>
      </div>
      {rows.length === 0 && <p className="text-sm">কোনো ভুল নেই — দারুণ!</p>}
      {rows.map(({ question, index }) => (
        <div key={question.id} className="rounded-xl border border-border p-3">
          <p className="mb-2 text-xs text-muted-foreground">
            Q{index + 1} · D{question.domain} · {question.skill} ·{" "}
            <Link
              className="underline"
              href={`/ccdv/lesson/${lessonContentId(question.chapterId, "lesson")}`}
            >
              Revise {question.chapterId}
            </Link>
          </p>
          <QuestionBody
            question={question}
            selected={answers[question.id] ?? []}
            revealed
            onToggle={() => {}}
          />
        </div>
      ))}
    </div>
  );
}
