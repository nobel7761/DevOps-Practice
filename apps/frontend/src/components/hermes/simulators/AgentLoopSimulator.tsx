"use client";

import { useState } from "react";
import CustomButton from "@/components/shared/CustomButton";
import SimulatorFrame from "./SimulatorFrame";

const STEPS = [
  {
    icon: "👂",
    name: "Task পেল",
    note: 'তুমি বললে: "আজকের weather দেখে আমাকে জানাও"।',
  },
  {
    icon: "🧠",
    name: "ভাবল (LLM)",
    note: "মডেল ঠিক করল: আগে web search tool লাগবে।",
  },
  {
    icon: "🔧",
    name: "Tool চালাল",
    note: "web_search tool call হলো, ফলাফল ফিরে এল।",
  },
  {
    icon: "🧠",
    name: "আবার ভাবল",
    note: "ফলাফল পড়ে মডেল দেখল — উত্তর দেওয়ার মতো তথ্য আছে।",
  },
  {
    icon: "💬",
    name: "উত্তর দিল",
    note: '"ঢাকায় আজ ৩২°C, বিকেলে বৃষ্টি হতে পারে।"',
  },
];

export default function AgentLoopSimulator() {
  const [step, setStep] = useState(0);
  return (
    <SimulatorFrame
      title="Agent Loop"
      hint="'পরের ধাপ' চাপো — দেখো Hermes একটা কাজ কীভাবে ঘুরে ঘুরে শেষ করে।"
    >
      <ol className="flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <li
            key={s.name}
            className={`rounded-lg border px-3 py-2 text-sm ${
              i === step
                ? "border-primary bg-primary/10"
                : i < step
                  ? "border-green-600/50 opacity-80"
                  : "border-border opacity-50"
            }`}
          >
            {s.icon} {s.name}
          </li>
        ))}
      </ol>
      <p className="rounded-lg bg-background/60 p-3 text-sm">
        {STEPS[step].note}
      </p>
      <div className="flex gap-2">
        <CustomButton
          variant="primary"
          disabled={step === STEPS.length - 1}
          onClick={() => setStep((s) => s + 1)}
        >
          পরের ধাপ →
        </CustomButton>
        <CustomButton variant="secondary" onClick={() => setStep(0)}>
          শুরু থেকে
        </CustomButton>
      </div>
    </SimulatorFrame>
  );
}
