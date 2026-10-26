import Link from "next/link";
import LessonSection from "@/components/system-design/lesson/LessonSection";
import type { LessonTopicLink } from "@/lib/system-design/lesson.types";

export default function LessonPrerequisites({
  prerequisites,
}: {
  prerequisites: LessonTopicLink[];
}) {
  return (
    <LessonSection section="prerequisites">
      {prerequisites.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          কিছু লাগবে না, এখান থেকেই শুরু করা যায়।
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {prerequisites.map((topic) => (
            <li key={topic.day}>
              <Link
                href={topic.href}
                className="inline-flex rounded-full border border-border px-3 py-1 text-sm hover:border-primary/40 hover:bg-accent"
              >
                Day {topic.day} · {topic.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </LessonSection>
  );
}
