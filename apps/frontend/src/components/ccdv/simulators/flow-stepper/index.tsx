"use client";

import { useEffect, useState } from "react";
import SimulatorFrame from "@/components/hermes/simulators/SimulatorFrame";
import {
  EventLog,
  LessonBox,
  PlaybackControls,
  type SimulatorSpeed,
} from "@/components/shared/simulator";
import { asArray, type SimulatorBase } from "../types";
import StepRow from "./StepRow";

export interface FlowActor {
  id: string;
  label: string;
}
export interface FlowStep {
  from: string;
  to: string;
  label: string;
  note?: string;
}

interface Props extends SimulatorBase {
  actors?: FlowActor[];
  steps?: FlowStep[];
}

const STEP_MS = 1400;

export default function FlowStepperSimulator(props: Props) {
  const actors = asArray<FlowActor>(props.actors);
  const steps = asArray<FlowStep>(props.steps);
  const [shown, setShown] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<SimulatorSpeed>(1);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setShown((value) => {
        if (value >= steps.length) {
          setPlaying(false);
          return value;
        }
        return value + 1;
      });
    }, STEP_MS / speed);
    return () => window.clearInterval(timer);
  }, [playing, speed, steps.length]);

  const indexOf = (id: string) =>
    Math.max(
      0,
      actors.findIndex((a) => a.id === id),
    );
  const notes = steps
    .slice(0, shown)
    .map((step, index) => `${index + 1}. ${step.note ?? step.label}`);

  const handlePlayPause = () => {
    if (shown >= steps.length) setShown(0);
    setPlaying((value) => !value);
  };

  return (
    <SimulatorFrame title={props.title ?? "Flow"} hint={props.hint ?? ""}>
      <PlaybackControls
        playing={playing}
        speed={speed}
        onPlayPause={handlePlayPause}
        onStep={() => setShown((value) => Math.min(steps.length, value + 1))}
        onSpeedChange={setSpeed}
      />
      <div className="flex flex-col gap-2 overflow-x-auto rounded-xl border border-border p-3">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${Math.max(actors.length, 1)}, minmax(0, 1fr))`,
          }}
        >
          {actors.map((actor) => (
            <div
              key={actor.id}
              className="rounded-lg bg-muted px-2 py-1.5 text-center text-xs font-semibold"
            >
              {actor.label}
            </div>
          ))}
        </div>
        {steps.slice(0, shown).map((step, index) => (
          <StepRow
            key={index}
            step={step}
            from={indexOf(step.from)}
            to={indexOf(step.to)}
            columns={Math.max(actors.length, 1)}
            active={index === shown - 1}
          />
        ))}
      </div>
      <EventLog
        entries={notes}
        emptyText="▶ Play চাপো বা 'এক ধাপ' দিয়ে এগোও।"
      />
      {props.takeaway && shown >= steps.length && (
        <LessonBox>{props.takeaway}</LessonBox>
      )}
    </SimulatorFrame>
  );
}
