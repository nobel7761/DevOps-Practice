import LessonSection from "@/components/system-design/lesson/LessonSection";

export default function LessonObjectives({
  objectives,
}: {
  objectives: string[];
}) {
  return (
    <LessonSection section="objectives">
      <ul className="list-disc space-y-1 pl-6 text-foreground/85">
        {objectives.map((objective) => (
          <li key={objective}>{objective}</li>
        ))}
      </ul>
    </LessonSection>
  );
}
