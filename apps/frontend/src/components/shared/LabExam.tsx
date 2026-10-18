"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Badge, Progress } from "@/components/shared/shadcn";
import {
  createShell,
  currentUser,
  discardEditorAndExit,
  displayCwd,
  evaluateCheck,
  execute,
  isAwaitingInput,
  isInEditor,
  nodeMode,
  resolvePath,
  saveEditorAndExit,
  submitInput,
  updateEditorDraft,
  HOME,
  type ShellState,
} from "@/lib/lab-exam/engine";
import {
  continueTaskRetryState,
  shouldRevealAnswer,
} from "@/lib/lab-exam/attempt-policy";
import type { LabExamSpec, LabExamTarget } from "@/lib/lab-exam/types";

/* ── Target-tree visualization ─────────────────────────────────────────── */

interface TreeNode {
  name: string;
  abs: string;
  type: "dir" | "file";
  content?: string;
  mode?: string;
  owner?: string;
  group?: string;
  children: TreeNode[];
}

function buildTree(targets: LabExamTarget[]): TreeNode | null {
  const nodes = new Map<string, TreeNode>();
  const ensure = (
    abs: string,
    type: "dir" | "file",
    target?: LabExamTarget,
  ): TreeNode => {
    let node = nodes.get(abs);
    if (!node) {
      node = {
        name: abs.slice(abs.lastIndexOf("/") + 1),
        abs,
        type,
        children: [],
      };
      nodes.set(abs, node);
    }
    if (target?.content !== undefined) node.content = target.content;
    if (target?.mode !== undefined) node.mode = target.mode;
    if (target?.owner !== undefined) node.owner = target.owner;
    if (target?.group !== undefined) node.group = target.group;
    return node;
  };
  let root: TreeNode | null = null;
  for (const t of targets) {
    const abs = resolvePath(HOME, t.path);
    ensure(abs, t.type, t);
    // link ancestors up to (excluding) HOME
    let cur = abs;
    while (cur !== HOME && cur !== "/") {
      const parent = cur.slice(0, cur.lastIndexOf("/")) || "/";
      if (parent === HOME || parent === "/") {
        root = nodes.get(cur) ?? root;
        break;
      }
      const parentNode = ensure(parent, "dir");
      const child = nodes.get(cur)!;
      if (!parentNode.children.some((c) => c.abs === cur))
        parentNode.children.push(child);
      cur = parent;
    }
  }
  for (const n of nodes.values())
    n.children.sort((a, b) => a.name.localeCompare(b.name));
  return root;
}

