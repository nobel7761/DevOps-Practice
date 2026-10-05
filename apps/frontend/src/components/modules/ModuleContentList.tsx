import ModuleContentItemRow from "@/components/modules/ModuleContentItemRow";
import type { CourseContentItem } from "@/lib/data/course-modules";

export default function ModuleContentList({
  contents,
}: {
  contents: CourseContentItem[];
}) {
  if (contents.length === 0) {
    return <p className="text-xs text-muted-foreground">No content yet</p>;
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {contents.map((item, index) => (
        <ModuleContentItemRow key={`${item.type}-${index}`} item={item} />
      ))}
    </ul>
  );
}
