import { Badge } from "@/components/shared/shadcn";
import type { CourseModuleTag } from "@/lib/data/course-modules";

const TAG_LABELS: Record<CourseModuleTag, string> = {
  new: "🆕 নতুন",
  published: "🔒 Published",
  optional: "ঐচ্ছিক",
};

export default function ModuleTagBadges({
  tags,
}: {
  tags?: CourseModuleTag[];
}) {
  if (!tags?.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge key={tag} variant="outline">
          {TAG_LABELS[tag]}
        </Badge>
      ))}
    </div>
  );
}
