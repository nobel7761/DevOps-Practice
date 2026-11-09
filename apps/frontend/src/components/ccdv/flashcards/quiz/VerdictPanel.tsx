import { cn } from "@/lib/utils";

export type VerdictView =
  { kind: "correct" | "incorrect"; feedback: string } | { kind: "error" };

const STYLE = {
  correct: "border-green-600/60 bg-green-600/10",
  incorrect: "border-red-600/60 bg-red-600/10",
  error: "border-amber-500/60 bg-amber-500/10",
} as const;

export default function VerdictPanel({ verdict }: { verdict: VerdictView }) {
  return (
    <div
      role="status"
      className={cn("rounded-xl border p-3 text-sm", STYLE[verdict.kind])}
    >
      {verdict.kind === "correct" && (
        <>
          <p className="font-semibold">✅ সঠিক!</p>
          <p>{verdict.feedback}</p>
        </>
      )}
      {verdict.kind === "incorrect" && (
        <>
          <p className="font-semibold">❌ এখনো ঠিক হয়নি</p>
          <p>{verdict.feedback}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            উত্তর বদলে আবার Validate করো, অথবা card-এ ক্লিক করে আসল উত্তর দেখো।
          </p>
        </>
      )}
      {verdict.kind === "error" && (
        <>
          <p className="font-semibold">⚠️ এখন AI যাচাই করা যাচ্ছে না</p>
          <p>
            একটু পরে আবার চেষ্টা করো, অথবা card-এ ক্লিক করে নিজে উত্তর মিলিয়ে
            নাও।
          </p>
        </>
      )}
    </div>
  );
}
