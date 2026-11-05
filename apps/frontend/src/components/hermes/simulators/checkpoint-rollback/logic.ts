export const FILES = ["app.py", "config.yaml", "notes.md"] as const;
export type FileName = (typeof FILES)[number];
export type Contents = Record<FileName, string | null>; // null = মুছে ফেলা
export type AgentTool = "write_file" | "patch" | "rm";

export interface Checkpoint {
  id: number;
  label: string;
  snapshot: Contents;
}

export interface State {
  enabled: boolean;
  files: Contents;
  handEdited: FileName[]; // Hermes শেষবার যা লিখেছে তার চেয়ে আলাদা
  checkpoints: Checkpoint[];
  turnCheckpointed: boolean; // এই turn-এ ইতিমধ্যে checkpoint হয়েছে
  turn: number;
  log: string[];
}

export const initial = (enabled: boolean): State => ({
  enabled,
  files: { "app.py": "v1", "config.yaml": "v1", "notes.md": "v1" },
  handEdited: [],
  checkpoints: [],
  turnCheckpointed: false,
  turn: 1,
  log: [],
});

const say = (s: State, msg: string): State => ({ ...s, log: [...s.log, msg] });

function snapshotIfNeeded(s: State, label: string): State {
  if (!s.enabled)
    return say(s, "Checkpoint বন্ধ (default) — কিছু সংরক্ষণ হলো না।");
  if (s.turnCheckpointed)
    return say(
      s,
      "এই turn-এ আগেই checkpoint নেওয়া হয়েছে — আবার নয় (প্রতি turn-এ সর্বোচ্চ ১টা)।",
    );
  const last = s.checkpoints[s.checkpoints.length - 1];
  if (last && FILES.every((f) => last.snapshot[f] === s.files[f]))
    return say(
      s,
      "শেষ checkpoint থেকে কিছু বদলায়নি — snapshot নেওয়া হলো না।",
    );
  const cp: Checkpoint = {
    id: s.checkpoints.length + 1,
    label,
    snapshot: { ...s.files },
  };
  return say(
    { ...s, checkpoints: [...s.checkpoints, cp], turnCheckpointed: true },
    `📸 Checkpoint #${cp.id} নেওয়া হলো (${label})।`,
  );
}

export function agentAct(s: State, tool: AgentTool, file: FileName): State {
  const next = snapshotIfNeeded(s, `${tool} ${file}`);
  const value = tool === "rm" ? null : `agent-${next.turn}`;
  return say(
    {
      ...next,
      files: { ...next.files, [file]: value },
      handEdited: next.handEdited.filter((f) => f !== file),
    },
    tool === "rm"
      ? `🤖 rm ${file} — ফাইল মুছে গেল।`
      : `🤖 ${tool} ${file} → ${value}`,
  );
}

export function handEdit(s: State, file: FileName): State {
  const files = { ...s.files, [file]: `hand-${s.log.length}` };
  return say(
    { ...s, files, handEdited: [...new Set([...s.handEdited, file])] },
    `✍️ তুমি নিজে ${file} edit করলে।`,
  );
}

export const nextTurn = (s: State): State =>
  say(
    { ...s, turn: s.turn + 1, turnCheckpointed: false },
    `— নতুন turn #${s.turn + 1} —`,
  );

/** /rollback N (keepHandEdits=true) অথবা /rollback N --all */
export function rollback(s: State, id: number, all: boolean): State {
  const target = s.checkpoints.find((c) => c.id === id);
  if (!target) return say(s, "এই নম্বরের checkpoint নেই।");
  const pre: Checkpoint = {
    id: s.checkpoints.length + 1,
    label: "pre-rollback (undo করার জন্য)",
    snapshot: { ...s.files },
  };
  const files = { ...s.files };
  const skipped: FileName[] = [];
  for (const f of FILES) {
    if (!all && s.handEdited.includes(f)) skipped.push(f);
    else files[f] = target.snapshot[f];
  }
  const kept = skipped.length
    ? ` তোমার hand-edit রাখা হলো: ${skipped.join(", ")}।`
    : "";
  return say(
    {
      ...s,
      files,
      checkpoints: [...s.checkpoints, pre],
      handEdited: all ? [] : skipped,
    },
    `⏪ /rollback ${id}${all ? " --all" : ""} — ফাইল ফেরানো হলো, আগে pre-rollback snapshot #${pre.id} রাখা হয়েছে, শেষ conversation turn undo।${kept}`,
  );
}
