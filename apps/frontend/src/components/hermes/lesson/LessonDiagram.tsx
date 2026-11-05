"use client";

import { useState } from "react";
import {
  ArchitectureDiagram,
  DiagramFigure,
  SequenceDiagram,
} from "@/components/shared/diagram";
import CustomButton from "@/components/shared/CustomButton";
import type { DiagramSpec } from "@/lib/data/hermes/lesson.types";
import CompareDiagram from "./CompareDiagram";
import InlineCode from "./InlineCode";
import StepsDiagram from "./StepsDiagram";

function SequenceWalkthrough({
  spec,
}: {
  spec: Extract<DiagramSpec, { kind: "sequence" }>;
}) {
  const [step, setStep] = useState(spec.messages.length - 1);
  return (
    <div className="flex flex-col gap-2">
      <DiagramFigure
        caption={<InlineCode text={spec.caption} />}
        alt={spec.caption}
        minWidth={480}
      >
        <SequenceDiagram
          participants={spec.participants}
          messages={spec.messages}
          activeStep={step}
        />
      </DiagramFigure>
      <div className="flex items-center justify-between text-sm">
        <CustomButton
          variant="secondary"
          disabled={step <= 0}
          onClick={() => setStep((s) => s - 1)}
        >
          ← আগে
        </CustomButton>
        <span className="text-muted-foreground">
          message {step + 1} / {spec.messages.length}
        </span>
        <CustomButton
          variant="primary"
          disabled={step >= spec.messages.length - 1}
          onClick={() => setStep((s) => s + 1)}
        >
          পরে →
        </CustomButton>
      </div>
    </div>
  );
}

export default function LessonDiagram({ diagram }: { diagram: DiagramSpec }) {
  switch (diagram.kind) {
    case "architecture":
      return (
        <DiagramFigure
          caption={<InlineCode text={diagram.caption} />}
          alt={diagram.caption}
        >
          <ArchitectureDiagram nodes={diagram.nodes} edges={diagram.edges} />
        </DiagramFigure>
      );
    case "sequence":
      return <SequenceWalkthrough spec={diagram} />;
    case "steps":
      return (
        <figure className="my-4">
          <StepsDiagram steps={diagram.steps} />
          <figcaption className="mt-2 text-sm text-muted-foreground">
            <InlineCode text={diagram.caption} />
          </figcaption>
        </figure>
      );
    case "compare":
      return (
        <figure className="my-4">
          <CompareDiagram {...diagram} />
          <figcaption className="mt-2 text-sm text-muted-foreground">
            <InlineCode text={diagram.caption} />
          </figcaption>
        </figure>
      );
  }
}
