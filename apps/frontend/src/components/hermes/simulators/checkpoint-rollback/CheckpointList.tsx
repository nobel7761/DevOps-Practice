import { Button } from "@/components/shared/shadcn";
import type { Checkpoint } from "./logic";
import InlineCode from "../../lesson/InlineCode";

export default function CheckpointList({
  checkpoints,
  onRollback,
}: {
  checkpoints: Checkpoint[];
  onRollback: (id: number, all: boolean) => void;
}) {
  if (checkpoints.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        <InlineCode text="এখনো কোনো checkpoint নেই — `/rollback` কিছুই দেখাবে না।" />
      </p>
    );
  return (
    <ul className="flex flex-col gap-2">
      {checkpoints.map((c) => (
        <li
          key={c.id}
          className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2 text-sm"
        >
          <span className="min-w-0 flex-1">
            #{c.id} — {c.label}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRollback(c.id, false)}
          >
            /rollback {c.id}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRollback(c.id, true)}
          >
            /rollback {c.id} --all
          </Button>
        </li>
      ))}
    </ul>
  );
}
