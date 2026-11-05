import { CheckCircle2 } from "lucide-react";
import InlineCode from "./InlineCode";

export default function LessonRecap({ points }: { points: string[] }) {
  if (points.length === 0) return null;
  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-lg font-semibold">সংক্ষেপে মনে রাখো</h2>
      <ul className="flex flex-col gap-2 text-sm">
        {points.map((point) => (
          <li key={point} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
            <span className="min-w-0">
              <InlineCode text={point} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
