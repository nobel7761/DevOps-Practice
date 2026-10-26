import Markdown from "@/components/shared/Markdown";
import LessonSection from "@/components/system-design/lesson/LessonSection";
import type { LessonLabStep } from "@/lib/system-design/lesson.types";

function LabStep({ step, number }: { step: LessonLabStep; number: number }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {number}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="mb-1 font-medium">{step.title}</h3>
        <Markdown>{step.markdown}</Markdown>
      </div>
    </li>
  );
}

export default function LessonHandsOnLab({
  steps,
}: {
  steps: LessonLabStep[];
}) {
  return (
    <LessonSection section="lab">
      <ol className="flex flex-col gap-4">
        {steps.map((step, index) => (
          <LabStep key={step.title} step={step} number={index + 1} />
        ))}
      </ol>
    </LessonSection>
  );
}
