import { AlertTriangle, Info, Lightbulb, type LucideIcon } from "lucide-react";
import Markdown from "@/components/shared/Markdown";
import type { CalloutTone } from "@/lib/data/hermes/lesson.types";
import InlineCode from "./InlineCode";

const TONES: Record<
  CalloutTone,
  { icon: LucideIcon; className: string; label: string }
> = {
  tip: {
    icon: Lightbulb,
    className: "border-green-500/40 bg-green-500/10",
    label: "টিপ",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-500/40 bg-amber-500/10",
    label: "সাবধান",
  },
  info: {
    icon: Info,
    className: "border-blue-500/40 bg-blue-500/10",
    label: "জেনে রাখো",
  },
};

export default function LessonCallout({
  tone,
  title,
  markdown,
}: {
  tone: CalloutTone;
  title: string;
  markdown: string;
}) {
  const { icon: Icon, className, label } = TONES[tone];
  return (
    <aside className={`my-4 rounded-xl border p-4 ${className}`}>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4" />
        <span className="min-w-0">
          {label}: <InlineCode text={title} />
        </span>
      </p>
      <Markdown>{markdown}</Markdown>
    </aside>
  );
}
