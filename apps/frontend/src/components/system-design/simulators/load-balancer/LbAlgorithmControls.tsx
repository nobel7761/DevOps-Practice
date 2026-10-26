"use client";

import { Info } from "lucide-react";
import { ControlSelect } from "@/components/shared/simulator";
import {
  ALGORITHM_LABELS,
  updateConfig,
  type LbAlgorithm,
} from "@/lib/system-design/sim/load-balancer/engine";
import { ALGORITHM_INFO } from "./lb-lab-content";
import type { LoadBalancerLab } from "./useLoadBalancerLab";

const OPTIONS = (Object.keys(ALGORITHM_LABELS) as LbAlgorithm[]).map(
  (value) => ({
    value,
    label:
      value === "power-of-two"
        ? `${ALGORITHM_LABELS[value]} (advanced)`
        : ALGORITHM_LABELS[value],
  }),
);

export function LbAlgorithmControls({ lab }: { lab: LoadBalancerLab }) {
  const { algorithm } = lab.state.config;
  return (
    <div className="flex flex-col gap-3">
      <ControlSelect
        label="Algorithm"
        value={algorithm}
        options={OPTIONS}
        onChange={(next) =>
          lab.update((s) => updateConfig(s, { algorithm: next }))
        }
      />
      <p className="flex gap-2 rounded-lg bg-muted/50 p-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        {ALGORITHM_INFO[algorithm]}
      </p>
    </div>
  );
}
