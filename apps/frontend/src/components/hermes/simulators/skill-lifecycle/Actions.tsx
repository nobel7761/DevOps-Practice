import { ControlSelect, ControlSwitch } from "@/components/shared/simulator";
import { Button } from "@/components/shared/shadcn";
import { LABELS, type Action, type Origin, type Settings } from "./logic";

export default function Actions({
  origin,
  settings,
  actions,
  onOrigin,
  onSettings,
  onAction,
}: {
  origin: Origin;
  settings: Settings;
  actions: Action[];
  onOrigin: (o: Origin) => void;
  onSettings: (s: Settings) => void;
  onAction: (a: Action) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <ControlSelect
        label="Skill কোথা থেকে এসেছে"
        value={origin}
        options={[
          { value: "agent", label: "Agent নিজে বানাবে" },
          { value: "hub", label: "Hub থেকে install করা" },
        ]}
        onChange={onOrigin}
      />
      <ControlSwitch
        label="skills.write_approval: true"
        description="Agent-এর লেখা আগে staged থাকবে"
        checked={settings.writeApproval}
        onChange={(writeApproval) => onSettings({ ...settings, writeApproval })}
      />
      <ControlSwitch
        label="hermes curator lock"
        description="Agent-এর patch বন্ধ, পড়া চলবে"
        checked={settings.locked}
        onChange={(locked) => onSettings({ ...settings, locked })}
      />
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <Button
            key={a}
            size="sm"
            variant="outline"
            className="h-auto whitespace-normal py-1.5"
            onClick={() => onAction(a)}
          >
            {LABELS[a]}
          </Button>
        ))}
      </div>
    </div>
  );
}
