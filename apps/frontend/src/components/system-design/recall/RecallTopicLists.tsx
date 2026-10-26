import Link from "next/link";
import { Button } from "@/components/shared/shadcn";
import { findSystemDesignTopic } from "@/lib/data/courses/system-design-a-z";
import type { RecallRecord } from "@/lib/system-design/recall/schedule";

const topicLabel = (topicId: string) => {
  const topic = findSystemDesignTopic(topicId);
  return topic ? `Day ${topic.day} · ${topic.title}` : topicId;
};

export function DueTopicList({
  groups,
  onStart,
}: {
  groups: { topicId: string; points: RecallRecord[] }[];
  onStart: (points: RecallRecord[]) => void;
}) {
  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        আজ review করার মতো কিছু নেই। একটা lesson শেষ করলে পরের দিন থেকে এখানে
        আসবে।
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {groups.map((group) => (
        <li
          key={group.topicId}
          className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm"
        >
          <span>
            {topicLabel(group.topicId)} ·{" "}
            <span className="tabular-nums">{group.points.length}টা point</span>
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStart(group.points)}
          >
            শুরু করুন
          </Button>
        </li>
      ))}
    </ul>
  );
}

export function WeakTopicList({
  topics,
}: {
  topics: { topicId: string; forgotten: number }[];
}) {
  if (topics.length === 0)
    return <p className="text-sm text-muted-foreground">এখনো কোনো 🔴 নেই।</p>;
  return (
    <ul className="flex flex-col gap-1.5 text-sm">
      {topics.map(({ topicId, forgotten }) => (
        <li key={topicId} className="flex items-center justify-between gap-3">
          <Link
            href={findSystemDesignTopic(topicId)?.href ?? "#"}
            className="hover:underline"
          >
            {topicLabel(topicId)}
          </Link>
          <span className="shrink-0 tabular-nums">🔴 {forgotten}</span>
        </li>
      ))}
    </ul>
  );
}
