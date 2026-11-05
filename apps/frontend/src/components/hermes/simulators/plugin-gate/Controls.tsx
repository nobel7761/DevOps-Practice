import { ControlSelect, ControlSwitch } from "@/components/shared/simulator";
import type { Input, Kind, Source } from "./logic";

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
        <ControlSelect<Source>
          label="Plugin কোথায় আছে?"
          value={input.source}
          options={[
            { value: "bundled", label: "Bundled (<repo>/plugins/)" },
            { value: "user", label: "User (~/.hermes/plugins/)" },
            { value: "project", label: "Project (.hermes/plugins/)" },
            { value: "pip", label: "pip entry point" },
          ]}
          onChange={(source) => set({ source })}
        />
        <ControlSelect<Kind>
          label="ধরন"
          value={input.kind}
          options={[
            { value: "general", label: "General (tools/hooks/commands)" },
            { value: "backend", label: "Backend / platform" },
          ]}
          onChange={(kind) => set({ kind })}
        />
      </div>
      <ControlSwitch
        label="gateway চালাচ্ছি (CLI নয়)"
        checked={input.gateway}
        onChange={(gateway) => set({ gateway })}
      />
      <ControlSwitch
        label="plugin.yaml আছে"
        checked={input.hasManifest}
        onChange={(hasManifest) => set({ hasManifest })}
      />
      <ControlSwitch
        label="register(ctx) আছে"
        checked={input.hasRegister}
        onChange={(hasRegister) => set({ hasRegister })}
      />
      <ControlSwitch
        label="plugins.enabled-এ নাম আছে"
        checked={input.enabled}
        onChange={(enabled) => set({ enabled })}
      />
      <ControlSwitch
        label="plugins.disabled-এও নাম আছে"
        checked={input.disabled}
        onChange={(disabled) => set({ disabled })}
      />
      <ControlSwitch
        label="Load ১০ সেকেন্ডের বেশি লাগে"
        checked={input.slowLoad}
        onChange={(slowLoad) => set({ slowLoad })}
      />
    </div>
  );
}
