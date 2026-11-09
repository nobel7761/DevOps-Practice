import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/shared/shadcn";

export default function DeckNav({
  onPrev,
  onAgain,
  onKnown,
  onNext,
}: {
  onPrev: () => void;
  onAgain: () => void;
  onKnown: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={onPrev}>
        <ArrowLeft className="size-4" /> আগের
      </Button>
      <Button variant="outline" onClick={onAgain}>
        <RotateCcw className="size-4" /> আবার দেখব
      </Button>
      <Button onClick={onKnown}>
        <Check className="size-4" /> মনে আছে
      </Button>
      <Button variant="outline" onClick={onNext}>
        পরের <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
