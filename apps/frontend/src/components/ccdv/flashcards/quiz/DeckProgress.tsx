import type { ReactNode } from "react";
import { Progress } from "@/components/shared/shadcn";
import { cn } from "@/lib/utils";
import { themeFor } from "./card-themes";
import type { CardStatus } from "./QuizCard";

export default function DeckProgress({
  statuses,
  known,
  current,
  onJump,
  action,
}: {
  statuses: CardStatus[];
  known: number[];
  current: number;
  onJump: (index: number) => void;
  action?: ReactNode;
}) {
  const answered = statuses.filter((s) => s !== "idle").length;
  const correct = statuses.filter((s) => s === "correct").length;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span>
          উত্তর দেওয়া:{" "}
          <strong>
            {answered}/{statuses.length}
          </strong>
        </span>
        <span>
          সঠিক: <strong>{correct}</strong>
        </span>
        <span>
          মনে আছে: <strong>{known.length}</strong>
        </span>
        {action && <span className="ml-auto">{action}</span>}
      </div>
      <Progress
        value={statuses.length ? (correct / statuses.length) * 100 : 0}
      />
      <div className="flex flex-wrap gap-1.5" aria-label="Card navigator">
        {statuses.map((status, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Card ${i + 1}`}
            onClick={() => onJump(i)}
            className={cn(
              "size-3.5 rounded-full border border-transparent transition",
              status === "correct"
                ? "bg-green-500"
                : status === "incorrect"
                  ? "bg-red-500"
                  : "bg-muted-foreground/30",
              i === current &&
                cn(
                  "scale-125 ring-2 ring-offset-1",
                  themeFor(i).dot.replace("bg-", "ring-"),
                ),
            )}
          />
        ))}
      </div>
    </div>
  );
}
