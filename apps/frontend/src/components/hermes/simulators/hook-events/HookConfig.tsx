import { ControlSelect, ControlSwitch } from "@/components/shared/simulator";
import { BEHAVIOURS, type Behaviour, type Hook } from "./logic";

export default function HookConfig({
  title,
  hook,
  note,
  onChange,
}: {
  title: string;
  hook: Hook;
  note: string;
  onChange: (patch: Partial<Hook>) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <p className="text-sm font-semibold">{title}</p>
      <ControlSelect<Behaviour>
        label="Script কী করল?"
        value={hook.behaviour}
        options={BEHAVIOURS}
        onChange={(behaviour) => onChange({ behaviour })}
      />
      <ControlSwitch
        label="fail_closed: true"
        description="শুধু pre_tool_call-এ কাজ করে"
        checked={hook.failClosed}
        onChange={(failClosed) => onChange({ failClosed })}
      />
      <p className="text-xs text-muted-foreground">→ {note}</p>
    </div>
  );
}
