import { Badge } from "@/components/shared/shadcn";
import type { AttemptRecord } from "@/lib/ccdv/storage";
import { formatClock } from "../exam/ExamTimer";
import { averageSecondsPerQuestion } from "./aggregate";

export default function AttemptTable({
  attempts,
}: {
  attempts: AttemptRecord[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr>
            <th className="p-2">Date</th>
            <th className="p-2">Exam</th>
            <th className="p-2">Score</th>
            <th className="p-2">Result</th>
            <th className="p-2">Time</th>
            <th className="p-2">Sec / question</th>
          </tr>
        </thead>
        <tbody>
          {[...attempts].reverse().map((attempt) => (
            <tr key={attempt.id} className="border-t border-border">
              <td className="p-2">
                {new Date(attempt.submittedAt).toLocaleString()}
              </td>
              <td className="p-2">Mock {attempt.examNumber}</td>
              <td className="p-2 font-mono">
                {attempt.result.scaled} ({attempt.result.correct}/
                {attempt.result.total})
              </td>
              <td className="p-2">
                <Badge
                  variant={attempt.result.passed ? "default" : "destructive"}
                >
                  {attempt.result.passed ? "PASS" : "FAIL"}
                </Badge>
              </td>
              <td className="p-2 font-mono">
                {formatClock(attempt.durationSec)}
              </td>
              <td className="p-2 font-mono">
                {averageSecondsPerQuestion(attempt)}s
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
