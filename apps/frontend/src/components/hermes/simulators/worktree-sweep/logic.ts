export interface Tree {
  name: string;
  state: string;
  clean: boolean; // clean + merged/pushed
  keepReason?: string;
}

export const TREES: Tree[] = [
  { name: "hermes-a1b2", state: "clean, pushed", clean: true },
  { name: "subagent-c3d4", state: "uncommitted changes", clean: false },
  { name: "fix-login", state: "named, clean, merged", clean: true },
  {
    name: "hermes-e5f6",
    state: "ভেতরে live process চলছে",
    clean: true,
    keepReason: "live process",
  },
  {
    name: "t_9f2a",
    state: "Kanban task tree",
    clean: true,
    keepReason: "Kanban task tree (t_<hex>)",
  },
  {
    name: "hermes-g7h8",
    state: "submodule আছে",
    clean: true,
    keepReason: "submodule/embedded repo আছে",
  },
];

export type Verdict = { kind: "removed" | "archived" | "kept"; why: string };

/** Mirrors the stale-sweep rules from the git-worktrees docs. */
export function sweep(t: Tree, idleHours: number): Verdict {
  if (t.keepReason) return { kind: "kept", why: t.keepReason };
  const threshold = /^(hermes|subagent)-/.test(t.name) ? 24 : 72;
  if (idleHours < threshold) {
    return {
      kind: "kept",
      why: `recent activity — ${threshold} ঘণ্টা idle হয়নি`,
    };
  }
  return t.clean
    ? { kind: "removed", why: "idle, clean, merged/pushed → remove" }
    : {
        kind: "archived",
        why: "idle কিন্তু uncommitted/unpushed → archive করে তারপর remove",
      };
}
