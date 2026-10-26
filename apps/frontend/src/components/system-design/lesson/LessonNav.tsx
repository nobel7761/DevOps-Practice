import Link from "next/link";
import { Button } from "@/components/shared/shadcn";
import {
  adjacentTopicIds,
  findSystemDesignTopic,
} from "@/lib/data/courses/system-design-a-z";
import { WRITTEN_TOPIC_IDS } from "@/lib/data/system-design/written-topics";

/** Written lessons open directly; others open their spot in the course outline. */
const hrefFor = (topicId: string) =>
  WRITTEN_TOPIC_IDS.has(topicId)
    ? `/system-design/lesson/${topicId}`
    : (findSystemDesignTopic(topicId)?.href ?? "/course/system-design-a-z");

function NavLink({
  topicId,
  direction,
}: {
  topicId: string;
  direction: "previous" | "next";
}) {
  const topic = findSystemDesignTopic(topicId);
  if (!topic) return null;
  const label =
    direction === "next"
      ? `পরবর্তী lesson: Day ${topic.day} · ${topic.title} →`
      : `← Day ${topic.day} · ${topic.title}`;
  return (
    <Button
      asChild
      variant={direction === "next" ? "default" : "outline"}
      className="h-auto max-w-full py-2 whitespace-normal"
    >
      <Link href={hrefFor(topicId)}>{label}</Link>
    </Button>
  );
}

/** "পরবর্তী lesson" at the end of every lesson (Plan doc Section 11). */
export function LessonNav({ topicId }: { topicId: string }) {
  const { previous, next } = adjacentTopicIds(topicId);
  return (
    <nav
      aria-label="Lesson navigation"
      className="flex flex-wrap justify-between gap-3 border-t border-border pt-6 pb-12"
    >
      {previous ? (
        <NavLink topicId={previous} direction="previous" />
      ) : (
        <span />
      )}
      {next && <NavLink topicId={next} direction="next" />}
    </nav>
  );
}
