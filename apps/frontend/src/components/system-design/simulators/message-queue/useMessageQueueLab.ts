"use client";

import { MQ_CHALLENGES } from "@/lib/system-design/sim/message-queue/challenges";
import {
  getMqMetrics,
  tick,
  type MqState,
} from "@/lib/system-design/sim/message-queue/engine";
import { useSimulation } from "../useSimulation";
import { initialMqState } from "./mq-lab-content";

const chartValue = (state: MqState) => getMqMetrics(state).queueDepth;

export function useMessageQueueLab() {
  return useSimulation({
    simulatorId: "message-queue-lab",
    initial: initialMqState,
    tick,
    tickMs: 50,
    challenges: MQ_CHALLENGES,
    chartValue,
  });
}

export type MessageQueueLab = ReturnType<typeof useMessageQueueLab>;
