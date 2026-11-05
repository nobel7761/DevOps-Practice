"use client";

import { useState } from "react";
import { LessonBox, PresetButtons } from "@/components/shared/simulator";
import SimulatorFrame from "../SimulatorFrame";
import Chips from "./Chips";
import ToolList from "./ToolList";
import { COMPOSITES } from "./data";
import { availableTools, cliCommand, toggle } from "./logic";

const PRESETS = [
  { id: "debugging", label: "debugging (file + terminal + web)" },
  { id: "safe", label: "safe (ছবি, vision, web — terminal নেই)" },
  { id: "coding", label: "coding (প্রায় সবকিছু)" },
  { id: "clear", label: "সব বন্ধ" },
];

export default function ToolsetPickerSimulator() {
  const [enabled, setEnabled] = useState<string[]>(["file", "terminal"]);

  return (
    <SimulatorFrame
      title="Toolset Picker"
      hint="ELI5: Toolset হলো যন্ত্রের বাক্স। যে বাক্স খুলবে, এজেন্ট শুধু সেই যন্ত্রগুলোই ব্যবহার করতে পারবে।"
    >
      <PresetButtons
        presets={PRESETS}
        onApply={(id) => setEnabled(COMPOSITES[id] ?? [])}
      />
      <Chips
        enabled={enabled}
        onToggle={(n) => setEnabled((e) => toggle(e, n))}
      />
      <ToolList tools={availableTools(enabled)} command={cliCommand(enabled)} />
      <LessonBox>
        Composite (debugging, safe, coding) আসলে অন্য toolset-এর গুচ্ছ।
        Browser/code_execution/cronjob-এর মতো capability-gated tool শুধু
        prerequisite configure থাকলেই দেখা যায়।
      </LessonBox>
    </SimulatorFrame>
  );
}
