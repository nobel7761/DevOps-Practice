import { Check, X } from "lucide-react";
import { Button } from "@/components/shared/shadcn";
import { cn } from "@/lib/utils";

export type OptionState = "idle" | "selected" | "correct" | "wrong" | "missed";

const STATE_CLASS: Record<OptionState, string> = {
  idle: "",
  selected: "border-primary bg-primary/10",
  correct: "border-green-600 bg-green-600/10",
  wrong: "border-red-600 bg-red-600/10",
  missed: "border-green-600 border-dashed",
};

export default function OptionButton({
  letter,
  text,
  state,
  disabled,
  onClick,
}: {
  letter: string;
  text: string;
  state: OptionState;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-auto w-full items-start justify-start gap-3 whitespace-normal px-3 py-2 text-left font-normal disabled:opacity-100",
        STATE_CLASS[state],
      )}
    >
      <span className="font-semibold">{letter}.</span>
      <span className="min-w-0 flex-1">{text}</span>
      {state === "correct" && (
        <Check className="size-4 shrink-0 text-green-600" />
      )}
      {state === "wrong" && <X className="size-4 shrink-0 text-red-600" />}
    </Button>
  );
}
