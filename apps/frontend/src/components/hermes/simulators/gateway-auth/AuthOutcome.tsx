import InlineCode from "../../lesson/InlineCode";
import type { AuthResult } from "./logic";

const REACH = {
  allowed: "✅ বটের সাথে কথা বলতে পারে",
  "pairing-code": "🔑 Pairing code পেল (এখনো ঢুকতে পারেনি)",
  ignored: "🔇 Message ignore করা হলো",
} as const;
const CMD = {
  ran: "✅ Command চলল",
  refused: "⛔ Command চলল না",
  "n/a": "—",
} as const;

export default function AuthOutcome({ result }: { result: AuthResult }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="rounded-lg border border-border bg-background/60 p-3">
        <p className="font-medium">
          ধাপ ১ — বট পর্যন্ত পৌঁছানো: {REACH[result.reach]}
        </p>
        <p className="text-muted-foreground">
          <InlineCode text={result.reachWhy} />
        </p>
      </div>
      <div className="rounded-lg border border-border bg-background/60 p-3">
        <p className="font-medium">
          ধাপ ২ — Slash command: {CMD[result.command]}
        </p>
        <p className="text-muted-foreground">
          <InlineCode text={result.commandWhy} />
        </p>
      </div>
    </div>
  );
}
