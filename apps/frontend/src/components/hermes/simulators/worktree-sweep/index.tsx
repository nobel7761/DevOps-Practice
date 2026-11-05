"use client";

import { useState } from "react";
import { PresetButtons } from "@/components/shared/simulator";
import SimulatorFrame from "../SimulatorFrame";
import TreeRow from "./TreeRow";
import { sweep, TREES } from "./logic";

const PRESETS = [
  { id: "6", label: "৬ ঘণ্টা পর" },
  { id: "30", label: "৩০ ঘণ্টা পর" },
  { id: "80", label: "৮০ ঘণ্টা পর" },
];

export default function WorktreeSweepSimulator() {
  const [hours, setHours] = useState(30);
  return (
    <SimulatorFrame
      title="Worktree Stale Sweep"
      hint="ELI5: অস্থায়ী কাজের ডেস্ক (worktree) অনেকক্ষণ পড়ে থাকলে ঝাড়ুদার কোনটা ফেলবে, কোনটা রাখবে?"
    >
      <PresetButtons presets={PRESETS} onApply={(id) => setHours(Number(id))} />
      <p className="text-xs text-muted-foreground">
        Sweep চলে এখন থেকে {hours} ঘণ্টা idle থাকার পর। (hermes-*/subagent-* ≥
        ২৪ঘ, named ≥ ৭২ঘ)
      </p>
      <ul className="flex flex-col gap-2">
        {TREES.map((t) => (
          <TreeRow key={t.name} tree={t} verdict={sweep(t, hours)} />
        ))}
      </ul>
    </SimulatorFrame>
  );
}
