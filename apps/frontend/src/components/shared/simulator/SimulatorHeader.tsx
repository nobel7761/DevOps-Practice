import { Info, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "../shadcn";

/** Name, ℹ️ how-to-use and 🔄 reset — the same top bar on every simulator (Plan doc Section 9.1 rule 1). */
export function SimulatorHeader({
  title,
  howTo,
  onReset,
}: {
  title: string;
  howTo: ReactNode;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-base font-semibold">🎮 {title}</h3>
      <div className="flex gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="কিভাবে ব্যবহার করবেন"
            >
              <Info />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 text-sm">{howTo}</PopoverContent>
        </Popover>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Reset"
          onClick={onReset}
        >
          <RotateCcw />
        </Button>
      </div>
    </div>
  );
}
