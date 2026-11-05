"use client";

import { useState } from "react";
import SimulatorFrame from "../SimulatorFrame";
import Controls from "./Controls";
import Result from "./Result";
import { evaluate, type Input } from "./logic";

export default function PluginGateSimulator() {
  const [input, setInput] = useState<Input>({
    source: "user",
    kind: "general",
    hasManifest: true,
    hasRegister: true,
    enabled: false,
    disabled: false,
    gateway: false,
    slowLoad: false,
  });
  const { checks, loaded } = evaluate(input);
  return (
    <SimulatorFrame
      title="Plugin Gate"
      hint="ELI5: Plugin একটা অতিথি — দরজার সব গেট পার হলে তবেই ঢুকতে পারে। কোন গেটে আটকাচ্ছে দেখো।"
    >
      <Controls input={input} set={(p) => setInput((s) => ({ ...s, ...p }))} />
      <Result checks={checks} loaded={loaded} />
    </SimulatorFrame>
  );
}
