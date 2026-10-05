import { Badge, Button } from "@/components/shared/shadcn";
import CodeBlock from "@/components/shared/CodeBlock";
import type { CommandEntry } from "@/lib/data/commands";

export default function CommandCard({
  entry,
  revealed,
  onReveal,
}: {
  entry: CommandEntry;
  revealed: boolean;
  onReveal?: () => void;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Badge variant="outline">{entry.category}</Badge>
      </div>
      <CodeBlock language="bash" code={entry.command} />

      {!revealed ? (
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={onReveal}
        >
          ব্যাখ্যা দেখুন
        </Button>
      ) : (
        <div className="mt-3 flex flex-col gap-3 text-sm">
          <p className="leading-relaxed">{entry.story}</p>
          <ul className="flex flex-col gap-1.5">
            {entry.tokens.map((token) => (
              <li
                key={token.token}
                className="flex flex-col gap-0.5 sm:flex-row sm:gap-2"
              >
                <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {token.token}
                </code>
                <span className="text-muted-foreground">{token.meaning}</span>
              </li>
            ))}
          </ul>
          {entry.tip && (
            <p className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
              {entry.tip}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
