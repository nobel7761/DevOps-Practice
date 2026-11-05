"use client";

import { useState } from "react";
import { ControlSelect, LessonBox } from "@/components/shared/simulator";
import SimulatorFrame from "../SimulatorFrame";
import Meter from "./Meter";
import RefPicker from "./RefPicker";
import { REFS, evaluate, gitRef } from "./logic";

const SIZES = [
  { value: "32000", label: "32k context" },
  { value: "128000", label: "128k context" },
  { value: "200000", label: "200k context" },
];

export default function ContextReferenceBudgetSimulator() {
  const [chosen, setChosen] = useState<string[]>(["file", "diff"]);
  const [git, setGit] = useState(3);
  const [size, setSize] = useState("32000");
  const context = Number(size);

  const refs = [...REFS, gitRef(git)].filter((r) => chosen.includes(r.id));
  const result = evaluate(refs, context);

  return (
    <SimulatorFrame
      title="Context Reference Budget"
      hint="ELI5: @file, @diff ইত্যাদি লিখলে ভেতরের লেখা তোমার message-এ ঢোকে। বেশি ঢোকালে context ভরে যায় — সীমা কোথায় দেখো।"
    >
      <ControlSelect
        label="Model-এর context length"
        value={size}
        options={SIZES}
        onChange={setSize}
      />
      <RefPicker
        chosen={chosen}
        git={git}
        onToggle={(id, on) =>
          setChosen((c) => (on ? [...c, id] : c.filter((x) => x !== id)))
        }
        onGit={setGit}
      />
      <Meter
        used={result.used}
        context={context}
        ratio={result.ratio}
        verdict={result.verdict}
      />
      {result.blocked.length > 0 && (
        <p className="text-xs">
          🔒 Block হয়েছে (গণনায় নেই):{" "}
          {result.blocked.map((b) => b.label).join(", ")}
        </p>
      )}
      <LessonBox>
        বড় file-এ line range (@file:path:10-40) দাও। Expansion শুধু CLI-তে চলে;
        Telegram/Discord-এ @ syntax যেমন আছে তেমনই যায়। (Token সংখ্যা উদাহরণ
        মাত্র।)
      </LessonBox>
    </SimulatorFrame>
  );
}
