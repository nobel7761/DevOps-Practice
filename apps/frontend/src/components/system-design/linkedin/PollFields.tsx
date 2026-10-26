import CopyButton from "@/components/shared/CopyButton";
import { pollStats } from "@/lib/system-design/linkedin/post";
import type { LinkedInPost } from "@/lib/system-design/validate-topic";

function PollField({
  label,
  text,
  length,
  limit,
  over,
}: {
  label: string;
  text: string;
  length: number;
  limit: number;
  over: boolean;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-2 text-sm">
      <span className="min-w-0 flex-1">
        <span className="text-xs text-muted-foreground">{label}: </span>
        {text}
      </span>
      <span
        className="text-xs tabular-nums"
        style={{ color: over ? "var(--sd-fail)" : "var(--muted-foreground)" }}
      >
        {over ? "✕ " : ""}
        {length}/{limit}
      </span>
      <CopyButton text={text} label="Copy" size="xs" />
    </li>
  );
}

/** LinkedIn's poll form takes the question and options separately, so each gets its own copy button. */
export function PollFields({
  poll,
}: {
  poll: NonNullable<LinkedInPost["poll"]>;
}) {
  const stats = pollStats(poll);
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">📊 Poll</span>
      <ul className="flex flex-col gap-2">
        <PollField label="প্রশ্ন" text={poll.question} {...stats.question} />
        {poll.options.map((option, i) => (
          <PollField
            key={i}
            label={`Option ${i + 1}`}
            text={option}
            {...stats.options[i]}
          />
        ))}
      </ul>
      <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3 text-sm">
        <span className="text-xs font-medium">
          পরের দিনের উত্তর (poll post-এ comment হিসেবে দিন)
        </span>
        <p className="whitespace-pre-wrap">{poll.answerComment}</p>
        <CopyButton
          text={poll.answerComment}
          label="উত্তর copy করুন"
          className="w-fit"
        />
      </div>
    </div>
  );
}
