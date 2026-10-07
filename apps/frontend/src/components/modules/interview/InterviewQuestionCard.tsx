"use client";

import { useState } from "react";
import { Button, Textarea } from "@/components/shared/shadcn";
import InterviewFeedbackCard from "@/components/modules/interview/InterviewFeedbackCard";
import type {
  GradeResult,
  InterviewQuestion,
} from "@/components/modules/interview/interview.types";

export default function InterviewQuestionCard({
  question,
  index,
  total,
  command,
  result,
  submitting,
  onSubmit,
}: {
  question: InterviewQuestion;
  index: number;
  total: number;
  command: string;
  result: GradeResult | null;
  submitting: boolean;
  onSubmit: (command: string) => void;
}) {
  const [draft, setDraft] = useState(command);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground">
          Question {index + 1} of {total}
        </p>
        <h2 className="text-lg font-bold">{question.title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80">
          {question.scenario}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-muted-foreground">$</span>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type the complete command with all required flags and parameters"
            disabled={Boolean(result)}
            className="min-h-16 resize-none border-none bg-transparent p-0 font-mono shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      {!result && (
        <Button
          onClick={() => onSubmit(draft)}
          disabled={!draft.trim() || submitting}
          className="self-start"
        >
          {submitting ? "Grading…" : "Submit Answer"}
        </Button>
      )}

      {result && <InterviewFeedbackCard result={result} />}
    </div>
  );
}
