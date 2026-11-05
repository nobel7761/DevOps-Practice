"use client";

import { useState } from "react";
import { LessonBox } from "@/components/shared/simulator";
import SimulatorFrame from "../SimulatorFrame";
import FileToggles from "./FileToggles";
import Result from "./Result";
import { resolveContext, type Layout } from "./logic";

export default function ContextFilePrioritySimulator() {
  const [layout, setLayout] = useState<Layout>({
    present: ["AGENTS.md", "CLAUDE.md"],
    soul: true,
    gitRepo: true,
    agentsAtRootToo: false,
    flagged: false,
  });

  return (
    <SimulatorFrame
      title="Context File Priority"
      hint="ELI5: Project folder-এ অনেক নির্দেশের ফাইল থাকলে Hermes শুধু একটাই পড়ে — কোনটা, সেটা নিজে বানিয়ে দেখো।"
    >
      <FileToggles layout={layout} onChange={setLayout} />
      <Result outcome={resolveContext(layout)} />
      <LessonBox>
        ক্রম: .hermes.md → AGENTS.override.md → AGENTS.md → CLAUDE.md →
        .cursorrules। প্রথম যেটা মেলে সেটাই জেতে; SOUL.md সবসময় আলাদা।
      </LessonBox>
    </SimulatorFrame>
  );
}
