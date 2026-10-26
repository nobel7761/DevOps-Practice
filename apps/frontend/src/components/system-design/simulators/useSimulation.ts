"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  MetricPoint,
  SimulatorSpeed,
} from "@/components/shared/simulator";
import {
  evaluateChallenges,
  type Challenge,
} from "@/lib/system-design/sim/challenges";
import { stepsDue } from "@/lib/system-design/sim/runner";
import { useChallengeProgress } from "./useChallengeProgress";

const MAX_TICKS_PER_FRAME = 50;
const CHART_POINTS = 60;

/**
 * Shared simulator runtime (Plan doc Section 9.1): owns the engine state,
 * drives `tick` from requestAnimationFrame while playing, samples one chart
 * value per simulated second, and evaluates + saves challenges.
 */
export function useSimulation<State extends { timeMs: number }>({
  simulatorId,
  initial,
  tick,
  tickMs,
  challenges,
  chartValue,
}: {
  simulatorId: string;
  initial: () => State;
  tick: (state: State, dtMs: number) => State;
  tickMs: number;
  challenges: Challenge<State>[];
  chartValue: (state: State) => number;
}) {
  const [state, setState] = useState<State>(initial);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<SimulatorSpeed>(1);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [history, setHistory] = useState<MetricPoint[]>([]);
  const carry = useRef(0);
  const savedIds = useChallengeProgress(simulatorId, completedIds);

  useEffect(() => {
    setCompletedIds((done) => {
      const next = evaluateChallenges(challenges, state, done);
      return next.length === done.length ? done : next;
    });
    const second = Math.floor(state.timeMs / 1000);
    setHistory((points) =>
      points.at(-1)?.t === second
        ? points
        : [...points, { t: second, value: chartValue(state) }].slice(
            -CHART_POINTS,
          ),
    );
  }, [state, challenges, chartValue]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const due = stepsDue({
        elapsedMs: now - last,
        tickMs,
        speed,
        carryMs: carry.current,
        maxSteps: MAX_TICKS_PER_FRAME,
      });
      last = now;
      carry.current = due.carryMs;
      if (due.steps > 0) {
        setState((current) => {
          let next = current;
          for (let i = 0; i < due.steps; i++) next = tick(next, tickMs);
          return next;
        });
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, tick, tickMs]);

  /** Applies a pure engine action, e.g. `update(s => crashConsumer(s, id, "mid-work"))`. */
  const update = useCallback(
    (action: (state: State) => State) => setState(action),
    [],
  );
  const step = useCallback(
    () => setState((current) => tick(current, tickMs * 5)),
    [tick, tickMs],
  );
  const load = useCallback((next: State) => {
    setState(next);
    setHistory([]);
  }, []);
  const reset = useCallback(() => {
    setPlaying(false);
    load(initial());
  }, [initial, load]);

  return {
    state,
    update,
    load,
    reset,
    step,
    playing,
    togglePlaying: () => setPlaying((p) => !p),
    speed,
    setSpeed,
    /** Completed this session or in an earlier one, in challenge order. */
    completedIds: challenges
      .map((c) => c.id)
      .filter((id) => completedIds.includes(id) || savedIds.includes(id)),
    history,
  };
}
