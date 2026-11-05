"use client";

import { useState } from "react";
import SimulatorFrame from "./SimulatorFrame";

const PRESETS = [
  { label: "প্রতি ঘণ্টায়", everyMinutes: 60 },
  { label: "প্রতি ৬ ঘণ্টায়", everyMinutes: 360 },
  { label: "প্রতিদিন সকাল ৯টায়", everyMinutes: 1440, startMinute: 9 * 60 },
];

function formatTime(totalMinutes: number): string {
  const day = Math.floor(totalMinutes / 1440) + 1;
  const m = totalMinutes % 1440;
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `দিন ${day}, ${hh}:${mm}`;
}

export default function CronSimulator() {
  const [index, setIndex] = useState(0);
  const preset = PRESETS[index];
  const start = preset.startMinute ?? 0;
  const runs = Array.from(
    { length: 5 },
    (_, i) => start + i * preset.everyMinutes,
  );

  return (
    <SimulatorFrame
      title="Cron Job"
      hint="একটা schedule বেছে নাও — Hermes পরের ৫ বার কখন কাজ করবে দেখো।"
    >
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setIndex(i)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              i === index ? "border-primary bg-primary/10" : "border-border"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <ol className="flex flex-col gap-1 text-sm">
        {runs.map((run, i) => (
          <li key={run} className="rounded-md bg-background/60 px-3 py-1.5">
            ⏰ run #{i + 1} — {formatTime(run)}
          </li>
        ))}
      </ol>
    </SimulatorFrame>
  );
}
