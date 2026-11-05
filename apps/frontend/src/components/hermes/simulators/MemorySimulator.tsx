"use client";

import { useState } from "react";
import CustomButton from "@/components/shared/CustomButton";
import SimulatorFrame from "./SimulatorFrame";

const FACTS = [
  "আমি নিরামিষ খাই",
  "আমার কাজ NestJS দিয়ে",
  "সকাল ৯টায় আমাকে reminder দিও",
];

export default function MemorySimulator() {
  const [saved, setSaved] = useState<string[]>([]);
  const [newSession, setNewSession] = useState(false);

  return (
    <SimulatorFrame
      title="Memory"
      hint="কিছু কথা Hermes-কে বলো, তারপর নতুন session শুরু করো — কোনটা মনে আছে দেখো।"
    >
      <div className="flex flex-wrap gap-2">
        {FACTS.map((fact) => (
          <CustomButton
            key={fact}
            variant="secondary"
            disabled={saved.includes(fact) || newSession}
            onClick={() => setSaved((prev) => [...prev, fact])}
          >
            বলো: &ldquo;{fact}&rdquo;
          </CustomButton>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-3 text-sm">
          <p className="mb-1 font-semibold">📝 MEMORY.md (দীর্ঘমেয়াদি)</p>
          {saved.length === 0 ? (
            <p className="text-muted-foreground">এখনো কিছু নেই</p>
          ) : (
            <ul className="list-disc pl-5">
              {saved.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg border border-border p-3 text-sm">
          <p className="mb-1 font-semibold">
            💬 {newSession ? "নতুন session" : "চলমান session"}
          </p>
          {newSession ? (
            <p>
              Hermes বলছে:{" "}
              {saved.length === 0
                ? '"আমি তোমাকে চিনি না — তোমার সম্পর্কে কিছু বলো।"'
                : `"মনে আছে! ${saved.join("; ")}।"`}
            </p>
          ) : (
            <p className="text-muted-foreground">এখানে কথা চলছে…</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <CustomButton
          variant="primary"
          disabled={newSession}
          onClick={() => setNewSession(true)}
        >
          নতুন session শুরু করো
        </CustomButton>
        <CustomButton
          variant="secondary"
          onClick={() => {
            setSaved([]);
            setNewSession(false);
          }}
        >
          Reset
        </CustomButton>
      </div>
    </SimulatorFrame>
  );
}
