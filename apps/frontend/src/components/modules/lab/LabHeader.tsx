import { Badge } from "@/components/shared/shadcn";
import type { LabContent } from "@/lib/data/lab-content";

export default function LabHeader({ lab }: { lab: LabContent }) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold">{lab.title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        {lab.durationMinutes != null && (
          <Badge variant="secondary">{lab.durationMinutes} min</Badge>
        )}
        {lab.category && <Badge variant="outline">{lab.category}</Badge>}
      </div>
      {lab.learningObjectives.length > 0 && (
        <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
          {lab.learningObjectives.map((objective, index) => (
            <li key={index}>{objective}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
