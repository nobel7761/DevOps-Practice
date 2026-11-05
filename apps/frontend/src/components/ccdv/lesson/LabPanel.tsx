import Markdown from "@/components/shared/Markdown";
import type { CcdvChapterContent } from "@/lib/data/ccdv/types";

export default function LabPanel({ lab }: { lab: CcdvChapterContent["lab"] }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-medium">🎯 লক্ষ্য: {lab.goal}</p>
      <div>
        <p className="mb-1 text-sm font-semibold">যা লাগবে</p>
        <ul className="list-disc pl-6 text-sm">
          {lab.requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <ol className="flex flex-col gap-4">
        {lab.steps.map((step, index) => (
          <li key={step.title} className="rounded-xl border border-border p-3">
            <p className="mb-2 font-semibold">
              Step {index + 1}: {step.title}
            </p>
            <Markdown>{step.body}</Markdown>
          </li>
        ))}
      </ol>
      <div>
        <p className="mb-1 text-sm font-semibold">
          ✅ Checkpoint — নিজেকে জিজ্ঞেস করো
        </p>
        <ul className="list-disc pl-6 text-sm">
          {lab.checkpoints.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
