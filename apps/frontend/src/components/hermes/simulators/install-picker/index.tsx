"use client";

import { useState } from "react";
import { LessonBox } from "@/components/shared/simulator";
import SimulatorFrame from "../SimulatorFrame";
import Controls from "./Controls";
import PlanView from "./PlanView";
import { buildPlan, desktopAvailable, type Options } from "./logic";

export default function InstallPickerSimulator() {
  const [opts, setOpts] = useState<Options>({
    platform: "linux",
    mode: "cli",
    channelMain: false,
    skipBrowser: false,
    nonInteractive: false,
  });
  const effective: Options = desktopAvailable(opts.platform)
    ? opts
    : { ...opts, mode: "cli" };

  return (
    <SimulatorFrame
      title="Install Picker"
      hint="ELI5: তোমার কম্পিউটার/ফোন কোনটা সেটা বলো — Hermes কোন পথে install করবে সেটা দেখাবে।"
    >
      <Controls value={effective} onChange={setOpts} />
      <PlanView plan={buildPlan(effective)} />
      <LessonBox>
        Desktop app-এ সব bundle করা থাকে; CLI installer source clone করে নিজে সব
        বানায়। Android-এ আলাদা Termux package।
      </LessonBox>
    </SimulatorFrame>
  );
}
