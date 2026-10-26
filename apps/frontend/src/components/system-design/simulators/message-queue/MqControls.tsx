"use client";

import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/shadcn";
import {
  ControlSlider,
  ControlSwitch,
  PlaybackControls,
  PresetButtons,
} from "@/components/shared/simulator";
import {
  MAX_CONSUMERS,
  crashConsumer,
  sendMessages,
  triggerSpike,
  updateMqConfig,
  type MqConfig,
} from "@/lib/system-design/sim/message-queue/engine";
import { MQ_PRESETS } from "./mq-lab-content";
import type { MessageQueueLab } from "./useMessageQueueLab";

const set = (lab: MessageQueueLab, changes: Partial<MqConfig>) =>
  lab.update((s) => updateMqConfig(s, changes));

function TrafficPanel({ lab }: { lab: MessageQueueLab }) {
  const { config, spikeUntil, timeMs } = lab.state;
  const spiking = spikeUntil !== null && timeMs < spikeUntil;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => lab.update((s) => sendMessages(s, 1))}
        >
          ১টা message
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={spiking}
          onClick={() => lab.update(triggerSpike)}
        >
          {spiking ? "Spike চলছে..." : "📈 হঠাৎ spike (৫ গুণ, ৫ সেকেন্ড)"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            lab.update((s) => sendMessages(s, 1, { poison: true }))
          }
        >
          ☣ Poison message
        </Button>
      </div>
      <ControlSlider
        label="Producer (message/সেকেন্ড)"
        value={config.producerRate}
        min={0}
        max={30}
        onChange={(v) => set(lab, { producerRate: v })}
      />
    </div>
  );
}

function ConsumersPanel({ lab }: { lab: MessageQueueLab }) {
  const { config, consumers } = lab.state;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <ControlSlider
          label="Consumer সংখ্যা"
          value={config.consumers}
          min={0}
          max={MAX_CONSUMERS}
          onChange={(v) => set(lab, { consumers: v })}
        />
        <ControlSlider
          label="প্রতি message-এ কাজের সময়"
          value={config.processingMs}
          min={50}
          max={2000}
          step={50}
          format={(v) => `${v}ms · প্রতি consumer ${(1000 / v).toFixed(1)}/s`}
          onChange={(v) => set(lab, { processingMs: v })}
        />
      </div>
      <ul className="flex flex-col gap-2">
        {consumers.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2 text-sm"
          >
            <span className="w-24 font-medium">{c.name}</span>
            <Button
              size="xs"
              variant="outline"
              disabled={c.status !== "busy"}
              onClick={() =>
                lab.update((s) => crashConsumer(s, c.id, "mid-work"))
              }
            >
              কাজের মাঝে crash
            </Button>
            <Button
              size="xs"
              variant="outline"
              disabled={c.status !== "busy"}
              onClick={() =>
                lab.update((s) => crashConsumer(s, c.id, "before-ack"))
              }
            >
              ack-এর আগে crash
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReliabilityPanel({ lab }: { lab: MessageQueueLab }) {
  const { config } = lab.state;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-3">
        <ControlSwitch
          label="Manual ack"
          description="বন্ধ = auto-ack: হাতে পাওয়ামাত্র মুছে যায়।"
          checked={config.ackEnabled}
          onChange={(v) => set(lab, { ackEnabled: v })}
        />
        <ControlSlider
          label="Visibility timeout"
          value={config.visibilityTimeoutMs / 1000}
          min={0.5}
          max={10}
          step={0.5}
          format={(v) => `${v} সেকেন্ড`}
          onChange={(v) => set(lab, { visibilityTimeoutMs: v * 1000 })}
        />
        <ControlSwitch
          label="Idempotent consumer"
          description="আগে দেখে নেয় এই order-এর email আগেই গেছে কিনা।"
          checked={config.idempotency}
          onChange={(v) => set(lab, { idempotency: v })}
        />
      </div>
      <div className="flex flex-col gap-3">
        <ControlSwitch
          label="Dead Letter Queue"
          description="বন্ধ থাকলে fail করা message সীমাহীন retry হয়।"
          checked={config.dlqEnabled}
          onChange={(v) => set(lab, { dlqEnabled: v })}
        />
        <ControlSlider
          label="সর্বোচ্চ retry"
          value={config.maxRetries}
          min={1}
          max={10}
          format={(v) => `${v} বার, তারপর DLQ`}
          onChange={(v) => set(lab, { maxRetries: v })}
        />
      </div>
    </div>
  );
}

const TABS = [
  { value: "traffic", label: "Traffic", Panel: TrafficPanel },
  { value: "consumers", label: "Consumers", Panel: ConsumersPanel },
  { value: "reliability", label: "Reliability", Panel: ReliabilityPanel },
];

export function MqControls({ lab }: { lab: MessageQueueLab }) {
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
        presets={MQ_PRESETS}
        onApply={(id) => {
          const preset = MQ_PRESETS.find((p) => p.id === id);
          if (preset) lab.load(preset.build());
        }}
      />
    </div>
  );
}
