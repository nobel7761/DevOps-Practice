import { Badge } from "@/components/shared/shadcn";
import type {
  CourseContentItem,
  CourseContentType,
} from "@/lib/data/course-modules";

const CONTENT_LABELS: Record<CourseContentType, string> = {
  lab: "Lab",
  pre_class: "Pre-class",
  live_class: "Live class",
  ai_interview: "AI interview",
  ai_exam: "AI exam",
  project_submission: "Project",
};

export default function ModuleContentBadges({
  contents,
}: {
  contents: CourseContentItem[];
}) {
  const counts = contents.reduce(
    (acc, item) => {
      acc[item.type] = (acc[item.type] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<CourseContentType, number>>,
  );
  const entries = Object.entries(counts) as [CourseContentType, number][];

  if (entries.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">No content yet</span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(([type, count]) => (
        <Badge key={type} variant="secondary">
          {CONTENT_LABELS[type]} · {count}
        </Badge>
      ))}
    </div>
  );
}
