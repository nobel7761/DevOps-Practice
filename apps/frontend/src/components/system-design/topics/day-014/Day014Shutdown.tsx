import {
  StateDiagram,
  StepThrough,
  type DiagramState,
  type DiagramTransition,
} from "@/components/shared/diagram";

// Graceful shutdown of one stateless server, as a state machine.

const STATES: DiagramState[] = [
  { id: "running", label: "Running", x: 0, y: 60 },
  { id: "draining", label: "Draining", x: 220, y: 60 },
  { id: "finishing", label: "Finishing", x: 440, y: 60 },
  { id: "exited", label: "Exited ✓", x: 660, y: 0 },
  { id: "killed", label: "SIGKILL ✕", x: 660, y: 130 },
];

const TRANSITIONS: DiagramTransition[] = [
  { from: "running", to: "draining", label: "SIGTERM" },
  { from: "draining", to: "finishing", label: "LB সরাল" },
  { from: "finishing", to: "exited", label: "কাজ শেষ" },
  { from: "finishing", to: "killed", label: "grace শেষ" },
];

const STEPS: { active: string; text: string }[] = [
  {
    active: "running",
    text: "Server স্বাভাবিকভাবে request নিচ্ছে। Readiness endpoint (যেমন /ready) 200 দিচ্ছে, তাই LB তাকে traffic দেয়।",
  },
  {
    active: "draining",
    text: "Deploy বা scale-in-এর জন্য orchestrator SIGTERM পাঠাল। Process সাথে সাথে মরে না: /ready এখন 503 দেয়, আর কয়েক সেকেন্ড অপেক্ষা করে যাতে LB-র health check বা endpoint list তাকে সরিয়ে দেয়। এর মধ্যে আসা request-ও সে নিয়ে নেয়।",
  },
  {
    active: "finishing",
    text: "নতুন connection নেওয়া বন্ধ। চলমান request শেষ হতে দেয়, keep-alive connection-এ Connection: close পাঠায়, তারপর DB pool আর broker connection বন্ধ করে। Stateless বলে বাঁচানোর মতো কোনো session ভেতরে নেই।",
  },
  {
    active: "exited",
    text: "সব শেষ, exit code 0। পুরো ব্যাপারটা grace period-এর ভেতরে হতে হবে: Kubernetes-এ default ৩০ সেকেন্ড, docker stop-এ ১০ সেকেন্ড।",
  },
  {
    active: "killed",
    text: "Grace period পার হলে SIGKILL: process সাথে সাথে শেষ, চলমান request কাটা পড়ে। তাই লম্বা কাজ request-এর ভেতরে না রেখে queue-তে দিন (Day 12), আর client-এর retry যেন idempotent হয়।",
  },
];

/** Step-by-step graceful shutdown (deep dive). */
export function Day014Shutdown() {
  return (
    <StepThrough
      steps={STEPS.map((s) => s.text)}
      frames={STEPS.map((s) => (
        <div key={s.active} className="overflow-x-auto">
          <div className="min-w-[600px]">
            <StateDiagram
              states={STATES}
              transitions={TRANSITIONS}
              activeId={s.active}
            />
          </div>
        </div>
      ))}
    />
  );
}
