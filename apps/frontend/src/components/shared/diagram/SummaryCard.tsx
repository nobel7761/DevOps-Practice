import type { ReactNode, Ref } from "react";

/** "এক নজরে" cheat-sheet card: topic, one-line definition, small diagram, 3 key points (Plan doc Section 6.1). */
export function SummaryCard({
  day,
  title,
  definition,
  diagram,
  keyPoints,
  cardRef,
}: {
  day: number;
  title: string;
  definition: string;
  diagram: ReactNode;
  keyPoints: string[];
  /** The node a LinkedIn image export captures. */
  cardRef?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={cardRef}
      className="flex flex-col gap-4 rounded-2xl border border-border p-5"
      style={{ background: "var(--sd-canvas)", color: "var(--sd-label)" }}
    >
      <div>
        <span className="text-xs font-semibold tracking-wide text-primary uppercase">
          Day {day}
        </span>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-1 text-sm opacity-80">{definition}</p>
      </div>
      <div className="overflow-x-auto">{diagram}</div>
      <ol className="flex flex-col gap-2">
        {keyPoints.map((point, index) => (
          <li key={point} className="flex gap-2 text-sm">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {index + 1}
            </span>
            {point}
          </li>
        ))}
      </ol>
    </div>
  );
}
