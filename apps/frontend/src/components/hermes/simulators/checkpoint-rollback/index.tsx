"use client";

import { useState } from "react";
import { Button } from "@/components/shared/shadcn";
import {
  ControlSelect,
  ControlSwitch,
  EventLog,
  LessonBox,
} from "@/components/shared/simulator";
import SimulatorFrame from "../SimulatorFrame";
import CheckpointList from "./CheckpointList";
import FilesPanel from "./FilesPanel";
import {
  FILES,
  agentAct,
  handEdit,
  initial,
  nextTurn,
  rollback,
  type AgentTool,
  type FileName,
} from "./logic";
import InlineCode from "../../lesson/InlineCode";

const TOOLS: AgentTool[] = ["write_file", "patch", "rm"];

export default function CheckpointRollbackSimulator() {
  const [s, setS] = useState(() => initial(true));
  const [file, setFile] = useState<FileName>("app.py");
  return (
    <SimulatorFrame
      title="Checkpoints ও /rollback"
      hint="ELI5: Game-এর save point-এর মতো। Agent ফাইল বদলানোর আগে Hermes চুপচাপ একটা save নেয়। গোলমাল হলে /rollback দিয়ে আগের অবস্থায় ফেরা যায়।"
    >
      <ControlSwitch
        label="checkpoints.enabled: true"
        description="v2-তে default false — চালু না করলে কিছু save হয় না"
        checked={s.enabled}
        onChange={(v) => setS(initial(v))}
      />
      <ControlSelect<FileName>
        label="কোন ফাইলে কাজ?"
        value={file}
        options={FILES.map((f) => ({ value: f, label: f }))}
        onChange={setFile}
      />
      <div className="flex flex-wrap gap-2">
        {TOOLS.map((t) => (
          <Button
            key={t}
            size="sm"
            onClick={() => setS((x) => agentAct(x, t, file))}
          >
            🤖 {t === "rm" ? "terminal: rm" : t}
          </Button>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setS((x) => handEdit(x, file))}
        >
          ✍️ নিজে edit
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setS(nextTurn)}>
          ➡️ নতুন turn
        </Button>
      </div>
      <FilesPanel files={s.files} handEdited={s.handEdited} />
      <CheckpointList
        checkpoints={s.checkpoints}
        onRollback={(id, all) => setS((x) => rollback(x, id, all))}
      />
      <EventLog
        entries={s.log}
        emptyText="এখনো কিছু ঘটেনি। একটা button চাপো।"
      />
      <LessonBox>
        <p>
          <InlineCode text="write_file, patch ও destructive terminal command (rm, mv, sed -i ...)-এর আগে checkpoint হয়। প্রতি turn-এ ১টা। `/rollback N` তোমার hand-edit রাখে; `--all` সব ওভাররাইট করে। Rollback-এর আগে pre-rollback snapshot হয় — তাই rollback-ও undo করা যায়।" />
        </p>
      </LessonBox>
    </SimulatorFrame>
  );
}
