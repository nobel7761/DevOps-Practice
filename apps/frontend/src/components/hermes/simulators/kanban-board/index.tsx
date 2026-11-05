"use client";

import { useState } from "react";
import { Button } from "@/components/shared/shadcn";
import { EventLog, LessonBox } from "@/components/shared/simulator";
import SimulatorFrame from "../SimulatorFrame";
import TaskCard from "./TaskCard";
import { COLUMNS, finish, initial, tick, unblock } from "./logic";

export default function KanbanBoardSimulator() {
  const [b, setB] = useState(initial);
  return (
    <SimulatorFrame
      title="Kanban Board ও Dispatcher"
      hint="ELI5: কাজের কার্ড বোর্ডে ডান দিকে সরতে থাকে। 'Dispatcher' একজন ম্যানেজার — প্রতি tick-এ দেখে কোন কার্ড তৈরি (ready), আর worker ধরিয়ে দেয়। Parent কাজ শেষ না হলে child অপেক্ষা করে।"
    >
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setB(tick)}>
          ⏱ Dispatcher tick
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setB(initial)}>
          Reset
        </Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {COLUMNS.map((col) => (
          <div
            key={col}
            className="flex min-h-24 flex-col gap-2 rounded-lg border border-border bg-muted/40 p-2"
          >
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {col}
            </p>
            {b.tasks
              .filter((t) => t.status === col)
              .map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onFinish={(id, e) => setB((x) => finish(x, id, e))}
                  onUnblock={(id) => setB((x) => unblock(x, id))}
                />
              ))}
          </div>
        ))}
      </div>
      <EventLog
        entries={b.log}
        emptyText="এখনো কিছু ঘটেনি। একটা button চাপো।"
      />
      <LessonBox>
        <p>
          todo কার্ড তখনই ready হয় যখন তার সব parent done। Exit 1 পরপর{" "}
          {b.failureLimit} বার (failure_limit) হলে auto-blocked; exit 75 (rate
          limit) failure গোনে না; exit 78 (bad credential/model) একবারেই
          blocked।
        </p>
      </LessonBox>
    </SimulatorFrame>
  );
}
