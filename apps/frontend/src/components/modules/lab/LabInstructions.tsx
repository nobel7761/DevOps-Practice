import Markdown from "@/components/shared/Markdown";

export default function LabInstructions({
  markdown,
}: {
  markdown: string | null;
}) {
  if (!markdown) {
    return (
      <p className="text-sm text-muted-foreground">
        No instructions were found for this lab.
      </p>
    );
  }

  return (
    <div className="text-sm">
      <Markdown>{markdown}</Markdown>
    </div>
  );
}
