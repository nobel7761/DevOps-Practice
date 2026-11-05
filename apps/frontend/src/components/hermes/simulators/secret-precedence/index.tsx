"use client";

import { useState } from "react";
import { ControlSwitch, LessonBox } from "@/components/shared/simulator";
import SimulatorFrame from "../SimulatorFrame";
import { resolve, type Inputs, type Source } from "./logic";
import SourceControls from "./SourceControls";

const INITIAL: Inputs = {
  envHas: true,
  preserve: false,
  aliasHas: false,
  profileAlias: true,
  sources: [
    { name: "Source A", has: true, shape: "bulk", override: false },
    { name: "Source B", has: true, shape: "mapped", override: false },
  ],
};

export default function SecretPrecedenceSimulator() {
  const [i, setI] = useState(INITIAL);
  const setSource = (idx: 0 | 1, patch: Partial<Source>) =>
    setI((x) => ({
      ...x,
      sources: x.sources.map((s, n) =>
        n === idx ? { ...s, ...patch } : s,
      ) as Inputs["sources"],
    }));
  const verdict = resolve(i);
  return (
    <SimulatorFrame
      title="Secret Precedence — কোন source-এর মান জেতে?"
      hint="ELI5: একই পাসওয়ার্ডের নাম একাধিক জায়গায় থাকলে Hermes-কে বেছে নিতে হয় কোনটা সত্যি। নিয়ম: আগে থেকে থাকা .env/shell জেতে, যদি না source বলে 'আমি বদলে দেব'।"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
          <ControlSwitch
            label=".env / shell-এ OPENAI_API_KEY আছে"
            checked={i.envHas}
            onChange={(envHas) => setI({ ...i, envHas })}
          />
          <ControlSwitch
            label="secrets.preserve_existing-এ নাম আছে"
            checked={i.preserve}
            onChange={(preserve) => setI({ ...i, preserve })}
          />
          <ControlSwitch
            label="শুধু OPENAI_API_KEY_WORK আছে (profile alias)"
            checked={i.aliasHas}
            onChange={(aliasHas) => setI({ ...i, aliasHas })}
          />
          <ControlSwitch
            label="secrets.profile_alias চালু"
            checked={i.profileAlias}
            onChange={(profileAlias) => setI({ ...i, profileAlias })}
          />
        </div>
        <SourceControls
          source={i.sources[0]}
          onChange={(p) => setSource(0, p)}
        />
        <SourceControls
          source={i.sources[1]}
          onChange={(p) => setSource(1, p)}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        secrets.sources-এর ক্রম: Source A, তারপর Source B। (1Password-এর token
        একটা load order, ranking নয়: .op.env শুধু তখনই লোড হয় যখন
        OP_SERVICE_ACCOUNT_TOKEN আগে থেকে process env-এ নেই। তাই এটা এখানে মডেল
        করা হয়নি।)
      </p>
      <div className="rounded-lg border border-border bg-background/60 p-3 text-sm">
        <p className="font-semibold">
          🏆 OPENAI_API_KEY আসবে: {verdict.winner}
        </p>
        <ol className="mt-1 list-decimal pl-5 text-muted-foreground">
          {verdict.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>
      <LessonBox>
        <p>
          তিন নিয়ম: (১) .env/shell ডিফল্টে জেতে — source-এ override_existing:
          true লাগে বদলাতে; (২) mapped source বেশি শক্তিশালী bulk-এর চেয়ে; (৩)
          একই shape-এ ক্রমে প্রথমটা জেতে। preserve_existing সবকিছুর ওপরে।
        </p>
      </LessonBox>
    </SimulatorFrame>
  );
}
