"use client";

import { useState } from "react";
import SimulatorFrame from "./SimulatorFrame";

const TASK_MINUTES = 10;

export default function DelegationSimulator() {
  const [agents, setAgents] = useState(1);
  const [tasks, setTasks] = useState(6);
  const rounds = Math.ceil(tasks / agents);
  const total = rounds * TASK_MINUTES;
  const alone = tasks * TASK_MINUTES;

  return (
    <SimulatorFrame
      title="Delegation (subagent)"
      hint="কাজ আর subagent-এর সংখ্যা বদলাও — মোট সময় কেমন কমে দেখো। (প্রতিটা কাজ ১০ মিনিট ধরা হয়েছে)"
    >
      <label className="flex items-center gap-3 text-sm">
        কাজের সংখ্যা: {tasks}
        <input
          type="range"
          min={1}
          max={12}
          value={tasks}
          onChange={(e) => setTasks(Number(e.target.value))}
        />
      </label>
      <label className="flex items-center gap-3 text-sm">
        Subagent: {agents}
        <input
          type="range"
          min={1}
          max={6}
          value={agents}
          onChange={(e) => setAgents(Number(e.target.value))}
        />
      </label>
      <div className="flex flex-col gap-1">
        {Array.from({ length: agents }, (_, a) => {
          const mine =
            Math.floor(tasks / agents) + (a < tasks % agents ? 1 : 0);
          return (
            <div key={a} className="flex items-center gap-2 text-xs">
              <span className="w-16">Agent {a + 1}</span>
              <div className="flex gap-1">
                {Array.from({ length: mine }, (_, t) => (
                  <span
                    key={t}
                    className="rounded bg-primary/70 px-2 py-1 text-primary-foreground"
                  >
                    কাজ
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="rounded-lg bg-background/60 p-3 text-sm">
        মোট সময়: <b>{total} মিনিট</b> (একা করলে {alone} মিনিট লাগত)
      </p>
    </SimulatorFrame>
  );
}
