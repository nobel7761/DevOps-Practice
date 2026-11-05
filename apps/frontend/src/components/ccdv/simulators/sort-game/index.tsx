"use client";

import { useState } from "react";
import SimulatorFrame from "@/components/hermes/simulators/SimulatorFrame";
import { Button } from "@/components/shared/shadcn";
import { LessonBox } from "@/components/shared/simulator";
import { asArray, type SimulatorBase } from "../types";
import ItemCard from "./ItemCard";

export interface SortBucket {
  id: string;
  label: string;
}
export interface SortItem {
  text: string;
  bucket: string;
  why: string;
}

interface Props extends SimulatorBase {
  buckets?: SortBucket[];
  items?: SortItem[];
}

export default function SortGameSimulator(props: Props) {
  const buckets = asArray<SortBucket>(props.buckets);
  const items = asArray<SortItem>(props.items);
  const [choices, setChoices] = useState<Record<number, string>>({});
  const answered = Object.keys(choices).length;
  const correct = items.filter((item, i) => choices[i] === item.bucket).length;

  return (
    <SimulatorFrame title={props.title ?? "Sort"} hint={props.hint ?? ""}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          স্কোর: {correct} / {items.length} ({answered} উত্তর দেওয়া)
        </span>
        <Button size="sm" variant="outline" onClick={() => setChoices({})}>
          Reset
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <ItemCard
            key={index}
            item={item}
            buckets={buckets}
            choice={choices[index]}
            onChoose={(id) => setChoices((prev) => ({ ...prev, [index]: id }))}
          />
        ))}
      </div>
      {props.takeaway && answered === items.length && (
        <LessonBox>{props.takeaway}</LessonBox>
      )}
    </SimulatorFrame>
  );
}
