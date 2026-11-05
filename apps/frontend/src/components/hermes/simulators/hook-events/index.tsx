"use client";

import { useState } from "react";
import { ControlSelect, LessonBox } from "@/components/shared/simulator";
import SimulatorFrame from "../SimulatorFrame";
import HookConfig from "./HookConfig";
import { resolve, runHook, stdinPayload, type Hook } from "./logic";
import InlineCode from "../../lesson/InlineCode";

type Tool = "terminal" | "write_file";

export default function HookEventsSimulator() {
  const [tool, setTool] = useState<Tool>("terminal");
  const [hooks, setHooks] = useState<[Hook, Hook]>([
    { behaviour: "approve-json", failClosed: false },
    { behaviour: "timeout", failClosed: false },
  ]);
  const results = hooks.map(runHook);
  const final = resolve(results);
  const patch = (i: 0 | 1, p: Partial<Hook>) =>
    setHooks(
      (h) => h.map((x, n) => (n === i ? { ...x, ...p } : x)) as [Hook, Hook],
    );
  return (
    <SimulatorFrame
      title="Shell Hooks — pre_tool_call"
      hint="ELI5: Hook হলো পাহারাদার script। Tool চলার ঠিক আগে Hermes তাকে JSON পাঠিয়ে জিজ্ঞেস করে 'চালাব?'। একাধিক পাহারাদার থাকলে Hermes নিয়ম মেনে তাদের মত মেলায়।"
    >
      <ControlSelect<Tool>
        label="Agent কোন tool চালাতে যাচ্ছে?"
        value={tool}
        options={[
          { value: "terminal", label: "terminal" },
          { value: "write_file", label: "write_file" },
        ]}
        onChange={setTool}
      />
      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          Script-এর stdin-এ যা আসে
        </p>
        <pre className="max-h-48 overflow-auto rounded-lg border border-border bg-background/60 p-2 text-xs">
          {stdinPayload(tool)}
        </pre>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <HookConfig
          title="Hook ১"
          hook={hooks[0]}
          note={results[0].note}
          onChange={(p) => patch(0, p)}
        />
        <HookConfig
          title="Hook ২"
          hook={hooks[1]}
          note={results[1].note}
          onChange={(p) => patch(1, p)}
        />
      </div>
      <div className="rounded-lg border border-border bg-background/60 p-3 text-sm">
        <p className="font-semibold">{final.outcome}</p>
        <p className="text-muted-foreground">{final.why}</p>
      </div>
      <LessonBox>
        <p>
          <InlineCode text="Default-এ hook ভাঙলে (malformed JSON, non-zero exit, timeout) Hermes fail-open — কাজ এগোয়। নিরাপত্তা-জরুরি হলে `fail_closed: true` দাও। Timeout default ৬০ সেকেন্ড, সর্বোচ্চ ৩০০।" />
        </p>
      </LessonBox>
    </SimulatorFrame>
  );
}
