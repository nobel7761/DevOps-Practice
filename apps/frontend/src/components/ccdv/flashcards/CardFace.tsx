import { Card, CardContent } from "@/components/shared/shadcn";
import Markdown from "@/components/shared/Markdown";
import type { CcdvFlashcard } from "@/lib/data/ccdv/types";

export default function CardFace({
  card,
  flipped,
  onFlip,
}: {
  card: CcdvFlashcard;
  flipped: boolean;
  onFlip: () => void;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onFlip}
      onKeyDown={(event) =>
        (event.key === "Enter" || event.key === " ") && onFlip()
      }
      className="min-h-40 cursor-pointer select-none"
    >
      <CardContent className="flex min-h-40 flex-col justify-center gap-2">
        <p className="text-xs font-semibold text-muted-foreground">
          {flipped ? "উত্তর" : "প্রশ্ন (ক্লিক করে উল্টাও)"}
        </p>
        <Markdown>{flipped ? card.back : card.front}</Markdown>
      </CardContent>
    </Card>
  );
}