function TreeNodeView({ node, shell }: { node: TreeNode; shell: ShellState }) {
  const fsNode = shell.fs[node.abs];
  const created = !!fsNode && fsNode.type === node.type;
  const contentOk =
    node.content === undefined || (fsNode?.content ?? "") === node.content;
  const wantsPerms =
    node.mode !== undefined ||
    node.owner !== undefined ||
    node.group !== undefined;
  const permsOk =
    !wantsPerms ||
    (!!fsNode &&
      (node.mode === undefined || nodeMode(fsNode) === node.mode) &&
      (node.owner === undefined || (fsNode.owner ?? "root") === node.owner) &&
      (node.group === undefined || (fsNode.group ?? "root") === node.group));
  const done = created && contentOk && permsOk;
  const isCwd = shell.cwd === node.abs;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex flex-col items-center rounded-full border-2 px-3 py-1 text-xs font-semibold transition-all duration-500 ${
          done
            ? "border-emerald-400 bg-emerald-100 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300"
            : created
              ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
              : "border-dashed border-border bg-muted text-muted-foreground"
        } ${isCwd ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-background dark:ring-indigo-300" : ""}`}
        title={
          node.abs + (node.content !== undefined ? ` — "${node.content}"` : "")
        }
      >
        <span>
          {node.type === "dir" ? "📁" : "📄"} {node.name}
        </span>
        {node.content !== undefined && done && (
          <span className="text-[9px] font-normal text-emerald-600 dark:text-emerald-400">
            “{node.content}”
          </span>
        )}
        {wantsPerms && (
          <span
            className={`font-mono text-[9px] font-bold ${
              created && permsOk
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            }`}
            title="টার্গেট permission/ownership"
          >
            🔐 {node.mode ?? ""}
            {(node.owner || node.group) &&
              ` ${node.owner ?? "?"}:${node.group ?? "?"}`}
          </span>
        )}
      </div>
      {isCwd && (
        <span className="mt-0.5 text-[9px] font-bold text-indigo-500 dark:text-indigo-300">
          তুমি এখানে
        </span>
      )}
      {node.children.length > 0 && (
        <>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-start gap-3 border-t border-border pt-3">
            {node.children.map((c) => (
              <TreeNodeView key={c.abs} node={c} shell={shell} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Users & Groups panel (user-management labs) ──────────────────────── */

function GroupsPanel({
  groupTargets,
  shell,
}: {
  groupTargets: NonNullable<LabExamSpec["groupTargets"]>;
  shell: ShellState;
}) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      {groupTargets.map((gt) => {
        const groupExists = shell.groups[gt.group] !== undefined;
        return (
          <div
            key={gt.group}
            className={`min-w-36 rounded-xl border-2 p-2.5 transition-all duration-500 ${
              groupExists
                ? "border-violet-400 bg-violet-50 dark:border-violet-500/40 dark:bg-violet-500/10"
                : "border-dashed border-border bg-muted"
            }`}
          >
            <p
              className={`mb-2 text-xs font-bold ${
                groupExists
                  ? "text-violet-700 dark:text-violet-300"
                  : "text-muted-foreground"
              }`}
            >
              👥 {gt.group}
              {groupExists && (
                <span className="ml-1 font-normal text-violet-400">
                  gid {shell.groups[gt.group]}
                </span>
              )}
            </p>
            <div className="flex flex-col gap-1">
              {gt.users.map((name) => {
                const user = shell.users[name];
                const isMember =
                  !!user &&
                  (user.primary === gt.group ||
                    user.supplementary.includes(gt.group));
                const isPrimary = !!user && user.primary === gt.group;
                return (
                  <div
                    key={name}
                    className={`flex items-center gap-1.5 rounded-full border-2 px-2.5 py-0.5 text-[11px] font-semibold transition-all duration-500 ${
                      isMember
                        ? "border-emerald-400 bg-emerald-100 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : user
                          ? "border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
                          : "border-dashed border-border bg-card text-muted-foreground"
                    }`}
                    title={
                      !user
                        ? "user এখনো তৈরি হয়নি"
                        : isMember
                          ? isPrimary
                            ? "primary member"
                            : "supplementary member"
                          : "user আছে, কিন্তু এই group-এ এখনো ঢোকেনি"
                    }
                  >
                    <span>👤 {name}</span>
                    {user?.locked && <span title="locked">🔒</span>}
                    {isPrimary && (
                      <span className="rounded bg-emerald-200 px-1 text-[8px] font-bold text-emerald-800 dark:bg-emerald-500/30 dark:text-emerald-200">
                        1°
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Live per-user status — unlike `GroupsPanel` (which only tracks a fixed,
 * per-lab target list), this derives straight from the running shell, so
 * every user that exists shows up, and attribute-only commands with no
 * filesystem/group footprint (`passwd`, `usermod -s/-l/-c`, lock/unlock)
 * still get visible, live feedback somewhere.
 */
function AccountStatusPanel({ shell }: { shell: ShellState }) {
  const names = Object.keys(shell.users).filter((name) => name !== "root");
  if (names.length === 0) return null;

  return (
    <div className="flex flex-wrap items-start gap-3">
      {names.map((name) => {
        const user = shell.users[name];
        return (
          <div
            key={name}
            className="min-w-48 rounded-xl border-2 border-sky-400 bg-sky-50 p-2.5 transition-all duration-500 dark:border-sky-500/40 dark:bg-sky-500/10"
          >
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300">
              👤 {name}
              <span className="font-normal text-sky-500 dark:text-sky-400">
                uid {user.uid}
              </span>
              {user.locked ? (
                <span title="locked">🔒</span>
              ) : (
                <span title="unlocked">🔓</span>
              )}
            </p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-[11px]">
              <dt className="text-muted-foreground">password</dt>
              <dd
                className={
                  user.passwordSet
                    ? "font-semibold text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                }
              >
                {user.passwordSet ? "সেট করা ✓" : "সেট করা হয়নি"}
              </dd>
              <dt className="text-muted-foreground">shell</dt>
              <dd className="font-mono text-foreground/80">{user.shell}</dd>
              <dt className="text-muted-foreground">home</dt>
              <dd className="font-mono text-foreground/80">
                {user.home ?? `/home/${name}`}
              </dd>
              <dt className="text-muted-foreground">primary</dt>
              <dd className="text-foreground/80">{user.primary}</dd>
              {user.supplementary.length > 0 && (
                <>
                  <dt className="text-muted-foreground">groups</dt>
                  <dd className="text-foreground/80">
                    {user.supplementary.join(", ")}
                  </dd>
                </>
              )}
            </dl>
          </div>
        );
      })}
    </div>
  );
}

/* ── Terminal ──────────────────────────────────────────────────────────── */

/** root gets the classic `#`; anyone su'd/logged-in as another user gets `$`. */
function shellPrompt(shell: ShellState): string {
  const user = currentUser(shell);
  return `${user}@lab:${displayCwd(shell.cwd)}${user === "root" ? "#" : "$"}`;
}

interface HistoryEntry {
  prompt: string;
  cmd: string;
  output: string;
  error: boolean;
  verdict?: "pass" | "fail";
  reason?: string;
}

/* ── Main component ────────────────────────────────────────────────────── */

export default function LabExam({ spec }: { spec: LabExamSpec }) {
  const [shell, setShell] = useState<ShellState>(createShell);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [taskIdx, setTaskIdx] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [revealedHints, setRevealedHints] = useState(0);
  const [results, setResults] = useState<boolean[]>([]); // firstTry per solved task
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number | null>(null);
  // Set while a multi-step prompt (e.g. `passwd`) is mid-flow: the task check
  // only runs once it resolves, graded against the command that started it.
  // `transcript` accumulates each step's prompt line into one terminal block,
  // matching how a real `passwd` run reads top to bottom.
  const [pendingContext, setPendingContext] = useState<{
    prompt: string;
    command: string;
    prevState: ShellState;
    transcript: string[];
  } | null>(null);
  // Set while a `vim`/`vi`/`nano`/`visudo` session is open — same idea as
  // `pendingContext`, but for an editor session instead of a text prompt.
  const [pendingEditorContext, setPendingEditorContext] = useState<{
    prompt: string;
    command: string;
    prevState: ShellState;
  } | null>(null);
  const [editorCmdInput, setEditorCmdInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const editorCmdRef = useRef<HTMLInputElement>(null);
  const termRef = useRef<HTMLDivElement>(null);
  const awaitingInput = isAwaitingInput(shell);
  const inEditor = isInEditor(shell);

  const tree = useMemo(() => buildTree(spec.targets), [spec.targets]);
  const totalPoints = spec.tasks.reduce((a, t) => a + t.points, 0);
  const score = spec.tasks.reduce(
    (a, t, i) => a + (results[i] ? t.points : 0),
    0,
  );
  const finished = taskIdx >= spec.tasks.length;
  const scorePercent = Math.round((score / totalPoints) * 100);
  const passed = scorePercent >= spec.passPercent;
  const task = spec.tasks[taskIdx];
  // Auto-nudge with the first tip after 2 failed attempts; the button lets
  // the learner pull further tips on their own at any time.
  const revealedHintCount = !task
    ? 0
    : Math.min(
        task.hints?.length ?? 0,
        Math.max(revealedHints, attempts >= 2 && task.hints?.length ? 1 : 0),
      );

  const finishAttempt = (
    prompt: string,
    cmd: string,
    output: string,
    result: ReturnType<typeof execute>,
    checkCtx: { command: string; prevState: ShellState },
  ) => {
    const check = evaluateCheck(task.check, {
      input: checkCtx.command,
      prevState: checkCtx.prevState,
      result,
    });
    // Only a passing command advances the world — failed attempts show their
    // output but roll back, so every task starts from a known state.
    setShell(check.pass ? result.state : checkCtx.prevState);
    setHistory((h) => [
      ...h,
      {
        prompt,
        cmd,
        output,
        error: result.error,
        verdict: check.pass ? "pass" : "fail",
        reason: check.reason,
      },
    ]);
    if (check.pass) {
      setResults((r) => [...r, attempts === 0]);
      setTaskIdx((i) => i + 1);
      setAttempts(0);
      setRevealedHints(0);
    } else {
      setAttempts((a) => a + 1);
    }
  };

  const focusAfterRender = () => {
    setHistIdx(null);
    setInput("");
    setTimeout(() => {
      termRef.current?.scrollTo({ top: termRef.current.scrollHeight });
      inputRef.current?.focus();
    }, 0);
  };

  // `:wq`/`:x` saves, `:q`/`:q!` discards — anything else is an unrecognized
  // editor command and just stays in the editor (like real vim would).
  const handleEditorCommand = (raw: string) => {
    if (!pendingEditorContext) return;
    const normalized = raw.trim().replace(/^:/, "");
    const isSave = normalized === "wq" || normalized === "x";
    const isDiscard = normalized === "q" || normalized === "q!";
    if (!isSave && !isDiscard) return;

    const result = isSave
      ? saveEditorAndExit(shell)
      : discardEditorAndExit(shell);
    const output = isSave ? `"${pendingEditorContext.command}" saved` : "";
    finishAttempt(
      pendingEditorContext.prompt,
      pendingEditorContext.command,
      output,
      result,
      pendingEditorContext,
    );
    setPendingEditorContext(null);
    setEditorCmdInput("");
    focusAfterRender();
  };

  const submit = () => {
    if (finished || !input.trim()) return;

    // Mid-flow of a multi-step prompt (e.g. `passwd`'s two masked entries):
    // continue it instead of treating the typed line as a new command, and
    // only grade the originating command once the whole prompt resolves —
    // all of it renders as one terminal block, like a real `passwd` run.
    if (awaitingInput && pendingContext) {
      const result = submitInput(shell, input);
      const transcript = [...pendingContext.transcript, result.output];
      if (isAwaitingInput(result.state)) {
        setShell(result.state);
        setPendingContext({ ...pendingContext, transcript });
      } else {
        finishAttempt(
          pendingContext.prompt,
          pendingContext.command,
          transcript.join("\n"),
          result,
          pendingContext,
        );
        setPendingContext(null);
      }
      focusAfterRender();
      return;
    }

    const prompt = shellPrompt(shell);
    const prevState = shell;
    const result = execute(shell, input);

    // `vim`/`vi`/`nano`/`visudo` hands control to the editor view — not
    // graded until the learner saves or discards.
    if (isInEditor(result.state)) {
      setShell(result.state);
      setPendingEditorContext({ prompt, command: input, prevState });
      setHistIdx(null);
      setInput("");
      setTimeout(() => editorRef.current?.focus(), 0);
      return;
    }

    // A command that opens a multi-step prompt (e.g. `passwd joker`) isn't
    // graded yet — just remember it and wait for the next typed line.
    if (isAwaitingInput(result.state)) {
      setShell(result.state);
      setPendingContext({
        prompt,
        command: input,
        prevState,
        transcript: [result.output],
      });
      focusAfterRender();
      return;
    }

    finishAttempt(prompt, input, result.output, result, {
      command: input,
      prevState,
    });
    setCmdHistory((h) => [...h, input]);
    focusAfterRender();
  };

  const reset = () => {
    setShell(createShell());
    setHistory([]);
    setTaskIdx(0);
    setAttempts(0);
    setRevealedHints(0);
    setResults([]);
    setCmdHistory([]);
    setHistIdx(null);
    setInput("");
    setPendingContext(null);
    setPendingEditorContext(null);
    setEditorCmdInput("");
  };

  // After the 10-attempt answer reveal: keep practicing the same task
  // without wiping earlier progress (unlike `reset`, which restarts the
  // whole exam).
  const continueTask = () => {
    const next = continueTaskRetryState({
      attempts,
      revealedHints,
      taskIdx,
      results,
    });
    setAttempts(next.attempts);
    setRevealedHints(next.revealedHints);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (awaitingInput || !cmdHistory.length) return;
      const next =
        histIdx === null ? cmdHistory.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(next);
      setInput(cmdHistory[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (awaitingInput || histIdx === null) return;
      const next = histIdx + 1;
      if (next >= cmdHistory.length) {
        setHistIdx(null);
        setInput("");
      } else {
        setHistIdx(next);
        setInput(cmdHistory[next]);
      }
    }
  };

  return (
    <section className="mt-10">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-bold text-foreground">🖥️ {spec.title}</h2>
        <Badge variant="secondary">
          {Math.min(taskIdx + 1, spec.tasks.length)}/{spec.tasks.length}
        </Badge>
        <span className="ml-auto text-sm font-semibold text-muted-foreground">
          স্কোর: {score}/{totalPoints}
        </span>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{spec.intro}</p>
      <Progress value={(taskIdx / spec.tasks.length) * 100} className="mb-5" />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left: task + terminal */}
        <div className="flex flex-col gap-3">
          {!finished ? (
            <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/10">
              {task.section && (
                <div className="mb-3 border-b border-indigo-200 pb-2 dark:border-indigo-500/30">
                  <p className="text-sm font-bold text-foreground">
                    {task.section.title}
                  </p>
                  {task.section.note && (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {task.section.note}
                    </p>
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-indigo-500 dark:text-indigo-300">
                প্রশ্ন {taskIdx + 1} · {task.points} নম্বর
                {attempts > 0 && (
                  <span className="text-amber-600 dark:text-amber-400">
                    · চেষ্টা {attempts + 1} (প্রথম চেষ্টায় না হলে নম্বর নেই)
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium leading-relaxed text-foreground">
                {task.prompt}
              </p>
              {task.hints && task.hints.length > 0 && (
                <div className="mt-2 flex flex-col gap-1.5">
                  <AnimatePresence initial={false}>
                    {task.hints.slice(0, revealedHintCount).map((h, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
                      >
                        💡 {h}
                      </motion.p>
                    ))}
                  </AnimatePresence>
                  {revealedHintCount < task.hints.length ? (
                    <button
                      onClick={() => setRevealedHints(revealedHintCount + 1)}
                      className="self-start rounded-lg border border-amber-300 bg-card px-3 py-1 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-500/10"
                    >
                      💡{" "}
                      {revealedHintCount === 0
                        ? "একটা Tip দাও"
                        : "আরেকটা Tip দাও"}{" "}
                      ({revealedHintCount}/{task.hints.length})
                    </button>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">
                      এই প্রশ্নের সব tips দেখানো হয়ে গেছে।
                    </p>
                  )}
                </div>
              )}
              {shouldRevealAnswer(attempts) && (
                <div className="mt-3 rounded-lg border-2 border-rose-300 bg-rose-50 p-3 dark:border-rose-500/40 dark:bg-rose-500/10">
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                    ১০ বার চেষ্টা হয়ে গেছে — এই প্রশ্নের সঠিক উত্তর:
                  </p>
                  <code className="mt-2 block rounded bg-slate-900 px-3 py-2 font-mono text-xs text-emerald-300">
                    {task.answer ?? "(এই task-এর জন্য answer এখনো নেই)"}
                  </code>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Command-টা ভালো করে বুঝে নাও — তারপর এই প্রশ্নটা আবার চেষ্টা
                    করো, আগের progress ঠিক থাকবে।
                  </p>
                  <button
                    onClick={continueTask}
                    className="mt-2 rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-rose-700"
                  >
                    ➡️ এখান থেকেই Continue করো
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`rounded-xl border-2 p-5 text-center ${
                passed
                  ? "border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10"
                  : "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10"
              }`}
            >
              <div className="text-3xl">{passed ? "🎉" : "😤"}</div>
              <p
                className={`mt-1 text-lg font-bold ${passed ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}
              >
                {passed ? "PASSED!" : "এবার হয়নি"} — {scorePercent}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {passed
                  ? "৯৫%-এর দেয়াল টপকে গেছো। পরের লেসন তোমার। 🐧"
                  : `pass mark ${spec.passPercent}%। নতুন container, নতুন শুরু — এটাই অভ্যাস।`}
              </p>
              <button
                onClick={reset}
                className="mt-3 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                ↻ আবার দাও
              </button>
            </div>
          )}

          {/* Terminal — always a dark terminal window, by convention, regardless of site theme */}
          <div className="overflow-hidden rounded-xl bg-slate-950 shadow-lg">
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2 text-[10px] text-slate-400">
                linux-lab — exam terminal
              </span>
            </div>
            <div
              ref={termRef}
              className="max-h-72 min-h-40 overflow-y-auto p-3 font-mono text-xs leading-relaxed"
            >
              {pendingEditorContext && shell.pendingEditor ? (
                // A real modal vim clone is out of scope — this simplified
                // editor covers what actually matters for these labs: open,
                // edit, and save/discard with the real :wq/:x/:q!/:q muscle
                // memory.
                <div className="flex h-64 flex-col overflow-hidden rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between bg-slate-900 px-2 py-1 text-[10px] text-slate-400">
                    <span className="font-mono">
                      &quot;{shell.pendingEditor.path}&quot;
                    </span>
                    <span>Esc তারপর :wq (save) / :q! (discard)</span>
                  </div>
                  <textarea
                    ref={editorRef}
                    value={shell.pendingEditor.content}
                    onChange={(e) =>
                      setShell(updateEditorDraft(shell, e.target.value))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        editorCmdRef.current?.focus();
                      }
                    }}
                    className="flex-1 resize-none bg-slate-950 p-2 font-mono text-xs text-slate-100 outline-none"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 font-mono text-xs">
                    <span className="text-amber-300">:</span>
                    <input
                      ref={editorCmdRef}
                      value={editorCmdInput}
                      onChange={(e) => setEditorCmdInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleEditorCommand(editorCmdInput);
                        }
                      }}
                      placeholder="wq"
                      className="flex-1 bg-transparent text-amber-300 outline-none placeholder:text-slate-600"
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {history.map((h, i) => (
                    <div key={i} className="mb-1.5">
                      <div>
                        <span className="text-emerald-400">{h.prompt}</span>{" "}
                        <span className="text-slate-100">{h.cmd}</span>{" "}
                        {h.verdict === "pass" ? (
                          <span className="font-bold text-emerald-400">✓</span>
                        ) : (
                          <span className="font-bold text-rose-400">✗</span>
                        )}
                      </div>
                      {h.output && (
                        <pre
                          className={`whitespace-pre-wrap ${h.error ? "text-rose-300" : "text-slate-300"}`}
                        >
                          {h.output}
                        </pre>
                      )}
                      {h.verdict === "fail" && h.reason && !h.error && (
                        <div className="mt-0.5 inline-block rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-300">
                          → {h.reason}
                        </div>
                      )}
                    </div>
                  ))}
                  {awaitingInput && pendingContext && (
                    <div className="mb-1.5">
                      <div>
                        <span className="text-emerald-400">
                          {pendingContext.prompt}
                        </span>{" "}
                        <span className="text-slate-100">
                          {pendingContext.command}
                        </span>
                      </div>
                      {pendingContext.transcript.length > 1 && (
                        <pre className="whitespace-pre-wrap text-slate-300">
                          {pendingContext.transcript.slice(0, -1).join("\n")}
                        </pre>
                      )}
                    </div>
                  )}
                  {!finished && (
                    <div className="flex items-center">
                      <span className="shrink-0 text-emerald-400">
                        {awaitingInput && pendingContext
                          ? pendingContext.transcript[
                              pendingContext.transcript.length - 1
                            ]
                          : shellPrompt(shell)}
                      </span>
                      <input
                        ref={inputRef}
                        type={awaitingInput ? "password" : "text"}
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          setHistIdx(null);
                        }}
                        onKeyDown={onKeyDown}
                        className="ml-2 w-full bg-transparent font-mono text-xs text-slate-100 outline-none placeholder:text-slate-600"
                        placeholder={awaitingInput ? "" : "কমান্ড লিখে Enter…"}
                        spellCheck={false}
                        autoComplete="off"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: target visualizations */}
        <div className="flex flex-col gap-4">
          {spec.groupTargets && spec.groupTargets.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-3 text-xs font-bold text-muted-foreground">
                👥 টার্গেট Groups & Users — সদস্য হলেই চিপ সবুজ হবে
              </p>
              <GroupsPanel groupTargets={spec.groupTargets} shell={shell} />
              <p className="mt-3 text-[10px] text-muted-foreground">
                dashed = user নেই · হলুদ = user আছে, group-এ ঢোকেনি · সবুজ =
                সদস্য ✓ · 1° = primary · 🔒 = locked
              </p>
            </div>
          )}
          {Object.keys(shell.users).some((name) => name !== "root") && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-3 text-xs font-bold text-muted-foreground">
                🪪 Account Status — যা তৈরি হয়েছে তা লাইভ দেখাবে
              </p>
              <AccountStatusPanel shell={shell} />
            </div>
          )}
          {tree && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-3 text-xs font-bold text-muted-foreground">
                🎯 টার্গেট কাঠামো — সঠিক কমান্ডে নোডগুলো সবুজ হবে
              </p>
              <div className="overflow-x-auto pb-2">
                <TreeNodeView node={tree} shell={shell} />
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground">
                📁 dashed = এখনো হয়নি · সবুজ = তৈরি ✓ · নীল রিং = তুমি এখন
                যেখানে (cd করলে নড়বে)
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
