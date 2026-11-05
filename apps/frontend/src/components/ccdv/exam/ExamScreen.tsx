"use client";

import type { CcdvExam } from "@/lib/data/ccdv/types";
import ExamIntro from "./ExamIntro";
import ExamResult from "./ExamResult";
import ExamRunner from "./ExamRunner";
import ReviewScreen from "./ReviewScreen";
import { useExamSession } from "./useExamSession";

export default function ExamScreen({
  exam,
  contentId,
}: {
  exam: CcdvExam;
  contentId: string;
}) {
  const session = useExamSession(exam, contentId);

  if (session.phase === "intro") {
    return (
      <ExamIntro
        number={exam.number}
        draftRemaining={session.draft?.remainingSec ?? null}
        onStart={() => session.start(false)}
        onResume={() => session.start(true)}
      />
    );
  }
  if (session.phase === "result" && session.attempt) {
    return <ExamResult exam={exam} attempt={session.attempt} />;
  }
  if (session.phase === "review") {
    return (
      <ReviewScreen
        exam={exam}
        answers={session.answers}
        flagged={session.flagged}
        remaining={session.remaining}
        onGo={session.setIndex}
        onBack={() => session.setPhase("running")}
        onSubmit={() => session.submit(false)}
      />
    );
  }
  return (
    <ExamRunner
      exam={exam}
      index={session.index}
      answers={session.answers}
      flagged={session.flagged}
      remaining={session.remaining}
      onGo={session.setIndex}
      onToggleOption={session.toggleOption}
      onToggleFlag={session.toggleFlag}
      onReview={() => session.setPhase("review")}
    />
  );
}
