import { Button } from "@/components/shared/shadcn";
import { TOOLSETS } from "./data";

export default function Chips({
  enabled,
  onToggle,
}: {
  enabled: string[];
  onToggle: (name: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TOOLSETS.map((t) => (
        <Button
          key={t.name}
          size="sm"
          variant={enabled.includes(t.name) ? "default" : "outline"}
          title={t.hint}
          onClick={() => onToggle(t.name)}
        >
          {t.name}
        </Button>
      ))}
    </div>
  );
}
