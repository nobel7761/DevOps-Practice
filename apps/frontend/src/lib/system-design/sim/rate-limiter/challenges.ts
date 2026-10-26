// Rate Limiter Simulator missions, checked against the current experiment window.

import type { Challenge } from "../challenges";
import {
  getRlWindow,
  maxAllowedInSpan,
  sustainedRate,
  type RlState,
} from "./engine";

const allowedIn1s = (state: RlState) =>
  maxAllowedInSpan(state, 1000, state.window.startMs);

export const RL_CHALLENGES: Challenge<RlState>[] = [
  {
    id: "friendly-bursts",
    title: "Burst-এ বন্ধুসুলভ",
    goal: "Traffic আসে ঝাঁকে ঝাঁকে (প্রতি ২ সেকেন্ডে ১০টা একসাথে)। গড় সীমা সেকেন্ডে ৫টার বেশি না রেখে ১০ সেকেন্ড ধরে একটাও request block হতে দেবেন না।",
    hint: "কোন algorithm একসাথে কয়েকটা জমিয়ে রাখা 'ক্ষমতা' খরচ করতে দেয়? Token Bucket: size ১০, refill ৫/s।",
    isComplete: (s) => {
      const w = getRlWindow(s);
      return (
        s.config.pattern === "bursty" &&
        w.durationMs >= 10_000 &&
        w.allowed > 0 &&
        w.blocked === 0 &&
        sustainedRate(s.config) <= 5
      );
    },
  },
  {
    id: "window-edge",
    title: "Window-এর কিনারায় দ্বিগুণ",
    goal: "আক্রমণকারী প্রতিটা ১-সেকেন্ড window-এর শেষ মুহূর্তে ১০টা আর পরের window-এর শুরুতে ১০টা পাঠাচ্ছে। সীমা ১০/s রেখেই যেকোনো ১ সেকেন্ডে ১১টার বেশি ছাড়া হতে দেবেন না (৬ সেকেন্ড ধরে)।",
    hint: "Fixed Window শুধু ঘড়ির window গোনে, তাই কিনারায় দুটো window মিলে ২০টা যায়। Sliding Window Log বা Counter চেষ্টা করুন।",
    isComplete: (s) => {
      const w = getRlWindow(s);
      return (
        s.config.pattern === "edge-attack" &&
        w.durationMs >= 6000 &&
        w.allowed > 0 &&
        sustainedRate(s.config) >= 10 &&
        allowedIn1s(s) <= 11
      );
    },
  },
  {
    id: "redis-down",
    title: "Redis পড়ে গেছে",
    goal: "Rate limiter-এর Redis বন্ধ, আর traffic সীমার দ্বিগুণ। সাধারণ user-দের ঢুকতে দিন, কিন্তু যেকোনো ১ সেকেন্ডে সীমার বেশি যেন না যায় (৪ সেকেন্ড ধরে)।",
    hint: "Fail-open সবাইকে ছেড়ে দেয় (সীমা থাকে না), fail-closed সবাইকে আটকায় (কেউ ঢুকতে পারে না)। মাঝামাঝি কিছু আছে কি?",
    isComplete: (s) => {
      const w = getRlWindow(s);
      return (
        s.config.redisDown &&
        w.durationMs >= 4000 &&
        w.allowedWhileDown > 0 &&
        allowedIn1s(s) <= Math.ceil(sustainedRate(s.config)) + 1
      );
    },
  },
];
