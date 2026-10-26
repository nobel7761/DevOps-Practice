"use client";

import { Info } from "lucide-react";
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/shadcn";
import {
  ControlSelect,
  ControlSlider,
  ControlSwitch,
  PlaybackControls,
  PresetButtons,
} from "@/components/shared/simulator";
import {
  ALGORITHM_LABELS,
  sendRequests,
  sustainedRate,
  updateRlConfig,
  type RlAlgorithm,
  type RlConfig,
  type RlFallback,
  type RlTrafficPattern,
} from "@/lib/system-design/sim/rate-limiter/engine";
import { ALGORITHM_INFO, RL_PRESETS } from "./rl-content";
import type { RateLimiterLab } from "./useRateLimiterLab";

const set = (lab: RateLimiterLab, changes: Partial<RlConfig>) =>
  lab.update((s) => updateRlConfig(s, changes));

const PATTERNS: { value: RlTrafficPattern; label: string }[] = [
  { value: "steady", label: "স্থির" },
  { value: "bursty", label: "ঝাঁকে ঝাঁকে (প্রতি ২s-এ ১০টা)" },
  { value: "edge-attack", label: "Window-এর কিনারায় আক্রমণ" },
];

function TrafficPanel({ lab }: { lab: RateLimiterLab }) {
  const { config } = lab.state;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => lab.update((s) => sendRequests(s, 1))}
        >
          ১টা request
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => lab.update((s) => sendRequests(s, 20))}
        >
          এখনই ২০টা একসাথে
        </Button>
      </div>
      <ControlSelect
        label="Traffic-এর ধরন"
        value={config.pattern}
        options={PATTERNS}
        onChange={(pattern) => set(lab, { pattern })}
      />
      {config.pattern === "steady" && (
        <ControlSlider
          label="Request/সেকেন্ড"
          value={config.rps}
          min={0}
          max={40}
          onChange={(rps) => set(lab, { rps })}
        />
      )}
    </div>
  );
}

function AlgorithmPanel({ lab }: { lab: RateLimiterLab }) {
  const { config } = lab.state;
  const isWindow = !["token-bucket", "leaky-bucket"].includes(config.algorithm);
  return (
    <div className="flex flex-col gap-4">
      <ControlSelect
        label="Algorithm"
        value={config.algorithm}
        options={(Object.keys(ALGORITHM_LABELS) as RlAlgorithm[]).map(
          (value) => ({ value, label: ALGORITHM_LABELS[value] }),
        )}
        onChange={(algorithm) => set(lab, { algorithm })}
      />
      <p className="flex gap-2 rounded-lg bg-muted/50 p-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        {ALGORITHM_INFO[config.algorithm]}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {isWindow && (
          <ControlSlider
            label="প্রতি সেকেন্ডে সীমা"
            value={config.limit}
            min={1}
            max={30}
            onChange={(limit) => set(lab, { limit })}
          />
        )}
        {config.algorithm === "token-bucket" && (
          <>
            <ControlSlider
              label="Bucket size (সর্বোচ্চ burst)"
              value={config.bucketCapacity}
              min={1}
              max={30}
              onChange={(v) => set(lab, { bucketCapacity: v })}
            />
            <ControlSlider
              label="Refill (token/সেকেন্ড)"
              value={config.refillPerSec}
              min={1}
              max={30}
              onChange={(v) => set(lab, { refillPerSec: v })}
            />
          </>
        )}
        {config.algorithm === "leaky-bucket" && (
          <>
            <ControlSlider
              label="Queue size"
              value={config.queueCapacity}
              min={1}
              max={30}
              onChange={(v) => set(lab, { queueCapacity: v })}
            />
            <ControlSlider
              label="Leak (request/সেকেন্ড)"
              value={config.leakPerSec}
              min={1}
              max={30}
              onChange={(v) => set(lab, { leakPerSec: v })}
            />
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        দীর্ঘমেয়াদে এই setting সেকেন্ডে সর্বোচ্চ {sustainedRate(config)}টা
        ছাড়ে।
      </p>
    </div>
  );
}

function RedisPanel({ lab }: { lab: RateLimiterLab }) {
  const { config } = lab.state;
  return (
    <div className="flex flex-col gap-4">
      <ControlSwitch
        label="Redis বন্ধ"
        description="অনেক server-এর shared counter Redis-এ থাকে। Redis না থাকলে limiter কী করবে?"
        checked={config.redisDown}
        onChange={(redisDown) => set(lab, { redisDown })}
      />
      <ControlSelect
        label="Redis বন্ধ থাকলে"
        value={config.fallback}
        options={[
          { value: "open" as RlFallback, label: "Fail-open: সবাইকে ছেড়ে দাও" },
          { value: "closed" as RlFallback, label: "Fail-closed: সবাইকে আটকাও" },
          {
            value: "local" as RlFallback,
            label: "Local fallback: প্রতি server নিজে গোনে",
          },
        ]}
        onChange={(fallback) => set(lab, { fallback })}
      />
    </div>
  );
}

const TABS = [
  { value: "traffic", label: "Traffic", Panel: TrafficPanel },
  { value: "algorithm", label: "Algorithm", Panel: AlgorithmPanel },
  { value: "redis", label: "Redis", Panel: RedisPanel },
];

export function RlControls({ lab }: { lab: RateLimiterLab }) {
  return (
    <div className="flex flex-col gap-3">
      <PlaybackControls
        playing={lab.playing}
        speed={lab.speed}
        onPlayPause={lab.togglePlaying}
        onStep={lab.step}
        onSpeedChange={lab.setSpeed}
      />
      <Tabs defaultValue="algorithm">
        <TabsList className="w-full justify-start overflow-x-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
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
        presets={RL_PRESETS}
        onApply={(id) => {
          const preset = RL_PRESETS.find((p) => p.id === id);
          if (preset) lab.load(preset.build());
        }}
      />
    </div>
  );
}
