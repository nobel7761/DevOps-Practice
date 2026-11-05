"use client";

import { useState } from "react";
import SimulatorFrame from "../SimulatorFrame";
import Controls from "./Controls";
import Result from "./Result";
import { resolve, type Input } from "./logic";

export default function SessionResumeSimulator() {
  const [input, setInput] = useState<Input>({
    command: "c",
    breadcrumb: true,
    terminalContinue: true,
    configChanged: false,
    promptFilesEdited: false,
    refreshed: false,
  });
  return (
    <SimulatorFrame
      title="Session Resume"
      hint="ELI5: Game save-এর মতো — আবার খুললে কোন save লোড হবে আর কী কী সঙ্গে আসবে, দেখো।"
    >
      <Controls input={input} set={(p) => setInput((s) => ({ ...s, ...p }))} />
      <Result {...resolve(input)} />
    </SimulatorFrame>
  );
}
