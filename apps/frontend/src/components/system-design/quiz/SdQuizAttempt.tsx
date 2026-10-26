"use client";

import { Button } from "@/components/shared/shadcn";
import type { SdAttempt } from "./sd-quiz.types";
import { SdQuizQuestion } from "./SdQuizQuestion";

export function SdQuizAttempt({
  attempt,
  answers,
  submitting,
  onAnswer,
  onSubmit,
}: {
  attempt: SdAttempt;
  answers: Record<string, number>;
  submitting: boolean;
  onAnswer: (questionId: string, optionIndex: number) => void;
  onSubmit: () => void;
}) {
  const answered = attempt.questions.filter(
    (q) => answers[q.id] !== undefined,
  ).length;
  const total = attempt.questions.length;

  return (
    <div className="flex flex-col gap-4">
      {attempt.newCycle && (
        <p className="rounded-lg bg-muted/50 p-3 text-sm">
          60টা প্রশ্নই একবার করে দেখা হয়ে গেছে। নতুন চক্র শুরু হলো।
        </p>
      )}
      <ol className="flex flex-col gap-3">
        {attempt.questions.map((question, index) => (
          <SdQuizQuestion
            key={question.id}
            number={index + 1}
            question={question}
            selected={answers[question.id]}
            onSelect={(option) => onAnswer(question.id, option)}
          />
        ))}
      </ol>
      <div className="sticky bottom-3 flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <span className="text-sm tabular-nums">
          {answered}/{total} উত্তর দেওয়া হয়েছে
        </span>
        <Button onClick={onSubmit} disabled={answered < total || submitting}>
          {submitting ? "জমা হচ্ছে..." : "জমা দিন"}
        </Button>
      </div>
    </div>
  );
}
