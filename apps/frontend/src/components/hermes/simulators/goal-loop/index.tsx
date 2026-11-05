"use client";

import { useState } from "react";
import { Button } from "@/components/shared/shadcn";
import {
  ControlSelect,
  ControlSlider,
  ControlSwitch,
  EventLog,
  LessonBox,
} from "@/components/shared/simulator";
import SimulatorFrame from "../SimulatorFrame";
import GoalStatus from "./GoalStatus";
import {
  afterTurn,
  clear,
  initial,
  pause,
  resume,
  type Outcome,
} from "./logic";

const OUTCOMES: { value: Outcome; label: string }[] = [
  { value: "progress", label: "কাজ চলছে, শেষ হয়নি" },
  { value: "confirmed", label: "Agent স্পষ্ট বলল কাজ শেষ" },
  { value: "impossible", label: "কাজটা করা সম্ভবই না" },
  { value: "judge-error", label: "Judge model error দিল" },
];

export default function GoalLoopSimulator() {
  const [maxTurns, setMaxTurns] = useState(5);
  const [s, setS] = useState(() => initial(5));
  const [outcome, setOutcome] = useState<Outcome>("progress");
  const [gateFails, setGateFails] = useState(false);
  return (
    <SimulatorFrame
      title="/goal — স্থায়ী লক্ষ্য loop"
      hint="ELI5: তুমি একটা লক্ষ্য দিলে Hermes কাজ করে, তারপর একজন 'judge' দেখে শেষ হয়েছে কিনা। না হলে আবার চেষ্টা — যতক্ষণ না শেষ হয় বা turn budget ফুরায়।"
    >
      <ControlSlider
        label="goals.max_turns"
        value={maxTurns}
        min={2}
        max={20}
        onChange={(v) => {
          setMaxTurns(v);
          setS(initial(v));
        }}
      />
      <ControlSelect<Outcome>
        label="এই turn-এর পর Hermes-এর response কেমন?"
        value={outcome}
        options={OUTCOMES}
        onChange={setOutcome}
      />
      <ControlSwitch
        label="/goal gate add-করা gate fail করছে"
        description="Gate fail করলে judge চলে না"
        checked={gateFails}
        onChange={setGateFails}
      />
      <GoalStatus state={s} />
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={s.status !== "active"}
          onClick={() => setS((x) => afterTurn(x, outcome, gateFails))}
        >
          ▶ একটা work turn চালাও
        </Button>
        <Button size="sm" variant="outline" onClick={() => setS(pause)}>
          /goal pause
        </Button>
        <Button size="sm" variant="outline" onClick={() => setS(resume)}>
          /goal resume
        </Button>
        <Button size="sm" variant="outline" onClick={() => setS(clear)}>
          /goal clear
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setS(initial(maxTurns))}
        >
          নতুন /goal
        </Button>
      </div>
      <EventLog
        entries={s.log}
        emptyText="এখনো কিছু ঘটেনি। একটা button চাপো।"
      />
      <LessonBox>
        <p>
          Judge ভাঙলেও (error) loop আটকায় না — fail-open, verdict ধরা হয়
          continue; আসল backstop হলো turn budget (default ২০)। অসম্ভব goal কখনো
          done হয় না, paused হয়।
        </p>
      </LessonBox>
    </SimulatorFrame>
  );
}
