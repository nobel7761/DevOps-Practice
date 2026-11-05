import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function ExamTimer({ remaining }: { remaining: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-sm",
        remaining <= 300 && "border-red-600 text-red-600",
      )}
    >
      <Clock className="size-4" />
      {formatClock(remaining)}
    </span>
  );
}
