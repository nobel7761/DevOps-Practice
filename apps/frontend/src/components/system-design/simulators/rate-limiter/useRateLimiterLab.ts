"use client";

import { RL_CHALLENGES } from "@/lib/system-design/sim/rate-limiter/challenges";
import {
  getRlMetrics,
  tick,
  type RlState,
} from "@/lib/system-design/sim/rate-limiter/engine";
import { useSimulation } from "../useSimulation";
import { initialRlState } from "./rl-content";

const chartValue = (state: RlState) => getRlMetrics(state).allowedLastSecond;

export function useRateLimiterLab() {
  return useSimulation({
    simulatorId: "rate-limiter-sim",
    initial: initialRlState,
    tick,
    tickMs: 50,
    challenges: RL_CHALLENGES,
    chartValue,
  });
}

export type RateLimiterLab = ReturnType<typeof useRateLimiterLab>;
