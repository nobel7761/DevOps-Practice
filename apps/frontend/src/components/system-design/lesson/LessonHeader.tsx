import { Badge } from "@/components/shared/shadcn";

export default function LessonHeader({
  day,
  title,
}: {
  day: number;
  title: string;
}) {
  return (
    <header className="mb-8 flex flex-col gap-2">
      <Badge variant="secondary" className="w-fit">
        Day {day}
      </Badge>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
    </header>
  );
}
