"use client";

import { useId } from "react";
import {
  Badge,
  Label,
  RadioGroup,
  RadioGroupItem,
} from "@/components/shared/shadcn";
import LessonDiagramSlot from "@/components/system-design/lesson/LessonDiagramSlot";
import { DIFFICULTY_LABELS, type SdServedQuestion } from "./sd-quiz.types";

export function SdQuizQuestion({
  number,
  question,
  selected,
  onSelect,
}: {
  number: number;
  question: SdServedQuestion;
  selected: number | undefined;
  onSelect: (optionIndex: number) => void;
}) {
  const id = useId();
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <p id={`${id}-q`} className="text-sm font-medium">
          {number}. {question.question}
        </p>
        <Badge variant="outline" className="shrink-0">
          {DIFFICULTY_LABELS[question.difficulty]}
        </Badge>
      </div>
      {question.diagram && (
        <LessonDiagramSlot
          diagram={{
            id: question.diagram,
            caption: "প্রশ্নের diagram",
            alt: "প্রশ্নের diagram",
          }}
        />
      )}
      <RadioGroup
        aria-labelledby={`${id}-q`}
        value={selected === undefined ? "" : String(selected)}
        onValueChange={(value) => onSelect(Number(value))}
        className="gap-2"
      >
        {question.options.map((option, index) => (
          <Label
            key={index}
            htmlFor={`${id}-${index}`}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
          >
            <RadioGroupItem
              id={`${id}-${index}`}
              value={String(index)}
              className="mt-0.5"
            />
            <span className="leading-relaxed">{option}</span>
          </Label>
        ))}
      </RadioGroup>
    </li>
  );
}
