export type Mode = "session" | "global" | "once";

export interface Input {
  mode: Mode;
  tokens: number;
  sameModel: boolean;
  confirmThreshold: number; // switch_context_confirm_tokens; 0 disables
}

export function analyze(i: Input) {
  const scope = {
    session: "শুধু এই session — config.yaml বদলায় না",
    global: "এই session-এ এখনই + config.yaml-এ default হিসেবে সেভ",
    once: "শুধু একটা turn, তারপর আগের model ফেরত — কিছু সেভ হয় না",
  }[i.mode];
  const confirm =
    !i.sameModel && i.confirmThreshold > 0 && i.tokens > i.confirmThreshold;
  // Cache is tied to the serving model: one re-read per change; --once changes twice.
  const reReads = i.sameModel ? 0 : i.mode === "once" ? 2 : 1;
  return { scope, confirm, reReads, reReadTokens: reReads * i.tokens };
}
