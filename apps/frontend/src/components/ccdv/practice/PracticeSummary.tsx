import { Button } from "@/components/shared/shadcn";

export default function PracticeSummary({
  correct,
  total,
  onRestart,
}: {
  correct: number;
  total: number;
  onRestart: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-border p-4">
      <p className="text-lg font-semibold">
        তোমার স্কোর: {correct} / {total}
      </p>
      <p className="text-sm text-muted-foreground">
        ভুল প্রশ্নের topic আবার Notes-এ দেখে নাও, তারপর আবার চেষ্টা করো।
      </p>
      <Button onClick={onRestart}>আবার practice করো</Button>
    </div>
  );
}
