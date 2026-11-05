export type Behaviour =
  | "noop"
  | "block-json"
  | "approve-json"
  | "modify-json"
  | "exit2"
  | "bad-json"
  | "exit1"
  | "timeout";

export interface Hook {
  behaviour: Behaviour;
  failClosed: boolean;
}

export type Directive = "none" | "block" | "approve" | "modify";
export interface HookResult {
  directive: Directive;
  note: string;
}

export const BEHAVIOURS: { value: Behaviour; label: string }[] = [
  { value: "noop", label: "exit 0, stdout {} (no-op)" },
  { value: "block-json", label: 'stdout {"decision":"block","reason":…}' },
  { value: "approve-json", label: 'stdout {"action":"approve",…}' },
  { value: "modify-json", label: 'stdout {"action":"modify","args":{…}}' },
  { value: "exit2", label: "exit code 2 (stdout খালি)" },
  { value: "bad-json", label: "exit 0 কিন্তু stdout JSON নয়" },
  { value: "exit1", label: "exit code 1 (directive ছাড়া)" },
  { value: "timeout", label: "timeout পেরিয়ে গেল" },
];

/** একটা shell hook-এর নিজের ফলাফল (docs: pre_tool_call) */
export function runHook(h: Hook): HookResult {
  switch (h.behaviour) {
    case "noop":
      return { directive: "none", note: "valid no-op → এগিয়ে যায়।" };
    case "block-json":
      return { directive: "block", note: "block directive।" };
    case "approve-json":
      return {
        directive: "approve",
        note: "approval gate-এ escalate করতে চায়।",
      };
    case "modify-json":
      return { directive: "modify", note: "tool args বদলাতে চায়।" };
    case "exit2":
      return {
        directive: "block",
        note: "pre_tool_call-এ exit 2 → JSON ছাড়াই block (message: stdout, নইলে stderr-এর প্রথম ৪০০ অক্ষর)।",
      };
    default: {
      const what = {
        "bad-json": "malformed stdout",
        exit1: "non-zero exit",
        timeout: "timeout",
      }[h.behaviour];
      return h.failClosed
        ? {
            directive: "block",
            note: `${what} + fail_closed: true → tool block।`,
          }
        : {
            directive: "none",
            note: `${what} → shell hook-এ fail-open: warning log, tool এগোয়। (Python plugin-এর pre_tool_call timeout হলে উল্টো, সেটা fail-closed।)`,
          };
    }
  }
}

export interface Resolution {
  outcome: string;
  why: string;
}

/**
 * Source (hermes_cli/plugins.py): কোনো valid block থাকলে সেটা approve-কে হারায়।
 * Modify আলাদা tier নয় — সব modify একটা args-এ shallow-merge হয় (পরের key জেতে),
 * আর সেটা block/approve gate-এর আগে হিসাব হয়, তাই approve-এর সাথে merged args-ও যায়।
 */
export function resolve(results: HookResult[]): Resolution {
  const has = (d: Directive) => results.some((r) => r.directive === d);
  const mods = results.filter((r) => r.directive === "modify").length;
  const mergeNote =
    mods > 1 ? " একাধিক modify shallow-merge হয়; একই key-তে পরেরটা জেতে।" : "";
  if (has("block"))
    return {
      outcome: "⛔ Tool block হলো",
      why: "একটাও valid block থাকলে সেটা সব approve-কে হারায়, registration-ক্রম যাই হোক। Tool চলে না, তাই modify-এর কোনো প্রভাব নেই।",
    };
  if (has("approve"))
    return {
      outcome:
        mods > 0
          ? "🙋 Approval gate-এ গেল (modify করা args সহ)"
          : "🙋 Approval gate-এ গেল",
      why:
        "block নেই; approve থাকলে (একাধিক হলে প্রথম valid-টা) ব্যবহারকারীকে জিজ্ঞেস করা হয়।" +
        (mods > 0
          ? " Modify-এর merged args সাথে যায়, অনুমতি পেলে tool সেই args-এ চলে।"
          : "") +
        mergeNote,
    };
  if (mods > 0)
    return {
      outcome: "✏️ Args বদলে tool চলল",
      why: (mods > 1 ? "" : "Modify directive প্রয়োগ হলো।") + mergeNote,
    };
  return { outcome: "✅ Tool যেমন আছে তেমন চলল", why: "কেউ আপত্তি করেনি।" };
}

export function stdinPayload(tool: string): string {
  const input =
    tool === "terminal" ? { command: "rm -rf build/" } : { path: "app.py" };
  return JSON.stringify(
    {
      hook_event_name: "pre_tool_call",
      tool_name: tool,
      tool_input: input,
      session_id: "sess_123",
      cwd: "/home/me/project",
      profile: "default",
      extra: { task_id: "t1", tool_call_id: "call_1" },
    },
    null,
    2,
  );
}
