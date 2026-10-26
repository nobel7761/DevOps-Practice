import { Badge, Button } from "@/components/shared/shadcn";
import type { SdQuizStatus } from "./sd-quiz.types";

const QUESTION_BANK_SIZE = 60;

function AttemptHistory({ attempts }: { attempts: SdQuizStatus["attempts"] }) {
  if (attempts.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {attempts.map((a, i) => (
        <li key={a.submittedAt ?? i}>
          <Badge variant={a.passed ? "default" : "secondary"}>
            {a.passed ? "✅" : "✕"} {a.score}/{a.total}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

export function SdQuizIntro({
  status,
  onStart,
}: {
  status: SdQuizStatus | null;
  onStart: () => void;
}) {
  const attempted = (status?.attempts.length ?? 0) > 0;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
      {status?.passed && <Badge className="w-fit">Quiz Passed ✅</Badge>}
      <p className="text-sm text-muted-foreground">
        60টা প্রশ্নের bank থেকে প্রতিবার 20টা। Pass করতে 95% (20-এ অন্তত 19)
        লাগবে। আগে না দেখা প্রশ্ন আগে আসবে।
      </p>
      {status && (
        <p className="text-xs text-muted-foreground">
          এই চক্রে দেখা হয়েছে {status.seenCount}/{QUESTION_BANK_SIZE}টা প্রশ্ন
        </p>
      )}
      <AttemptHistory attempts={status?.attempts ?? []} />
      <Button className="w-fit" onClick={onStart}>
        {attempted ? "আবার চেষ্টা করুন (নতুন 20টা)" : "Quiz শুরু করুন"}
      </Button>
    </div>
  );
}
