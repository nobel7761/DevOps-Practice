import { CircleDot } from "lucide-react";

export default function TopicList({ topics }: { topics: string[] }) {
  return (
    <ul className="grid gap-1 text-sm sm:grid-cols-2">
      {topics.map((topic) => (
        <li key={topic} className="flex items-start gap-2">
          <CircleDot className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <span>{topic}</span>
        </li>
      ))}
    </ul>
  );
}
