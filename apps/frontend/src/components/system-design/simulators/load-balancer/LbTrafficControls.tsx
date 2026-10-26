"use client";

import { Button } from "@/components/shared/shadcn";
import { ControlSelect, ControlSlider } from "@/components/shared/simulator";
import {
  sendRequest,
  updateConfig,
  type LbState,
  type TrafficPattern,
} from "@/lib/system-design/sim/load-balancer/engine";
import type { LoadBalancerLab } from "./useLoadBalancerLab";

const BURST_SIZE = 100;

const PATTERNS: { value: TrafficPattern; label: string }[] = [
  { value: "steady", label: "স্থির" },
  { value: "ramp", label: "ধীরে বাড়া" },
  { value: "spike", label: "হঠাৎ spike" },
];

/** A burst mixes heavy requests in by the heavy-ratio slider (first N% heavy). */
function sendBurst(state: LbState): LbState {
  const heavyCount = Math.round(state.config.traffic.heavyRatio * BURST_SIZE);
  let next = state;
  for (let i = 0; i < BURST_SIZE; i++)
    next = sendRequest(next, { kind: i < heavyCount ? "heavy" : "light" });
  return next;
}

export function LbTrafficControls({ lab }: { lab: LoadBalancerLab }) {
  const { traffic } = lab.state.config;
  const setTraffic = (changes: Partial<typeof traffic>) =>
    lab.update((s) =>
      updateConfig(s, { traffic: { ...s.config.traffic, ...changes } }),
    );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => lab.update((s) => sendRequest(s, {}))}
        >
          ১টা request
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => lab.update(sendBurst)}
        >
          Burst {BURST_SIZE}
        </Button>
      </div>
      <ControlSlider
        label="Continuous traffic (RPS)"
        value={traffic.rps}
        min={0}
        max={200}
        step={5}
        onChange={(rps) => setTraffic({ rps })}
      />
      <ControlSelect
        label="Traffic-এর ধরন"
        value={traffic.pattern}
        options={PATTERNS}
        onChange={(pattern) => setTraffic({ pattern })}
      />
      <ControlSlider
        label="ভারী (500ms) request"
        value={Math.round(traffic.heavyRatio * 100)}
        min={0}
        max={100}
        step={5}
        format={(v) => `${v}% ভারী · ${100 - v}% হালকা`}
        onChange={(v) => setTraffic({ heavyRatio: v / 100 })}
      />
      <ControlSlider
        label="কতজন user"
        value={traffic.userCount}
        min={1}
        max={20}
        onChange={(userCount) => setTraffic({ userCount })}
      />
    </div>
  );
}
