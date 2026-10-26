// The four Message Queue Lab missions (Plan doc Section 9.3), checked against
// the current experiment window (everything since the last setup change).

import type { Challenge } from "../challenges";
import { SPIKE_DURATION_MS, getMqWindow, type MqState } from "./engine";

/** Max queue depth allowed during the spike challenge. */
export const SPIKE_DEPTH_LIMIT = 60;
const MIN_SUCCEEDED = 10;

export const MQ_CHALLENGES: Challenge<MqState>[] = [
  {
    id: "spike",
    title: "Spike সামলান",
    goal: `Spike চালান। পুরো spike জুড়ে queue depth যেন ${SPIKE_DEPTH_LIMIT}-এর বেশি না হয়।`,
    hint: "Producer ৫ গুণ দ্রুত হলে consumer-রা সেকেন্ডে কতগুলো শেষ করতে পারে? Consumer বাড়ান।",
    isComplete: (state) => {
      const w = getMqWindow(state);
      return (
        w.spikes > 0 &&
        !w.spikeActive &&
        w.durationMs >= SPIKE_DURATION_MS &&
        w.maxDepth <= SPIKE_DEPTH_LIMIT
      );
    },
  },
  {
    id: "no-loss",
    title: "কোনো message হারাবে না",
    goal: `কাজ চলার মাঝে একটা consumer crash করান। কোনো message যেন না হারায়, আর অন্তত ${MIN_SUCCEEDED}টা সফল হোক।`,
    hint: "Auto-ack-এ message হাতে পাওয়ামাত্র মুছে যায়। Ack চালু করুন, যাতে কাজ শেষে তবেই মোছে।",
    isComplete: (state) => {
      const w = getMqWindow(state);
      return (
        state.config.ackEnabled &&
        w.midWorkCrashes > 0 &&
        w.lost === 0 &&
        w.succeeded >= MIN_SUCCEEDED
      );
    },
  },
  {
    id: "poison",
    title: "Poison message",
    goal: `একটা poison message পুরো queue আটকে দিচ্ছে। ঠিক করুন: poison message DLQ-তে যাক, আর বাকি অন্তত ${MIN_SUCCEEDED}টা message সফল হোক।`,
    hint: "সীমাহীন retry-ই সমস্যা। DLQ চালু করে max retries ঠিক করুন।",
    isComplete: (state) => {
      const w = getMqWindow(state);
      return w.dlq > 0 && w.succeeded >= MIN_SUCCEEDED;
    },
  },
  {
    id: "duplicates",
    title: "Email দুবার যাচ্ছে",
    goal: `Consumer email পাঠিয়ে ack দেওয়ার আগেই crash করছে, তাই একই order-এর email দুবার যায়। "Ack-এর আগে crash" করিয়ে দেখান যে duplicate হয় না, আর অন্তত ${MIN_SUCCEEDED}টা সফল হোক।`,
    hint: "At-least-once-এ redelivery হবেই। Consumer-কে idempotent বানান: আগে দেখুক email আগেই গেছে কিনা।",
    isComplete: (state) => {
      const w = getMqWindow(state);
      return (
        w.beforeAckCrashes > 0 &&
        w.duplicateWork === 0 &&
        w.succeeded >= MIN_SUCCEEDED
      );
    },
  },
];
