export type Status = "active" | "paused" | "done" | "cleared";
export type Outcome = "confirmed" | "progress" | "impossible" | "judge-error";

export const GATE_RETRIES = 3; // docs: গেটের default 3 retries

export interface State {
  status: Status;
  turns: number;
  maxTurns: number;
  gateFailures: number;
  log: string[];
}

export const initial = (maxTurns: number): State => ({
  status: "active",
  turns: 0,
  maxTurns,
  gateFailures: 0,
  log: ["/goal সেট হলো — প্রথম turn এখনই শুরু।"],
});

const push = (s: State, patch: Partial<State>, msg: string): State => ({
  ...s,
  ...patch,
  log: [...s.log, msg],
});

/** একটি work turn চলার পর: gate → judge → continue/stop */
export function afterTurn(
  s: State,
  outcome: Outcome,
  gateFails: boolean,
): State {
  if (s.status !== "active") return s;
  const turns = s.turns + 1;
  const base = `Turn ${turns}/${s.maxTurns}:`;
  const budget = (st: State, msg: string): State =>
    turns >= s.maxTurns
      ? push(
          st,
          { turns, status: "paused" },
          `${base} ${msg} → turn budget শেষ, goal paused। (/goal resume দিলে counter 0 হয়)`,
        )
      : push(
          st,
          { turns },
          `${base} ${msg} → continuation prompt একই session-এ গেল।`,
        );

  if (gateFails) {
    const gateFailures = s.gateFailures + 1;
    if (gateFailures >= GATE_RETRIES)
      return push(
        s,
        { turns, gateFailures, status: "paused" },
        `${base} gate ${gateFailures} বার fail — retry শেষ, goal paused।`,
      );
    return budget(
      { ...s, gateFailures },
      `gate fail (${gateFailures}/${GATE_RETRIES}), judge skip`,
    );
  }
  const clean = { ...s, gateFailures: 0 };
  if (outcome === "confirmed")
    return push(
      clean,
      { turns, status: "done" },
      `${base} judge: done — goal সম্পূর্ণ ✅`,
    );
  if (outcome === "impossible")
    return push(
      clean,
      { turns, status: "paused" },
      `${base} judge: blocked — “judged unachievable”, paused (done নয়)।`,
    );
  if (outcome === "judge-error")
    return budget(clean, "judge error → fail-open, verdict = continue");
  return budget(clean, "judge: continue");
}

export const pause = (s: State): State =>
  s.status === "active"
    ? push(s, { status: "paused" }, "/goal pause — loop থামল, goal রয়ে গেল।")
    : s;
export const resume = (s: State): State =>
  s.status === "paused"
    ? push(
        s,
        { status: "active", turns: 0, gateFailures: 0 },
        "/goal resume — loop চালু, turn counter 0।",
      )
    : s;
export const clear = (s: State): State =>
  push(s, { status: "cleared" }, "/goal clear — goal মুছে গেল।");
