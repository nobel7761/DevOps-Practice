// Every System Design simulator, by the id lessons use in `SdLesson.simulator`.
// The same list feeds the Playground page (Plan doc Section 9.1 rule 13).

import type { ComponentType } from "react";
import { LoadBalancerLab } from "./load-balancer/LoadBalancerLab";
import { MessageQueueLab } from "./message-queue/MessageQueueLab";
import { RateLimiterLab } from "./rate-limiter/RateLimiterLab";

export interface SimulatorEntry {
  id: string;
  title: string;
  description: string;
  /** Lessons (Day numbers) that embed it. */
  days: number[];
  Component: ComponentType;
}

export const SIMULATORS: SimulatorEntry[] = [
  {
    id: "load-balancer-lab",
    title: "Load Balancer Lab",
    description:
      "Traffic পাঠান, algorithm বদলান, server ধীর/বন্ধ করুন, health check, sticky session, L7 routing আর LB failover।",
    days: [9, 13, 14, 87],
    Component: LoadBalancerLab,
  },
  {
    id: "message-queue-lab",
    title: "Message Queue Lab",
    description:
      "Producer আর consumer, crash, ack, visibility timeout, retry, DLQ, poison message আর idempotency।",
    days: [12, 56, 57],
    Component: MessageQueueLab,
  },
  {
    id: "rate-limiter-sim",
    title: "Rate Limiter Simulator",
    description:
      "Token Bucket, Leaky Bucket, Fixed / Sliding Window; burst আর window-এর কিনারার আক্রমণ; Redis বন্ধ হলে fail-open, fail-closed না local।",
    days: [18],
    Component: RateLimiterLab,
  },
];

export const findSimulator = (id: string) =>
  SIMULATORS.find((s) => s.id === id);
