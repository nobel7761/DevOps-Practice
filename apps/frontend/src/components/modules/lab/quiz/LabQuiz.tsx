"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/shared/shadcn";
import useAPI from "@/hooks/api/useAPI";
import QuizQuestionCard from "@/components/modules/lab/quiz/QuizQuestionCard";
import QuizResultSummary from "@/components/modules/lab/quiz/QuizResultSummary";

interface ServedQuestion {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
}

interface QuizResponse {
  labId: string;
  passPercent: number;
  questions: ServedQuestion[];
}

interface QuizResultItem {
  questionId: string;
  yourAnswerIndex: number;
  correctIndex: number;
  correct: boolean;
  explanation: string;
}

interface SubmitResult {
  labId: string;
  score: number;
  passPercent: number;
  passed: boolean;
  correctCount: number;
  totalCount: number;
  results: QuizResultItem[];
}

export default function LabQuiz({ labId }: { labId: string }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [attempt, setAttempt] = useState(0);

  const {
    data: quiz,
    loading: quizLoading,
    refetch,
  } = useAPI<QuizResponse>({ url: `/quiz/${labId}` });

  const {
    data: result,
    loading: submitting,
    callApi: submitQuiz,
    reset: resetResult,
  } = useAPI<
    SubmitResult,
    { answers: { questionId: string; answerIndex: number }[] }
  >({
    url: `/quiz/${labId}/submit`,
    method: "POST",
    lazy: true,
  });

  const allAnswered = quiz
    ? quiz.questions.every((question) => answers[question.id] !== undefined)
    : false;

  const resultById = useMemo(() => {
    const map = new Map<string, QuizResultItem>();
    result?.results.forEach((item) => map.set(item.questionId, item));
    return map;
  }, [result]);

  const handleSubmit = () => {
    if (!quiz) return;
    submitQuiz({
      answers: Object.entries(answers).map(([questionId, answerIndex]) => ({
        questionId,
        answerIndex,
      })),
    });
  };

  const handleRetry = () => {
    setAnswers({});
    resetResult();
    setAttempt((prev) => prev + 1);
    refetch();
  };

  if (quizLoading || !quiz) {
    return <p className="text-sm text-muted-foreground">Quiz load হচ্ছে...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {result && <QuizResultSummary result={result} onRetry={handleRetry} />}

      <div className="flex flex-col gap-3">
        {quiz.questions.map((question, index) => (
          <QuizQuestionCard
            key={`${question.id}-${attempt}`}
            index={index}
            question={question}
            selected={answers[question.id]}
            result={resultById.get(question.id)}
            disabled={Boolean(result)}
            onSelect={(answerIndex) =>
              setAnswers((prev) => ({ ...prev, [question.id]: answerIndex }))
            }
          />
        ))}
      </div>

      {!result && (
        <Button onClick={handleSubmit} disabled={!allAnswered || submitting}>
          {submitting
            ? "Submit হচ্ছে..."
            : `Submit করো (${Object.keys(answers).length}/${quiz.questions.length})`}
        </Button>
      )}
    </div>
  );
}
