import { ControlSlider, ControlSwitch } from "@/components/shared/simulator";
import { REFS, clampGit } from "./logic";

export default function RefPicker({
  chosen,
  git,
  onToggle,
  onGit,
}: {
  chosen: string[];
  git: number;
  onToggle: (id: string, on: boolean) => void;
  onGit: (n: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {REFS.map((r) => (
        <ControlSwitch
          key={r.id}
          label={r.label}
          description={
            r.blocked
              ? "Sensitive path — block হবে, inline warning"
              : `উদাহরণ ~${r.tokens} token`
          }
          checked={chosen.includes(r.id)}
          onChange={(on) => onToggle(r.id, on)}
        />
      ))}
      <ControlSwitch
        label={`@git:${clampGit(git)}`}
        description="শেষ N commit patch-সহ"
        checked={chosen.includes("git")}
        onChange={(on) => onToggle("git", on)}
      />
      <ControlSlider
        label="@git:N-এর N (১-১০-এ clamp)"
        value={git}
        min={1}
        max={15}
        onChange={onGit}
      />
    </div>
  );
}
