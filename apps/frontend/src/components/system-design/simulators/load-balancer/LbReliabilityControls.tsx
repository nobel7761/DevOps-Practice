"use client";

import { Button } from "@/components/shared/shadcn";
import { ControlSlider, ControlSwitch } from "@/components/shared/simulator";
import {
  setPrimaryLbUp,
  updateConfig,
  type LbConfig,
} from "@/lib/system-design/sim/load-balancer/engine";
import type { LoadBalancerLab } from "./useLoadBalancerLab";

export function LbReliabilityControls({ lab }: { lab: LoadBalancerLab }) {
  const { config, lb } = lab.state;
  const set = (changes: Partial<LbConfig>) =>
    lab.update((s) => updateConfig(s, changes));
  const setHealth = (changes: Partial<LbConfig["healthCheck"]>) =>
    lab.update((s) =>
      updateConfig(s, { healthCheck: { ...s.config.healthCheck, ...changes } }),
    );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-3">
        <ControlSwitch
          label="Health check"
          description="বন্ধ থাকলে মরা server-এও request যেতে থাকবে।"
          checked={config.healthCheck.enabled}
          onChange={(enabled) => setHealth({ enabled })}
        />
        {config.healthCheck.enabled && (
          <>
            <ControlSlider
              label="Interval"
              value={config.healthCheck.intervalMs / 1000}
              min={1}
              max={10}
              format={(v) => `প্রতি ${v} সেকেন্ডে`}
              onChange={(v) => setHealth({ intervalMs: v * 1000 })}
            />
            <ControlSlider
              label="কয়বার fail করলে বাদ"
              value={config.healthCheck.failThreshold}
              min={1}
              max={5}
              format={(v) => `${v} বার`}
              onChange={(failThreshold) => setHealth({ failThreshold })}
            />
          </>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <ControlSwitch
          label="Retry"
          description="Fail হলে অন্য server-এ একবার আবার চেষ্টা।"
          checked={config.retry}
          onChange={(retry) => set({ retry })}
        />
        <ControlSwitch
          label="Sticky session"
          description="একই user সবসময় একই server-এ।"
          checked={config.sticky}
          onChange={(sticky) => set({ sticky })}
        />
        <ControlSwitch
          label="দ্বিতীয় Load Balancer (active-passive)"
          description={`Primary বন্ধ হলে ${config.failoverMs / 1000} সেকেন্ড পর passive দায়িত্ব নেয়।`}
          checked={config.lbRedundancy}
          onChange={(lbRedundancy) => set({ lbRedundancy })}
        />
        <Button
          size="sm"
          variant={lb.primaryUp ? "destructive" : "outline"}
          className="w-fit"
          onClick={() => lab.update((s) => setPrimaryLbUp(s, !s.lb.primaryUp))}
        >
          {lb.primaryUp ? "Primary LB বন্ধ করো" : "Primary LB আবার চালু করো"}
        </Button>
      </div>
    </div>
  );
}
