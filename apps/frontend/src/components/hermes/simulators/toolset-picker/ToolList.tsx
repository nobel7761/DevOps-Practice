export default function ToolList({
  tools,
  command,
}: {
  tools: string[];
  command: string;
}) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <pre className="overflow-x-auto rounded-lg border border-border bg-background/60 p-2 text-xs whitespace-pre-wrap break-all">
        {command}
      </pre>
      <p className="text-xs font-medium text-muted-foreground">
        এজেন্ট এখন {tools.length}টা tool পাবে
      </p>
      <div className="flex flex-wrap gap-1.5">
        {tools.map((t) => (
          <code
            key={t}
            className="rounded-md border border-border bg-card px-2 py-0.5 text-xs"
          >
            {t}
          </code>
        ))}
      </div>
    </div>
  );
}
