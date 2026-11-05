import { ControlSwitch } from "@/components/shared/simulator";
import { PRIORITY, type Layout, type ProjectFile } from "./logic";

export default function FileToggles({
  layout,
  onChange,
}: {
  layout: Layout;
  onChange: (l: Layout) => void;
}) {
  const flip = (f: ProjectFile, on: boolean) =>
    onChange({
      ...layout,
      present: on
        ? [...layout.present, f]
        : layout.present.filter((x) => x !== f),
    });
  return (
    <div className="flex flex-col gap-2">
      {PRIORITY.map((f, i) => (
        <ControlSwitch
          key={f}
          label={`${i + 1}. ${f}`}
          checked={layout.present.includes(f)}
          onChange={(on) => flip(f, on)}
        />
      ))}
      <ControlSwitch
        label="~/.hermes/SOUL.md আছে"
        checked={layout.soul}
        onChange={(soul) => onChange({ ...layout, soul })}
      />
      <ControlSwitch
        label="Project একটা git repo"
        checked={layout.gitRepo}
        onChange={(gitRepo) => onChange({ ...layout, gitRepo })}
      />
      <ControlSwitch
        label="git root-এও AGENTS.md আছে (তুমি subfolder-এ)"
        checked={layout.agentsAtRootToo}
        onChange={(agentsAtRootToo) => onChange({ ...layout, agentsAtRootToo })}
      />
      <ControlSwitch
        label="বিজয়ী file-এ সন্দেহজনক নির্দেশ (injection)"
        checked={layout.flagged}
        onChange={(flagged) => onChange({ ...layout, flagged })}
      />
    </div>
  );
}
