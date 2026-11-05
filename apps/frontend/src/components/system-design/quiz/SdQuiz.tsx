"use client";

import { ListChecks } from "lucide-react";
import Loader from "@/components/shared/Loader";
import LabComingSoonPanel from "@/components/modules/lab/LabComingSoonPanel";
import { QUESTION_BANK_SIZE } from "./sd-quiz.types";
import { SdQuizAttempt } from "./SdQuizAttempt";
import { SdQuizIntro } from "./SdQuizIntro";
import { SdQuizResult } from "./SdQuizResult";
import { useSdQuiz } from "./useSdQuiz";

/** A topic's quiz (Plan doc Section 7): intro → 20 questions → result with explanations → retry. */
export function SdQuiz({
  topicId,
  basePath = "/sd-quiz",
  bankSize = QUESTION_BANK_SIZE,
}: {
  topicId: string;
  /** API prefix; the System Design quiz and the Hermes quiz share this UI. */
  basePath?: string;
  bankSize?: number;
}) {
  const quiz = useSdQuiz(topicId, basePath);
  const { phase } = quiz;

  switch (phase.name) {
    case "loading":
      return <Loader size="md" />;
    case "unavailable":
      return (
        <LabComingSoonPanel
          icon={ListChecks}
          title="Quiz"
          description="এই lesson-এর quiz এখনো তৈরি হয়নি।"
        />
      );
    case "error":
      return (
        <p className="text-sm text-destructive">
          Quiz load করা যায়নি: {phase.message}
        </p>
      );
    case "intro":
      return (
        <SdQuizIntro
          status={quiz.status}
          bankSize={bankSize}
          onStart={quiz.start}
        />
      );
    case "answering":
    case "submitting":
      return (
        <SdQuizAttempt
          attempt={phase.attempt}
          answers={quiz.answers}
          submitting={phase.name === "submitting"}
          onAnswer={quiz.answer}
          onSubmit={quiz.submit}
          bankSize={bankSize}
        />
      );
    case "result":
      return <SdQuizResult result={phase.result} onRetry={quiz.start} />;
  }
}
