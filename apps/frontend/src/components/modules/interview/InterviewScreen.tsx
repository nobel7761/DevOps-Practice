"use client";

import { useState } from "react";
import { Button, Card, CardContent } from "@/components/shared/shadcn";
import InterviewQuestionCard from "@/components/modules/interview/InterviewQuestionCard";
import InterviewSummary from "@/components/modules/interview/InterviewSummary";
import type {
  GradeResult,
  InterviewSpec,
} from "@/components/modules/interview/interview.types";
import ModuleBreadcrumb from "@/components/modules/ModuleBreadcrumb";
import useAPI from "@/hooks/api/useAPI";
import client from "@/lib/api/client";
import type { CourseMilestone, CourseModule } from "@/lib/data/course-modules";

export default function InterviewScreen({
  moduleId,
  milestone,
  module,
}: {
  moduleId: string;
  milestone: CourseMilestone;
  module: CourseModule;
}) {
  const { data: spec, loading } = useAPI<InterviewSpec>({
    url: `/interview/${moduleId}`,
  });

  const [index, setIndex] = useState(0);
  const [commands, setCommands] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, GradeResult>>({});
  const [finished, setFinished] = useState(false);
  const [grading, setGrading] = useState(false);

  const handleSubmit = async (questionId: string, command: string) => {
    setCommands((prev) => ({ ...prev, [questionId]: command }));
    setGrading(true);
    try {
      const res = await client.post<GradeResult>(
        `/interview/${moduleId}/grade`,
        { questionId, command },
      );
      setResults((prev) => ({ ...prev, [questionId]: res.data }));
    } finally {
      setGrading(false);
    }
  };

  if (loading || !spec) {
    return (
      <main className="mx-auto w-[95%] max-w-3xl py-8 sm:py-12">
        <p className="text-sm text-muted-foreground">Interview load হচ্ছে...</p>
      </main>
    );
  }

  const question = spec.questions[index];
  const answeredCount = Object.keys(results).length;

  return (
    <main className="mx-auto w-[95%] max-w-3xl py-8 sm:py-12">
      <ModuleBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: milestone.title, href: `/?milestone=${milestone.id}` },
          {
            label: module.title,
            href: `/?milestone=${milestone.id}&module=${module.id}`,
          },
          { label: spec.title },
        ]}
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{spec.title}</h1>
          <p className="text-sm text-muted-foreground">
            DevOps Commands Interview
          </p>
        </div>
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

      {finished ? (
        <InterviewSummary
          questions={spec.questions}
          results={results}
          onRetake={() => {
            setIndex(0);
            setCommands({});
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
              total={spec.questions.length}
              command={commands[question.id] ?? ""}
              result={results[question.id] ?? null}
              submitting={grading}
              onSubmit={(command) => handleSubmit(question.id, command)}
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
    </main>
  );
}
