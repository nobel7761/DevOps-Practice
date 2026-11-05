export type Status = "todo" | "ready" | "running" | "blocked" | "done";
export const COLUMNS: Status[] = [
  "todo",
  "ready",
  "running",
  "blocked",
  "done",
];
export type Exit = "complete" | "fail1" | "exit75" | "exit78";

export interface Task {
  id: number;
  title: string;
  parents: number[];
  status: Status;
  failures: number; // পরপর spawn/worker failure
}

export interface Board {
  tasks: Task[];
  failureLimit: number; // default 2
  log: string[];
}

export const initial = (): Board => ({
  failureLimit: 2,
  log: [],
  tasks: [
    { id: 1, title: "ডেটা সংগ্রহ", parents: [], status: "ready", failures: 0 },
    { id: 2, title: "রিপোর্ট লেখা", parents: [1], status: "todo", failures: 0 },
    {
      id: 3,
      title: "রিপোর্ট review",
      parents: [2],
      status: "todo",
      failures: 0,
    },
  ],
});

const parentsDone = (b: Board, t: Task) =>
  t.parents.every((p) => b.tasks.find((x) => x.id === p)?.status === "done");
const upd = (
  b: Board,
  id: number,
  patch: Partial<Task>,
  msg: string,
): Board => ({
  ...b,
  tasks: b.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  log: [...b.log, msg],
});

/** Dispatcher tick: todo→ready (সব parent done হলে), তারপর ready→running (claim + spawn) */
export function tick(b: Board): Board {
  let next = {
    ...b,
    log: [...b.log, "⏱ Dispatcher tick (default ৬০ সেকেন্ড পরপর)"],
  };
  for (const t of next.tasks) {
    if (t.status === "todo" && parentsDone(next, t))
      next = upd(
        next,
        t.id,
        { status: "ready" },
        `#${t.id} “${t.title}”: সব parent done → ready।`,
      );
  }
  for (const t of next.tasks) {
    if (t.status === "ready")
      next = upd(
        next,
        t.id,
        { status: "running" },
        `#${t.id} “${t.title}”: claim হলো, worker spawn।`,
      );
  }
  return next;
}

export function finish(b: Board, id: number, exit: Exit): Board {
  const t = b.tasks.find((x) => x.id === id);
  if (!t || t.status !== "running") return b;
  if (exit === "complete")
    return upd(
      b,
      id,
      { status: "done", failures: 0 },
      `#${id}: complete → done।`,
    );
  if (exit === "exit75")
    return upd(
      b,
      id,
      { status: "ready" },
      `#${id}: exit 75 (rate limit/timeout) → failure গোনা ছাড়াই requeue।`,
    );
  if (exit === "exit78")
    return upd(
      b,
      id,
      { status: "blocked" },
      `#${id}: exit 78 (terminal provider error) → ১ বারেই blocked।`,
    );
  const failures = t.failures + 1;
  return failures >= b.failureLimit
    ? upd(
        b,
        id,
        { status: "blocked", failures },
        `#${id}: exit 1 — ${failures}/${b.failureLimit} পরপর failure → auto-blocked।`,
      )
    : upd(
        b,
        id,
        { status: "ready", failures },
        `#${id}: exit 1 — failure ${failures}/${b.failureLimit}, আবার ready।`,
      );
}

/** Unblock: parent শেষ না হলে todo, নইলে ready */
export function unblock(b: Board, id: number): Board {
  const t = b.tasks.find((x) => x.id === id);
  if (!t || t.status !== "blocked") return b;
  const status: Status = parentsDone(b, t) ? "ready" : "todo";
  return upd(b, id, { status, failures: 0 }, `#${id}: unblock → ${status}।`);
}
