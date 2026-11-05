import { ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Attack } from "./index";

export default function AttackRow({
  attack,
  blockedBy,
}: {
  attack: Attack;
  blockedBy: string | null;
}) {
  const Icon = blockedBy ? ShieldCheck : ShieldAlert;
  return (
    <li
      className={cn(
        "flex gap-2 rounded-lg border p-2 text-sm",
        blockedBy ? "border-green-600/50" : "border-red-600/50",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          blockedBy ? "text-green-600" : "text-red-600",
        )}
      />
      <div>
        <p className="font-medium">{attack.label}</p>
        <p className="text-xs text-muted-foreground">{attack.desc}</p>
        <p className="text-xs font-medium">
          {blockedBy
            ? `আটকানো হয়েছে: ${blockedBy}`
            : "সফল হয়ে গেল — কোনো layer আটকায়নি"}
        </p>
      </div>
    </li>
  );
}
