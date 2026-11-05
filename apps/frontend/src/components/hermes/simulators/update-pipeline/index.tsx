"use client";

import { useState } from "react";
import { LessonBox } from "@/components/shared/simulator";
import SimulatorFrame from "../SimulatorFrame";
import ScenarioControls from "./ScenarioControls";
import StepList from "./StepList";
import { runPipeline, type Flags, type Scenario } from "./logic";

export default function UpdatePipelineSimulator() {
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [flags, setFlags] = useState<Flags>({
    noBackup: false,
    noGatewayRestart: false,
  });
  const steps = runPipeline(scenario, flags);

  return (
    <SimulatorFrame
      title="hermes update pipeline"
      hint="ELI5: ফোনের app update-এর মতো — আগে backup, তারপর নতুন code, তারপর পরীক্ষা। কোথায় কী ভাঙতে পারে সেটা বেছে দেখো।"
    >
      <ScenarioControls
        scenario={scenario}
        flags={flags}
        onScenario={setScenario}
        onFlags={setFlags}
      />
      <StepList steps={steps} />
      <LessonBox>
        শুধু syntax validation ব্যর্থ হলে automatic rollback হয়; বাকি সব
        সমস্যায় নিজে recover করতে হয়। Code rollback data ফেরত আনে না —
        snapshot/backup দরকার।
      </LessonBox>
    </SimulatorFrame>
  );
}
