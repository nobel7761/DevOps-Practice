"use client";

import { useState } from "react";
import { EventLog, LessonBox } from "@/components/shared/simulator";
import SimulatorFrame from "../SimulatorFrame";
import Actions from "./Actions";
import {
  available,
  initial,
  step,
  type Action,
  type Origin,
  type Settings,
  type State,
} from "./logic";

export default function SkillLifecycleSimulator() {
  const [state, setState] = useState<State>(initial("agent"));
  const [settings, setSettings] = useState<Settings>({
    writeApproval: false,
    locked: false,
  });

  const changeOrigin = (o: Origin) => setState(initial(o));
  const run = (a: Action) => setState((s) => step(s, a, settings));

  return (
    <SimulatorFrame
      title="Skill Lifecycle"
      hint="ELI5: Skill হলো রেসিপি-কার্ড। কার্ড বানানো, পড়া, বদলানো আর হালনাগাদের নিয়মগুলো বোতাম চেপে দেখো।"
    >
      <Actions
        origin={state.origin}
        settings={settings}
        actions={available(state, settings)}
        onOrigin={changeOrigin}
        onSettings={setSettings}
        onAction={run}
      />
      <p className="text-xs text-muted-foreground">
        অবস্থা: {state.installed ? "installed" : "নেই"}
        {state.edited ? " · locally edited" : ""}
        {state.pending ? ` · pending ${state.pending}` : ""}
      </p>
      <EventLog
        entries={state.log}
        emptyText="এখনো কিছু ঘটেনি। একটা button চাপো।"
      />
      <LessonBox>
        Skill-এর পুরোটা একবারে context-এ ঢোকে না: আগে তালিকা (Level 0), দরকার
        হলে SKILL.md (Level 1), তারপর supporting file (Level 2)।
      </LessonBox>
    </SimulatorFrame>
  );
}
