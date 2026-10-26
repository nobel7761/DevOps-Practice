"use client";

import { useState } from "react";
import { PlainTextarea } from "@/components/shared/form";
import { Button } from "@/components/shared/shadcn";
import type { LessonOpenQuestion } from "@/lib/system-design/lesson.types";

export default function ExplainPromptCard({
  prompt,
}: {
  prompt: LessonOpenQuestion;
}) {
  const [answer, setAnswer] = useState("");
  const [showIdeal, setShowIdeal] = useState(false);

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <p className="font-medium">{prompt.question}</p>
      <PlainTextarea
        value={answer}
        onChange={setAnswer}
        placeholder="নিজের ভাষায় উত্তর লিখুন..."
        rows={3}
      />
      <Button
        variant="outline"
        className="w-fit"
        onClick={() => setShowIdeal((prev) => !prev)}
      >
        {showIdeal ? "আদর্শ উত্তর লুকান" : "আদর্শ উত্তর দেখুন"}
      </Button>
      {showIdeal && (
        <p className="rounded-lg bg-muted/50 p-3 text-sm text-foreground/85">
          {prompt.idealAnswer}
        </p>
      )}
    </li>
  );
}
