"use client";

import { useState } from "react";
import SimulatorFrame from "../SimulatorFrame";
import AuthControls from "./AuthControls";
import AuthOutcome from "./AuthOutcome";
import { decide, type AuthConfig } from "./logic";

const INITIAL: AuthConfig = {
  platform: "telegram",
  user: "999",
  allowAll: false,
  paired: false,
  emailPairing: false,
  adminSplit: true,
  command: "/status",
};

export default function GatewayAuthSimulator() {
  const [config, setConfig] = useState(INITIAL);
  const result = decide(config);
  return (
    <SimulatorFrame
      title="Gateway Auth — কে বটকে হুকুম দিতে পারে?"
      hint="ELI5: বট যেন একটা বাড়ি — দরজায় guest list (allowlist) থাকে। অচেনা কেউ এলে সে শুধু একটা কোড পায়, মালিক অনুমতি দিলে তবেই ঢোকে। ভেতরে ঢুকলেও সবাই সব হুকুম দিতে পারে না।"
    >
      <p className="rounded-md bg-background/60 p-2 font-mono text-xs">
        TELEGRAM_ALLOWED_USERS=111,222 · allow_admin_from: [&quot;111&quot;] ·
        user_allowed_commands: [status, model]
      </p>
      <AuthControls
        config={config}
        onChange={(p) => setConfig((c) => ({ ...c, ...p }))}
      />
      <AuthOutcome result={result} />
    </SimulatorFrame>
  );
}
