import { ControlSelect, ControlSwitch } from "@/components/shared/simulator";
import type { Flags, Scenario } from "./logic";

const OPTIONS: { value: Scenario; label: string }[] = [
  { value: "normal", label: "সব ঠিকঠাক (source checkout)" },
  { value: "syntax-fail", label: "নতুন code-এ syntax error" },
  {
    value: "feature-branch-dirty",
    label: "Feature branch-এ আটকে + uncommitted change",
  },
  { value: "local-main", label: "main-এ নিজের local commit আছে" },
  { value: "docker", label: "Docker image দিয়ে install করা" },
];

export default function ScenarioControls({
  scenario,
  flags,
  onScenario,
  onFlags,
}: {
  scenario: Scenario;
  flags: Flags;
  onScenario: (s: Scenario) => void;
  onFlags: (f: Flags) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <ControlSelect
        label="পরিস্থিতি"
        value={scenario}
        options={OPTIONS}
        onChange={onScenario}
      />
      <ControlSwitch
        label="--no-backup"
        description="এই run-এ pre-update snapshot বন্ধ"
        checked={flags.noBackup}
        onChange={(noBackup) => onFlags({ ...flags, noBackup })}
      />
      <ControlSwitch
        label="--no-gateway-restart"
        description="restart ও fleet verification বাদ"
        checked={flags.noGatewayRestart}
        onChange={(noGatewayRestart) => onFlags({ ...flags, noGatewayRestart })}
      />
    </div>
  );
}
