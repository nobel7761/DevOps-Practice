"use client";

import { Checkbox } from "@/components/shared/shadcn";
import { courseRegistry } from "@/lib/data/courses/registry";

export default function CourseCheckboxList({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (courseId: string) => void;
}) {
  return (
    <ul className="max-h-64 space-y-2 overflow-y-auto">
      {courseRegistry.map(({ id, course }) => (
        <li key={id}>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={selected.includes(id)}
              onCheckedChange={() => onToggle(id)}
            />
            {course.courseTitle}
          </label>
        </li>
      ))}
    </ul>
  );
}
