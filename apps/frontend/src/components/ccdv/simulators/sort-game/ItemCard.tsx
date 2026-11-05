import { Check, X } from "lucide-react";
import { Button } from "@/components/shared/shadcn";
import { cn } from "@/lib/utils";
import type { SortBucket, SortItem } from "./index";

export default function ItemCard({
  item,
  buckets,
  choice,
  onChoose,
}: {
  item: SortItem;
  buckets: SortBucket[];
  choice: string | undefined;
  onChoose: (bucketId: string) => void;
}) {
  const answered = choice !== undefined;
  const right = choice === item.bucket;
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-3 text-sm",
        answered && (right ? "border-green-600/60" : "border-red-600/60"),
      )}
    >
      <p className="font-medium">{item.text}</p>
      <div className="flex flex-wrap gap-2">
        {buckets.map((bucket) => (
          <Button
            key={bucket.id}
            size="sm"
            variant={choice === bucket.id ? "default" : "outline"}
            disabled={answered}
            onClick={() => onChoose(bucket.id)}
          >
            {bucket.label}
          </Button>
        ))}
      </div>
      {answered && (
        <p className="flex gap-2 text-xs text-muted-foreground">
          {right ? (
            <Check className="size-4 shrink-0 text-green-600" />
          ) : (
            <X className="size-4 shrink-0 text-red-600" />
          )}
          <span>
            {right
              ? "ঠিক! "
              : `ভুল — সঠিক: ${buckets.find((b) => b.id === item.bucket)?.label}. `}
            {item.why}
          </span>
        </p>
      )}
    </div>
  );
}
