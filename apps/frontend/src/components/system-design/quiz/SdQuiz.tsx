"use client";

import { ListChecks } from "lucide-react";
import Loader from "@/components/shared/Loader";
import LabComingSoonPanel from "@/components/modules/lab/LabComingSoonPanel";
import { SdQuizAttempt } from "./SdQuizAttempt";
import { SdQuizIntro } from "./SdQuizIntro";
import { SdQuizResult } from "./SdQuizResult";
import { useSdQuiz } from "./useSdQuiz";

/** A topic's quiz (Plan doc Section 7): intro → 20 questions → result with explanations → retry. */
export function SdQuiz({ topicId }: { topicId: string }) {
  const quiz = useSdQuiz(topicId);
  const { phase } = quiz;

  switch (phase.name) {
    case "loading":
      return <Loader size="md" />;
    case "unavailable":
      return (
        <LabComingSoonPanel
          icon={ListChecks}
          title="Quiz"
          description="এই topic-এর 60টা প্রশ্নের bank এখনো তৈরি হয়নি।"
        />
      );
    case "error":
      return (
        <p className="text-sm text-destructive">
          Quiz load করা যায়নি: {phase.message}
        </p>
      );
    case "intro":
      return <SdQuizIntro status={quiz.status} onStart={quiz.start} />;
    case "answering":
    case "submitting":
      return (
        <SdQuizAttempt
          attempt={phase.attempt}
          answers={quiz.answers}
          submitting={phase.name === "submitting"}
          onAnswer={quiz.answer}
          onSubmit={quiz.submit}
        />
      );
    case "result":
      return <SdQuizResult result={phase.result} onRetry={quiz.start} />;
  }
}
