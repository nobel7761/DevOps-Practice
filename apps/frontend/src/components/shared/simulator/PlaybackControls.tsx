import { Pause, Play, SkipForward } from "lucide-react";
import { Button, ToggleGroup, ToggleGroupItem } from "../shadcn";

export const SIMULATOR_SPEEDS = [0.5, 1, 2, 4] as const;
export type SimulatorSpeed = (typeof SIMULATOR_SPEEDS)[number];

/** ▶️ Play / ⏸ Pause / ⏭ one step / speed 0.5x-4x (Plan doc Section 9.1 rule 2). */
export function PlaybackControls({
  playing,
  speed,
  onPlayPause,
  onStep,
  onSpeedChange,
}: {
  playing: boolean;
  speed: SimulatorSpeed;
  onPlayPause: () => void;
  onStep: () => void;
  onSpeedChange: (speed: SimulatorSpeed) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        onClick={onPlayPause}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause /> : <Play />}
        {playing ? "Pause" : "Play"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onStep}
        disabled={playing}
        aria-label="এক ধাপ"
      >
        <SkipForward />
        এক ধাপ
      </Button>
      <ToggleGroup
        type="single"
        size="sm"
        variant="outline"
        value={String(speed)}
        onValueChange={(value) =>
          value && onSpeedChange(Number(value) as SimulatorSpeed)
        }
        aria-label="Speed"
      >
        {SIMULATOR_SPEEDS.map((option) => (
          <ToggleGroupItem
            key={option}
            value={String(option)}
            className="px-2.5 text-xs"
          >
            {option}x
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
