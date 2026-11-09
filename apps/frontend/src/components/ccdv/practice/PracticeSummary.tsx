import { RotateCcw } from "lucide-react";
import { Button } from "@/components/shared/shadcn";
import type { McqAnswerRecord, McqAttemptRecord } from "@/lib/ccdv/study-types";
import type { CcdvMcq } from "@/lib/data/ccdv/types";
import McqHistory from "./McqHistory";
import McqReview from "./McqReview";

export default function PracticeSummary({
  mcqs,
  answers,
  history,
  onReset,
}: {
  mcqs: CcdvMcq[];
  answers: McqAnswerRecord[];
  history: McqAttemptRecord[];
  onReset: () => void;
}) {
  const correct = answers.filter((a) => a.correct).length;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
        <div>
          <p className="text-lg font-semibold">
            তোমার স্কোর: {correct} / {mcqs.length}
          </p>
          <p className="text-sm text-muted-foreground">
            নিচে প্রতিটা প্রশ্নের তোমার উত্তর, ✅/❌ আর ব্যাখ্যা দেখো। এটা
            সংরক্ষিত আছে, পরে এসেও দেখতে পারবে।
          </p>
        </div>
        <Button onClick={onReset}>
          <RotateCcw className="size-4" /> Reset করে আবার দাও
        </Button>
      </div>
      <McqReview mcqs={mcqs} answers={answers} />
      <McqHistory history={history} />
    </div>
  );
}
