import Link from "next/link";
import type { RecallRating } from "@/lib/system-design/recall/schedule";
import type { RecallPoint } from "@/lib/system-design/validate-topic";
import { RecallRatingButtons } from "./RecallRatingButtons";

/**
 * A point's prompt and ideal answer, then the self-rating. Only rendered
 * once the learner has revealed the answer, so they can't rate before checking.
 */
export function RecallPointCard({
  point,
  lastRating,
  lessonHref,
  onRate,
}: {
  point: RecallPoint;
  lastRating: RecallRating | null;
  /** Where the point's lesson lives; the card links to `lessonHref + point.lessonLink`. */
  lessonHref?: string;
  onRate: (rating: RecallRating) => void;
}) {
  return (
    <div
      aria-live="polite"
      className="flex flex-col gap-3 rounded-xl border border-border p-4"
    >
      <h4 className="font-semibold">{point.term}</h4>
      <p className="text-sm">
        <span className="font-medium">কী ব্যাখ্যা করতে পারা উচিত: </span>
        {point.prompt}
      </p>
      <p className="rounded-lg bg-muted/50 p-3 text-sm">
        <span className="font-medium">আদর্শ ব্যাখ্যা: </span>
        {point.answer}
      </p>
      <RecallRatingButtons current={lastRating} onRate={onRate} />
      {lastRating === "forgot" && (
        <Link
          href={`${lessonHref ?? ""}${point.lessonLink}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          📖 এই অংশটা আবার পড়ুন →
        </Link>
      )}
    </div>
  );
}
