import type { analyze } from "./logic";

export default function Result({ r }: { r: ReturnType<typeof analyze> }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-background/60 p-3 text-sm">
      <p>📌 Scope: {r.scope}</p>
      <p>
        {r.confirm
          ? "❓ Hermes আগে confirmation চাইবে (session বড়)।"
          : "✅ Confirmation prompt আসবে না।"}
      </p>
      {r.reReads === 0 ? (
        <p>💸 Cache miss নেই — model আসলে বদলায়নি।</p>
      ) : (
        <p>
          💸 Prompt cache model-এর সাথে বাঁধা → পুরো conversation (
          {r.reReadTokens.toLocaleString()} token মোট) full input price-এ আবার
          পড়া হবে
          {r.reReads === 2
            ? " (--once-এ যাওয়া আর ফেরা — দুইবার cache ভাঙে)।"
            : " (একবার)।"}
        </p>
      )}
    </div>
  );
}
