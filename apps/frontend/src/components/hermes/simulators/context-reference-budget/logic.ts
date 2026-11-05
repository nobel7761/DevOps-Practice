export interface Ref {
  id: string;
  label: string;
  tokens: number;
  blocked?: boolean;
}

export type Verdict = "ok" | "soft" | "hard";

/** Example sizes only — real sizes depend on your files. */
export const REFS: Ref[] = [
  { id: "file", label: "@file:src/app.ts", tokens: 12000 },
  { id: "range", label: "@file:src/app.ts:10-40", tokens: 600 },
  { id: "folder", label: "@folder:src", tokens: 2500 },
  { id: "diff", label: "@diff", tokens: 4000 },
  { id: "staged", label: "@staged", tokens: 3000 },
  { id: "url", label: "@url:https://example.com/docs", tokens: 9000 },
  { id: "ssh", label: "@file:~/.ssh/id_rsa", tokens: 800, blocked: true },
];

/** @git:N is clamped to 1-10; ~1.5k example tokens per commit with patch. */
export const gitRef = (n: number): Ref => ({
  id: "git",
  label: `@git:${clampGit(n)}`,
  tokens: clampGit(n) * 1500,
});
export const clampGit = (n: number) => Math.min(10, Math.max(1, n));

export function evaluate(refs: Ref[], contextLength: number) {
  const counted = refs.filter((r) => !r.blocked);
  const used = counted.reduce((sum, r) => sum + r.tokens, 0);
  const ratio = used / contextLength;
  const verdict: Verdict =
    ratio >= 0.5 ? "hard" : ratio >= 0.25 ? "soft" : "ok";
  return { used, ratio, verdict, blocked: refs.filter((r) => r.blocked) };
}

export const VERDICT_TEXT: Record<Verdict, string> = {
  ok: "✅ ২৫%-এর নিচে — সব ঠিকঠাক expand হলো।",
  soft: "⚠️ Soft limit (২৫%) পেরিয়েছে — warning যোগ হয়ে expansion চলে।",
  hard: "⛔ Hard limit (৫০%) পেরিয়েছে — expansion refuse, তোমার মূল message অপরিবর্তিত ফেরত।",
};
