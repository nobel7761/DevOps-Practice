"use client";

import { useState, type ReactNode } from "react";
import { Button } from "../shadcn";

/**
 * Learner-driven animation (Plan doc Section 6.3 rule 4): nothing auto-plays;
 * "পরের ধাপ ▶" advances, and each step shows a one-line explanation.
 * `frames` are pre-rendered (one per step) so Server Components can pass them.
 */
export function StepThrough({
  steps,
  frames,
}: {
  steps: string[];
  frames: ReactNode[];
}) {
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;

  return (
    <div className="flex flex-col gap-3">
      {frames[step]}
      <p
        aria-live="polite"
        className="min-h-10 rounded-lg bg-muted/50 px-3 py-2 text-sm"
      >
        <span className="mr-2 font-semibold text-primary">
          ধাপ {step + 1}/{steps.length}
        </span>
        {steps[step]}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          ◀ আগের ধাপ
        </Button>
        {isLast ? (
          <Button variant="outline" onClick={() => setStep(0)}>
            আবার শুরু ↺
          </Button>
        ) : (
          <Button onClick={() => setStep((s) => s + 1)}>পরের ধাপ ▶</Button>
        )}
      </div>
    </div>
  );
}
