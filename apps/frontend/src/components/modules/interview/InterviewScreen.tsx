"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent } from "@/components/shared/shadcn";
import MarkCompleteButton from "@/components/shared/MarkCompleteButton";
import InterviewQuestionCard from "@/components/modules/interview/InterviewQuestionCard";
import InterviewSummary from "@/components/modules/interview/InterviewSummary";
import type {
  GradeResult,
  InterviewQuestion,
  InterviewSpec,
} from "@/components/modules/interview/interview.types";
import ModuleBreadcrumb from "@/components/modules/ModuleBreadcrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import useAPI from "@/hooks/api/useAPI";
import client from "@/lib/api/client";
import type { CourseMilestone, CourseModule } from "@/lib/data/course-modules";

export default function InterviewScreen({
  moduleId,
  courseId,
  milestone,
  module,
}: {
  moduleId: string;
  courseId: string;
  milestone: CourseMilestone;
  module: CourseModule;
}) {
  const { data: spec, loading } = useAPI<InterviewSpec>({
    url: `/interview/${moduleId}`,
  });
  const { language } = useLanguage();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, GradeResult>>({});
  const [finished, setFinished] = useState(false);
  const [grading, setGrading] = useState(false);
  const [translatedQuestions, setTranslatedQuestions] = useState<
    InterviewQuestion[] | null
  >(null);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (language !== "bn" || !spec || translatedQuestions) return;
    let cancelled = false;
    setTranslating(true);
    client
      .post<{ questions: InterviewQuestion[] }>(
        `/translate/interview/${moduleId}`,
        { questions: spec.questions },
        { timeout: 120000 },
      )
      .then((res) => {
        if (!cancelled) setTranslatedQuestions(res.data.questions);
      })
      .finally(() => {
        if (!cancelled) setTranslating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [language, spec, moduleId, translatedQuestions]);

  const handleSubmit = async (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    setGrading(true);
    try {
      const res = await client.post<GradeResult>(
        `/interview/${moduleId}/grade`,
        { questionId, answer },
      );
      setResults((prev) => ({ ...prev, [questionId]: res.data }));
    } finally {
      setGrading(false);
    }
  };

  if (loading || !spec) {
    return (
      <div className="mx-auto w-[95%] max-w-3xl py-8 sm:py-12">
        <p className="text-sm text-muted-foreground">Interview load হচ্ছে...</p>
      </div>
    );
  }

  const displayQuestions =
    language === "bn" && translatedQuestions
      ? translatedQuestions
      : spec.questions;
  const question = displayQuestions[index];
  const answeredCount = Object.keys(results).length;

  return (
    <div className="mx-auto w-[95%] max-w-3xl py-8 sm:py-12">
      <ModuleBreadcrumb
        items={[
          { label: "Home", href: "/" },
          {
            label: milestone.title,
            href: `/course/${courseId}?milestone=${milestone.id}`,
          },
          {
            label: module.title,
            href: `/course/${courseId}?milestone=${milestone.id}&module=${module.id}`,
          },
          { label: spec.title },
        ]}
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{spec.title}</h1>
          <p className="text-sm text-muted-foreground">AI Interview Practice</p>
        </div>
        <div className="flex items-center gap-2">
          <MarkCompleteButton contentKey={moduleId} type="interview" />
          {!finished && (
            <Button
              variant="outline"
              size="sm"
              disabled={answeredCount === 0}
              onClick={() => setFinished(true)}
            >
              Finish Interview
            </Button>
          )}
        </div>
      </div>

      {language === "bn" && translating && !translatedQuestions && (
        <p className="mb-3 text-xs text-muted-foreground">
          বাংলায় অনুবাদ হচ্ছে...
        </p>
      )}

      {finished ? (
        <InterviewSummary
          questions={displayQuestions}
          results={results}
          onRetake={() => {
            setIndex(0);
            setAnswers({});
            setResults({});
            setFinished(false);
          }}
        />
      ) : (
        <Card>
          <CardContent>
            <InterviewQuestionCard
              key={question.id}
              question={question}
              index={index}
              total={displayQuestions.length}
              answer={answers[question.id] ?? ""}
              result={results[question.id] ?? null}
              submitting={grading}
              onSubmit={(answer) => handleSubmit(question.id, answer)}
            />

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={index === 0}
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
              >
                ← Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={index === spec.questions.length - 1}
                onClick={() =>
                  setIndex((i) => Math.min(spec.questions.length - 1, i + 1))
                }
              >
                Next →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
