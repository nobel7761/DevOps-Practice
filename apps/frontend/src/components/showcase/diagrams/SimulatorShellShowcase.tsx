"use client";

import { useState } from "react";
import {
  ChallengeList,
  EventLog,
  LessonBox,
  MetricLineChart,
  MetricTile,
  PlaybackControls,
  PresetButtons,
  SimulatorHeader,
  SimulatorShell,
  type SimulatorSpeed,
} from "@/components/shared/simulator";
import { NodeRow } from "@/components/showcase/diagrams/NodeRow";

// Static values: this only previews the shell's layout, there's no engine behind it.
const points = Array.from({ length: 20 }, (_, t) => ({
  t,
  value: 60 + ((t * 37) % 50),
}));

export function SimulatorShellShowcase() {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<SimulatorSpeed>(1);

  return (
    <SimulatorShell
      header={
        <SimulatorHeader
          title="Simulator shell preview"
          howTo="কিভাবে ব্যবহার করবেন, এখানে লেখা থাকবে।"
          onReset={() => {}}
        />
      }
      controls={
        <div className="flex flex-col gap-3">
          <PlaybackControls
            playing={playing}
            speed={speed}
            onPlayPause={() => setPlaying((p) => !p)}
            onStep={() => {}}
            onSpeedChange={setSpeed}
          />
          <PresetButtons
            presets={[{ id: "slow", label: "একটা server ধীর হলে?" }]}
            onApply={() => {}}
          />
        </div>
      }
      visualization={
        <div className="p-4">
          <NodeRow />
        </div>
      }
      metrics={
        <>
          <div className="grid grid-cols-2 gap-2">
            <MetricTile label="Success" value="99.2%" tone="good" />
            <MetricTile label="p99" value="420ms" tone="warning" />
            <MetricTile label="Failed" value="12" tone="critical" />
            <MetricTile label="RPS" value="100" />
          </div>
          <MetricLineChart title="p99 latency" unit="ms" points={points} />
        </>
      }
      log={
        <EventLog
          entries={[
            "Request #1 → Server 1, কারণ Round Robin: এবার Server 1-এর পালা।",
          ]}
        />
      }
      challenges={
        <ChallengeList
          challenges={[
            {
              id: "a",
              title: "Challenge ১",
              goal: "লক্ষ্য এখানে",
              hint: "Hint এখানে",
            },
            { id: "b", title: "Challenge ২", goal: "লক্ষ্য এখানে" },
          ]}
          completedIds={["b"]}
        />
      }
      lesson={<LessonBox>শিক্ষার কথা এখানে।</LessonBox>}
    />
  );
}
