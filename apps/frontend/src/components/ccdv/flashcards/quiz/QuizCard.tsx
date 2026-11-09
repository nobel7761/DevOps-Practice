import { Check, Sparkles, X } from "lucide-react";
import Markdown from "@/components/shared/Markdown";
import { cn } from "@/lib/utils";
import type { CcdvFlashcard } from "@/lib/data/ccdv/types";
import { themeFor } from "./card-themes";

export type CardStatus = "idle" | "correct" | "incorrect";

function StatusChip({ status, known }: { status: CardStatus; known: boolean }) {
  if (status === "correct")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2 py-0.5 text-xs font-semibold">
        <Check className="size-3.5" /> সঠিক
      </span>
    );
  if (status === "incorrect")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2 py-0.5 text-xs font-semibold">
        <X className="size-3.5" /> আবার চেষ্টা
      </span>
    );
  return known ? (
    <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-semibold">
      মনে আছে
    </span>
  ) : null;
}

/** A colourful card: gradient header, readable body. Click the body to flip between question and answer. */
export default function QuizCard({
  card,
  index,
  total,
  flipped,
  status,
  known,
  onFlip,
}: {
  card: CcdvFlashcard;
  index: number;
  total: number;
  flipped: boolean;
  status: CardStatus;
  known: boolean;
  onFlip: () => void;
}) {
  const theme = themeFor(index);
  return (
    <div
      className={cn(
        "rounded-2xl bg-linear-to-br p-[3px] shadow-lg",
        theme.gradient,
      )}
    >
      <div className="overflow-hidden rounded-[14px] bg-card">
        <div
          className={cn(
            "flex items-center justify-between gap-2 bg-linear-to-r px-4 py-2 text-white",
            theme.gradient,
          )}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span aria-hidden>{theme.emoji}</span>
            Card {index + 1} / {total}
          </span>
          <StatusChip status={status} known={known} />
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={onFlip}
          onKeyDown={(event) =>
            (event.key === "Enter" || event.key === " ") && onFlip()
          }
          className={cn(
            "flex min-h-44 cursor-pointer select-none flex-col justify-center gap-2 bg-linear-to-br p-6 [&_p]:text-lg [&_p]:font-medium",
            theme.tint,
          )}
        >
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Sparkles className="size-3.5" />
            {flipped
              ? "উত্তর (ক্লিক করে প্রশ্নে ফেরো)"
              : "প্রশ্ন (ক্লিক করলে উত্তর দেখাবে)"}
          </p>
          <Markdown>{flipped ? card.back : card.front}</Markdown>
        </div>
      </div>
    </div>
  );
}
