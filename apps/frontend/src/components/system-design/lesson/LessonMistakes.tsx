import LessonSection from "@/components/system-design/lesson/LessonSection";
import type { LessonMistake } from "@/lib/system-design/lesson.types";

function MistakeCard({ mistake }: { mistake: LessonMistake }) {
  return (
    <li className="rounded-xl border border-border p-4 text-sm">
      <p className="text-foreground/85">❌ {mistake.mistake}</p>
      <p className="mt-2 text-foreground/85">✅ {mistake.fix}</p>
    </li>
  );
}

export default function LessonMistakes({
  mistakes,
}: {
  mistakes: LessonMistake[];
}) {
  return (
    <LessonSection section="mistakes">
      <ul className="flex flex-col gap-3">
        {mistakes.map((mistake) => (
          <MistakeCard key={mistake.mistake} mistake={mistake} />
        ))}
      </ul>
    </LessonSection>
  );
}
