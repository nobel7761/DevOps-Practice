import { Badge, Card, CardContent } from "@/components/shared/shadcn";
import type { AttemptRecord } from "@/lib/ccdv/storage";
import { PASS_SCALED } from "@/lib/data/ccdv/blueprint";
import type { CcdvExam } from "@/lib/data/ccdv/types";
import DomainBars from "./DomainBars";
import { formatClock } from "./ExamTimer";
import QuestionReviewList from "./QuestionReviewList";

export default function ExamResult({
  exam,
  attempt,
}: {
  exam: CcdvExam;
  attempt: AttemptRecord;
}) {
  const { result } = attempt;
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold">
              Mock Exam {exam.number} — Result
            </h2>
            <Badge variant={result.passed ? "default" : "destructive"}>
              {result.passed ? "PASS" : "FAIL"}
            </Badge>
          </div>
          <p className="text-3xl font-bold">
            {result.scaled}{" "}
            <span className="text-base font-normal">
              / 1000 (pass {PASS_SCALED})
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            {result.correct} / {result.total} সঠিক ({result.percent}%) · সময়
            লেগেছে {formatClock(attempt.durationSec)}
            {attempt.timedOut ? " · সময় শেষে auto-submit" : ""} · scaled score
            একটি আনুমানিক হিসাব
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <h3 className="mb-3 text-base font-semibold">
            Domain-wise % correct
          </h3>
          <DomainBars byDomain={result.byDomain} />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <QuestionReviewList exam={exam} answers={attempt.answers} />
        </CardContent>
      </Card>
    </div>
  );
}
