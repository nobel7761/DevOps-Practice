"use client";

import { useState } from "react";
import SimulatorFrame from "../SimulatorFrame";
import Controls from "./Controls";
import Result from "./Result";
import { analyze, type Input } from "./logic";

export default function ModelSwitchCostSimulator() {
  const [input, setInput] = useState<Input>({
    mode: "session",
    tokens: 40000,
    sameModel: false,
    confirmThreshold: 100000,
  });
  return (
    <SimulatorFrame
      title="Model Switch Cost"
      hint="ELI5: মাঝপথে model বদলালে নতুন model-কে পুরো কথোপকথন আবার পড়তে হয় — সেই পড়ার দাম দেখো।"
    >
      <Controls input={input} set={(p) => setInput((s) => ({ ...s, ...p }))} />
      <Result r={analyze(input)} />
    </SimulatorFrame>
  );
}
