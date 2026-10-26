import { Button } from "../shadcn";

export interface SimulatorPreset {
  id: string;
  label: string;
}

/** One-click "প্রস্তাবিত পরীক্ষা" scenarios (Plan doc Section 9.1 rule 9). */
export function PresetButtons({
  presets,
  onApply,
}: {
  presets: SimulatorPreset[];
  onApply: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">
        প্রস্তাবিত পরীক্ষা
      </span>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.id}
            size="sm"
            variant="outline"
            className="h-auto max-w-full py-1.5 text-left whitespace-normal"
            onClick={() => onApply(preset.id)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
