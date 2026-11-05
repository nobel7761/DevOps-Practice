"use client";

import { useState } from "react";
import CustomButton from "@/components/shared/CustomButton";
import Markdown from "@/components/shared/Markdown";
import InlineCode from "./InlineCode";

/** Learner-driven step-by-step walkthrough: nothing auto-plays. */
export default function StepsDiagram({
  steps,
}: {
  steps: { title: string; body: string }[];
}) {
  const [active, setActive] = useState(0);
  const step = steps[active];

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-wrap gap-2">
        {steps.map((s, index) => (
          <li key={s.title}>
            <CustomButton
              variant={index === active ? "primary" : "secondary"}
              className="px-3! py-1!"
              onClick={() => setActive(index)}
            >
              {index + 1}
            </CustomButton>
          </li>
        ))}
      </ol>
      <div className="rounded-lg border border-border bg-background/60 p-4">
        <p className="mb-2 font-semibold">
          ধাপ {active + 1}: <InlineCode text={step.title} />
        </p>
        <Markdown>{step.body}</Markdown>
      </div>
      <div className="flex justify-between">
        <CustomButton
          variant="secondary"
          disabled={active === 0}
          onClick={() => setActive((i) => i - 1)}
        >
          ← আগের ধাপ
        </CustomButton>
        <CustomButton
          variant="primary"
          disabled={active === steps.length - 1}
          onClick={() => setActive((i) => i + 1)}
        >
          পরের ধাপ →
        </CustomButton>
      </div>
    </div>
  );
}
