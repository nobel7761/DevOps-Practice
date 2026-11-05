export const PRIORITY = [
  ".hermes.md",
  "AGENTS.override.md",
  "AGENTS.md",
  "CLAUDE.md",
  ".cursorrules",
] as const;
export type ProjectFile = (typeof PRIORITY)[number];

export interface Layout {
  present: ProjectFile[];
  soul: boolean;
  gitRepo: boolean;
  agentsAtRootToo: boolean;
  flagged: boolean;
}

export interface Outcome {
  winner: ProjectFile | null;
  ignored: ProjectFile[];
  blocked: boolean;
  chain: boolean;
  lines: string[];
}

export function resolveContext(l: Layout): Outcome {
  const winner = PRIORITY.find((f) => l.present.includes(f)) ?? null;
  const ignored = l.present.filter((f) => f !== winner);
  const chain =
    !!winner && winner.startsWith("AGENTS") && l.gitRepo && l.agentsAtRootToo;
  const lines: string[] = [];
  if (l.soul)
    lines.push(
      "SOUL.md → agent identity হিসেবে আলাদা slot #1-এ লোড (HERMES_HOME থেকে, project folder থেকে নয়)।",
    );
  if (!winner)
    lines.push("কোনো project context file নেই — শুধু SOUL.md (থাকলে)।");
  else if (l.flagged)
    lines.push(
      `${winner} prompt-injection scan-এ ধরা পড়েছে → [BLOCKED: ...] notice বসে, content লোড হয় না।`,
    );
  else
    lines.push(
      `${winner} লোড হলো — এটাই এই session-এর একমাত্র project context type।`,
    );
  if (chain)
    lines.push(
      "Git repo-র ভেতরে git root থেকে working directory পর্যন্ত AGENTS.md chain merge হয়; গভীরেরটা পরে লোড হয়, তাই অগ্রাধিকার পায়।",
    );
  if (winner && winner.startsWith("AGENTS") && !l.gitRepo)
    lines.push(
      "Git repo-র বাইরে শুধু working directory দেখা হয়; parent folder দেখা হয় না।",
    );
  if (winner === ".hermes.md")
    lines.push(".hermes.md git root পর্যন্ত উপরের দিকে খোঁজা হয়।");
  return { winner, ignored, blocked: !!winner && l.flagged, chain, lines };
}
