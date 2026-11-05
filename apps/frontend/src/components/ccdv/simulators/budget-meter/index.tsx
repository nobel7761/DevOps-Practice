"use client";

import { useState } from "react";
import SimulatorFrame from "@/components/hermes/simulators/SimulatorFrame";
import {
  ControlSlider,
  LessonBox,
  MetricTile,
} from "@/components/shared/simulator";
import { asArray, type SimulatorBase } from "../types";
import BudgetBar from "./BudgetBar";

export interface BudgetItem {
  id: string;
  label: string;
  tokens: number;
  min: number;
  max: number;
  step?: number;
  /** Price multiplier for this segment, e.g. 0.1 for cache reads, 0.5 for batch. Default 1. */
  costFactor?: number;
}

interface Props extends SimulatorBase {
  capacity?: number;
  capacityLabel?: string;
  items?: BudgetItem[];
  /** Illustrative price per million tokens for a factor-1 segment. Optional. */
  ratePerMillion?: number;
}

export default function BudgetMeterSimulator(props: Props) {
  const items = asArray<BudgetItem>(props.items);
  const capacity =
    props.capacity && props.capacity > 0 ? props.capacity : 200000;
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(items.map((item) => [item.id, item.tokens])),
  );
  const total = items.reduce((sum, item) => sum + (values[item.id] ?? 0), 0);
  const percent = Math.round((total / capacity) * 100);
  const cost = items.reduce(
    (sum, item) =>
      sum +
      ((values[item.id] ?? 0) *
        (item.costFactor ?? 1) *
        (props.ratePerMillion ?? 0)) /
        1_000_000,
    0,
  );

  return (
    <SimulatorFrame title={props.title ?? "Budget"} hint={props.hint ?? ""}>
      <BudgetBar items={items} values={values} capacity={capacity} />
      <div className="grid gap-2 sm:grid-cols-3">
        <MetricTile
          label={props.capacityLabel ?? "Capacity"}
          value={capacity.toLocaleString()}
        />
        <MetricTile
          label="ব্যবহৃত"
          value={`${total.toLocaleString()} (${percent}%)`}
          tone={
            total > capacity ? "critical" : percent > 80 ? "warning" : "good"
          }
        />
        {props.ratePerMillion ? (
          <MetricTile
            label="আনুমানিক cost (illustrative)"
            value={`$${cost.toFixed(4)}`}
          />
        ) : null}
      </div>
      {total > capacity && (
        <p className="text-sm font-medium text-red-600">
          ⚠️ Budget পার হয়ে গেছে — request fail হবে বা কিছু অংশ বাদ দিতে হবে।
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <ControlSlider
            key={item.id}
            label={item.label}
            value={values[item.id] ?? 0}
            min={item.min}
            max={item.max}
            step={item.step ?? 100}
            format={(v) => v.toLocaleString()}
            onChange={(v) => setValues((prev) => ({ ...prev, [item.id]: v }))}
          />
        ))}
      </div>
      {props.takeaway && <LessonBox>{props.takeaway}</LessonBox>}
    </SimulatorFrame>
  );
}
