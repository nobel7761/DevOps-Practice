import { ControlSelect, ControlSwitch } from "@/components/shared/simulator";
import type { Input, Mode } from "./logic";

const TOKENS = [5000, 40000, 150000].map((v) => ({
  value: String(v),
  label: `${v.toLocaleString()} token`,
}));

export default function Controls({
  input,
  set,
}: {
  input: Input;
  set: (p: Partial<Input>) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <ControlSelect<Mode>
          label="Command"
          value={input.mode}
          options={[
            { value: "session", label: "/model <name>" },
            { value: "global", label: "/model <name> --global" },
            { value: "once", label: "/model <name> --once" },
          ]}
          onChange={(mode) => set({ mode })}
        />
        <ControlSelect<string>
          label="Session এখন কত বড়?"
          value={String(input.tokens)}
          options={TOKENS}
          onChange={(v) => set({ tokens: Number(v) })}
        />
      </div>
      <ControlSwitch
        label="একই model আবার select করছি"
        checked={input.sameModel}
        onChange={(sameModel) => set({ sameModel })}
      />
      <ControlSwitch
        label="switch_context_confirm_tokens = 100000 (default)"
        description="বন্ধ করলে মান 0 — confirmation prompt নেই"
        checked={input.confirmThreshold > 0}
        onChange={(c) => set({ confirmThreshold: c ? 100000 : 0 })}
      />
    </div>
  );
}
