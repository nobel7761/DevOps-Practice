import { Button } from "@/components/shared/shadcn";
import type { RecallRating } from "@/lib/system-design/recall/schedule";
import { RATING_OPTIONS } from "./recall-colors";

export function RecallRatingButtons({
  current,
  onRate,
}: {
  current: RecallRating | null;
  onRate: (rating: RecallRating) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-muted-foreground">
        নিজের ব্যাখ্যার সাথে মিলিয়ে নিজেকে rate করুন:
      </span>
      <div className="flex flex-wrap gap-2">
        {RATING_OPTIONS.map((option) => (
          <Button
            key={option.rating}
            size="sm"
            variant={current === option.rating ? "secondary" : "outline"}
            title={option.hint}
            onClick={() => onRate(option.rating)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
