"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/shadcn";
import { PlaybackControls, PresetButtons } from "@/components/shared/simulator";
import { LbAlgorithmControls } from "./LbAlgorithmControls";
import { LbReliabilityControls } from "./LbReliabilityControls";
import { LbRoutingControls } from "./LbRoutingControls";
import { LbServerControls } from "./LbServerControls";
import { LbTrafficControls } from "./LbTrafficControls";
import { LB_PRESETS } from "./lb-lab-content";
import type { LoadBalancerLab } from "./useLoadBalancerLab";

const TABS = [
  { value: "traffic", label: "Traffic", Panel: LbTrafficControls },
  { value: "algorithm", label: "Algorithm", Panel: LbAlgorithmControls },
  { value: "servers", label: "Servers", Panel: LbServerControls },
  { value: "reliability", label: "Reliability", Panel: LbReliabilityControls },
  { value: "routing", label: "L4 / L7", Panel: LbRoutingControls },
];

export function LbControls({ lab }: { lab: LoadBalancerLab }) {
  return (
    <div className="flex flex-col gap-3">
      <PlaybackControls
        playing={lab.playing}
        speed={lab.speed}
        onPlayPause={lab.togglePlaying}
        onStep={lab.step}
        onSpeedChange={lab.setSpeed}
      />
      <Tabs defaultValue="traffic">
        <TabsList className="w-full justify-start overflow-x-auto">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map(({ value, Panel }) => (
          <TabsContent
            key={value}
            value={value}
            className="rounded-xl border border-border p-3"
          >
            <Panel lab={lab} />
          </TabsContent>
        ))}
      </Tabs>
      <PresetButtons
        presets={LB_PRESETS}
        onApply={(id) => {
          const preset = LB_PRESETS.find((p) => p.id === id);
          if (preset) lab.load(preset.build());
        }}
      />
    </div>
  );
}
