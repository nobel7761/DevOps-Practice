import { Check, X } from "lucide-react";
import { Button } from "@/components/shared/shadcn";
import { cn } from "@/lib/utils";
import type { SortBucket, SortItem } from "./index";

/** One item to classify. Pick a bucket now; the right answer and the reason appear only after Submit. */
export default function PickCard({
  item,
  buckets,
  choice,
  submitted,
  onPick,
}: {
  item: SortItem;
  buckets: SortBucket[];
  choice: string | undefined;
  submitted: boolean;
  onPick: (bucketId: string) => void;
}) {
  const right = choice === item.bucket;
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-3 text-sm",
        submitted && (right ? "border-green-600/60" : "border-red-600/60"),
      )}
    >
      <p className="font-medium">{item.text}</p>
      <div className="flex flex-wrap gap-2">
        {buckets.map((bucket) => (
          <Button
            key={bucket.id}
            size="sm"
            disabled={submitted}
            variant={choice === bucket.id ? "default" : "outline"}
            className={cn(
              submitted &&
                bucket.id === item.bucket &&
                "border-green-600 bg-green-600/15 text-foreground disabled:opacity-100",
              submitted &&
                choice === bucket.id &&
                !right &&
                "border-red-600 bg-red-600/15 text-foreground disabled:opacity-100",
            )}
            onClick={() => onPick(bucket.id)}
          >
            {bucket.label}
          </Button>
        ))}
      </div>
      {submitted && (
        <p className="flex gap-2 text-xs text-muted-foreground">
          {right ? (
            <Check className="size-4 shrink-0 text-green-600" />
          ) : (
            <X className="size-4 shrink-0 text-red-600" />
          )}
          <span>
            {choice === undefined ? "উত্তর দাওনি। " : right ? "ঠিক! " : "ভুল। "}
            সঠিক:{" "}
            <strong>
              {buckets.find((b) => b.id === item.bucket)?.label}
            </strong>. {item.why}
          </span>
        </p>
      )}
    </div>
  );
}
