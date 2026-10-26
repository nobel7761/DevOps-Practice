/** "কী ঘটছে" — the simulator's reasons for each decision, in Bangla, newest first (Plan doc Section 9.1 rule 7). */
export function EventLog({
  entries,
  limit = 30,
}: {
  entries: string[];
  limit?: number;
}) {
  const recent = entries.slice(-limit).reverse();
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">কী ঘটছে</span>
      <ol
        aria-live="polite"
        className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-lg border border-border p-2 font-mono text-xs"
      >
        {recent.length === 0 ? (
          <li className="text-muted-foreground">
            এখনো কিছু ঘটেনি। Traffic পাঠান।
          </li>
        ) : (
          recent.map((entry, index) => (
            <li key={entries.length - index}>{entry}</li>
          ))
        )}
      </ol>
    </div>
  );
}
