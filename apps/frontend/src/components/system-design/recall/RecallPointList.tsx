import { Button } from "@/components/shared/shadcn";
import { RECALL_COLOR_ICON } from "./recall-colors";
import type { MindMapPoint } from "./RecallMindMap";

/** List view of the same points as the mind map — easier on small screens. */
export function RecallPointList({
  points,
  selected,
  onSelect,
}: {
  points: MindMapPoint[];
  selected: string | null;
  onSelect: (term: string) => void;
}) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {points.map((point) => (
        <li key={point.term}>
          <Button
            variant={selected === point.term ? "secondary" : "outline"}
            className="w-full justify-start"
            aria-pressed={selected === point.term}
            onClick={() => onSelect(point.term)}
          >
            <span aria-hidden="true">{RECALL_COLOR_ICON[point.color]}</span>
            {point.term}
          </Button>
        </li>
      ))}
    </ul>
  );
}
