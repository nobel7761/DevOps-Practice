import { Button, Card, CardContent } from "@/components/shared/shadcn";
import {
  EXAM_ITEMS,
  EXAM_MINUTES,
  PASS_SCALED,
} from "@/lib/data/ccdv/blueprint";
import { formatClock } from "./ExamTimer";

const RULES = [
  "শুধু English প্রশ্ন, real exam-এর মতোই।",
  "Multiple-choice এবং multiple-response ('Select TWO') দুই ধরনের প্রশ্ন আছে।",
  "পুরো exam-এ কোনো উত্তর বা ব্যাখ্যা দেখানো হবে না — শেষে Submit করলে তবেই result আসবে।",
  "Question flag করা, আগে-পরে যাওয়া এবং শেষে Review screen দেখা যাবে।",
  "Timer শুরু হলে থামবে না। সময় শেষ হলে auto-submit হবে।",
  "Real exam closed-book: notes, phone, অন্য tab বন্ধ রাখো। এখানেও সৎভাবে দাও।",
];

export default function ExamIntro({
  number,
  draftRemaining,
  onStart,
  onResume,
}: {
  number: number;
  draftRemaining: number | null;
  onStart: () => void;
  onResume: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Mock Exam {number}</h2>
        <p className="text-sm">
          {EXAM_ITEMS} questions · {EXAM_MINUTES} minutes · pass mark{" "}
          {PASS_SCALED} / 1000 (estimated scaling)
        </p>
        <ul className="list-disc space-y-1 pl-6 text-sm">
          {RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {draftRemaining !== null && (
            <Button onClick={onResume}>
              অসমাপ্ত exam চালু করো ({formatClock(draftRemaining)} বাকি)
            </Button>
          )}
          <Button
            variant={draftRemaining !== null ? "outline" : "default"}
            onClick={onStart}
          >
            {draftRemaining !== null ? "নতুন করে শুরু করো" : "Start exam"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
