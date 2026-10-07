import Link from "next/link";
import { Badge } from "@/components/shared/shadcn";
import type {
  CourseContentItem,
  CourseContentType,
} from "@/lib/data/course-modules";
import { hasInterview } from "@/lib/data/interview-modules";

const TYPE_LABELS: Record<CourseContentType, string> = {
  lab: "Lab",
  pre_class: "Pre-class",
  live_class: "Live class",
  ai_interview: "AI interview",
  ai_exam: "AI exam",
  project_submission: "Project",
};

export default function ModuleContentItemRow({
  item,
  moduleId,
}: {
  item: CourseContentItem;
  moduleId: string;
}) {
  const label = (
    <div className="flex min-w-0 items-center gap-2">
      <Badge variant="outline" className="shrink-0">
        {TYPE_LABELS[item.type]}
      </Badge>
      <span className="truncate">{item.title ?? "Untitled"}</span>
    </div>
  );

  const isUnprovisionedLab = item.type === "lab" && !item.labId;
  const isVideo =
    (item.type === "live_class" || item.type === "pre_class") &&
    Boolean(item.videoUrl && item.contentId);
  const status = isUnprovisionedLab ? (
    <span className="shrink-0 text-xs italic text-muted-foreground">
      Coming soon
    </span>
  ) : item.completed ? (
    <span className="shrink-0 text-xs text-muted-foreground">Done</span>
  ) : null;

  const href =
    item.type === "lab" && item.labId
      ? `/module/lab/${item.labId}`
      : isVideo
        ? `/module/video/${item.contentId}`
        : item.type === "ai_interview" && hasInterview(moduleId)
          ? `/module/interview/${moduleId}`
          : null;

  if (href) {
    return (
      <li className="text-sm">
        <Link
          href={href}
          className="-mx-1 flex items-center justify-between gap-3 rounded-md px-1 py-0.5 hover:bg-accent hover:underline"
        >
          {label}
          {status}
        </Link>
      </li>
    );
  }

  return (
    <li
      className={`flex items-center justify-between gap-3 text-sm${isUnprovisionedLab ? " text-muted-foreground" : ""}`}
    >
      {label}
      {status}
    </li>
  );
}
