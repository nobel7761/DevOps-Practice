"use client";

import { useState } from "react";
import SimulatorFrame from "../SimulatorFrame";
import Controls from "./Controls";
import Result from "./Result";
import { resolve, type Input } from "./logic";

export default function WebBackendSimulator() {
  const [input, setInput] = useState<Input>({
    capability: "search",
    perCapability: "",
    shared: "",
    envs: {},
    keylessFallback: true,
    keylessRescue: true,
    keyedFails: false,
  });
  return (
    <SimulatorFrame
      title="Web Backend নির্বাচন"
      hint="ELI5: কয়েকটা search দোকান আছে — Hermes কোন দোকানে যাবে সেটা config আর key দেখে ঠিক হয়।"
    >
      <Controls input={input} set={(p) => setInput((s) => ({ ...s, ...p }))} />
      <Result outcome={resolve(input)} />
    </SimulatorFrame>
  );
}
