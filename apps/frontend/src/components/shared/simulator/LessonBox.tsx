import { Lightbulb } from "lucide-react";
import type { ReactNode } from "react";

/** "শিক্ষা" box at the bottom of every simulator. */
export function LessonBox({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
      <Lightbulb className="size-5 shrink-0 text-primary" />
      <div>
        <p className="mb-1 font-semibold">শিক্ষা</p>
        {children}
      </div>
    </div>
  );
}
