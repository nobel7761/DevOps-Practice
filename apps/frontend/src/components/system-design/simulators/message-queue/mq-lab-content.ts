// Copy and ready-made scenarios for the Message Queue Lab (Plan doc Section 9.3).

import {
  createMessageQueueLab,
  sendMessages,
  type MqLabOptions,
  type MqState,
} from "@/lib/system-design/sim/message-queue/engine";

export const HOW_TO = [
  "▶️ Play চাপুন। Producer প্রতি সেকেন্ডে message পাঠাবে, consumer-রা তুলে নেবে।",
  "Consumers tab-এ consumer বাড়ান বা কমান, আর কাজের মাঝে crash করিয়ে দেখুন message-এর কী হয়।",
  "Reliability tab-এ ack, visibility timeout, DLQ আর idempotency বদলে একই crash আবার করুন।",
  "নিচের challenge-এর পাশে 'সাজান' চাপলে পরিস্থিতি তৈরি হয়ে যাবে।",
];

export const LESSON =
  "Queue কাজকে 'এখন'-এর বদলে 'পরে' করে, কিন্তু 'পরে' মানে নিরাপদ না। Ack ছাড়া message হারায়, ack থাকলে duplicate আসে, আর সীমাহীন retry একটা খারাপ message দিয়ে পুরো queue আটকায়। তাই at-least-once + idempotent consumer + DLQ, এই তিনটা একসাথে লাগে।";

const base = (options: MqLabOptions = {}): MqState =>
  createMessageQueueLab({
    producerRate: 8,
    consumers: 3,
    processingMs: 200,
    ...options,
  });

export const initialMqState = () => base();

export const MQ_PRESETS: { id: string; label: string; build: () => MqState }[] =
  [
    {
      id: "too-few-consumers",
      label: "Consumer কম হলে queue কেমন বাড়ে?",
      build: () => base({ producerRate: 12, consumers: 2 }),
    },
    {
      id: "auto-ack",
      label: "Auto-ack-এ crash করলে কী হয়?",
      build: () => base({ ackEnabled: false }),
    },
    {
      id: "short-timeout",
      label: "Visibility timeout কাজের চেয়ে ছোট হলে",
      build: () =>
        base({ producerRate: 2, processingMs: 1500, visibilityTimeoutMs: 800 }),
    },
    {
      id: "poison-no-dlq",
      label: "DLQ ছাড়া poison message",
      build: () =>
        sendMessages(
          base({ consumers: 1, producerRate: 3, dlqEnabled: false }),
          1,
          { poison: true },
        ),
    },
  ];

export const MQ_CHALLENGE_SETUPS: Record<string, () => MqState> = {
  spike: () => base({ producerRate: 10, consumers: 3 }),
  "no-loss": () => base({ ackEnabled: false }),
  poison: () =>
    sendMessages(
      base({ consumers: 1, producerRate: 3, dlqEnabled: false }),
      1,
      { poison: true },
    ),
  duplicates: () => base({ visibilityTimeoutMs: 1000, idempotency: false }),
};
