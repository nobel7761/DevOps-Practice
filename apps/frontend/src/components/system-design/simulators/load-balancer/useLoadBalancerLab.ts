"use client";

import { LB_CHALLENGES } from "@/lib/system-design/sim/load-balancer/challenges";
import {
  getRecentStats,
  tick,
  type LbState,
} from "@/lib/system-design/sim/load-balancer/engine";
import { useSimulation } from "../useSimulation";
import { initialLabState } from "./lb-lab-content";

const chartValue = (state: LbState) => getRecentStats(state, 1000).p99;

/** Load Balancer Lab state: the shared simulator runtime with the LB engine plugged in. */
export function useLoadBalancerLab() {
  return useSimulation({
    simulatorId: "load-balancer-lab",
    initial: initialLabState,
    tick,
    tickMs: 20,
    challenges: LB_CHALLENGES,
    chartValue,
  });
}

export type LoadBalancerLab = ReturnType<typeof useLoadBalancerLab>;
