import { ControlSelect, ControlSwitch } from "@/components/shared/simulator";
import type { Command, Input } from "./logic";

export default function Controls({
  input,
  set,
}: {
  input: Input;
  set: (p: Partial<Input>) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        আগের session: <code>my project #3</code> (এই terminal-এর) ·{" "}
        <code>refactoring auth</code> (সবচেয়ে সাম্প্রতিক)
      </p>
      <ControlSelect<Command>
        label="Command"
        value={input.command}
        options={[
          { value: "c", label: "hermes -c" },
          { value: "latest", label: "hermes --resume latest" },
          { value: "c-title", label: 'hermes -c "my project"' },
          { value: "r-title", label: 'hermes --resume "refactoring auth"' },
        ]}
        onChange={(command) => set({ command })}
      />
      <ControlSwitch
        label="এই terminal-এর breadcrumb আছে"
        checked={input.breadcrumb}
        onChange={(breadcrumb) => set({ breadcrumb })}
      />
      <ControlSwitch
        label="session.terminal_continue"
        checked={input.terminalContinue}
        onChange={(terminalContinue) => set({ terminalContinue })}
      />
      <ControlSwitch
        label="Profile config বদলেছি"
        checked={input.configChanged}
        onChange={(configChanged) => set({ configChanged })}
      />
      <ControlSwitch
        label="SOUL.md / skills edit করেছি"
        checked={input.promptFilesEdited}
        onChange={(promptFilesEdited) => set({ promptFilesEdited })}
      />
      <ControlSwitch
        label="hermes sessions refresh-prompts চালিয়েছি"
        checked={input.refreshed}
        onChange={(refreshed) => set({ refreshed })}
      />
    </div>
  );
}
