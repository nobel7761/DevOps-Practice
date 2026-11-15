import { BookOpen, CheckCircle2, Flame, Trophy } from "lucide-react";
import StatTile from "@/components/shared/StatTile";
import type { CourseRow } from "./CourseGrid";

/** Totals across the user's courses. */
export default function HomeStats({ rows }: { rows: CourseRow[] }) {
  const items = rows.reduce((s, r) => s + r.stats.items, 0);
  const done = rows.reduce((s, r) => s + r.stats.done, 0);
  const finished = rows.filter((r) => r.stats.percent >= 100).length;
  const inProgress = rows.filter(
    (r) => r.stats.done > 0 && r.stats.percent < 100,
  ).length;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile icon={BookOpen} value={rows.length} label="Courses" />
      <StatTile icon={Flame} value={inProgress} label="In progress" />
      <StatTile
        icon={CheckCircle2}
        value={`${done}/${items}`}
        label="Lessons done"
      />
      <StatTile icon={Trophy} value={finished} label="Completed" />
    </div>
  );
}
