import { Button } from "@/components/shared/shadcn";
import type { Exit, Task } from "./logic";

export default function TaskCard({
  task,
  onFinish,
  onUnblock,
}: {
  task: Task;
  onFinish: (id: number, exit: Exit) => void;
  onUnblock: (id: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-background p-2 text-xs">
      <p className="font-medium">
        #{task.id} {task.title}
      </p>
      {task.parents.length > 0 && (
        <p className="text-muted-foreground">
          parent: #{task.parents.join(", #")}
        </p>
      )}
      {task.failures > 0 && (
        <p className="text-muted-foreground">failures: {task.failures}</p>
      )}
      {task.status === "running" && (
        <div className="flex flex-wrap gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            onClick={() => onFinish(task.id, "complete")}
          >
            complete
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            onClick={() => onFinish(task.id, "fail1")}
          >
            exit 1
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            onClick={() => onFinish(task.id, "exit75")}
          >
            exit 75
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            onClick={() => onFinish(task.id, "exit78")}
          >
            exit 78
          </Button>
        </div>
      )}
      {task.status === "blocked" && (
        <Button
          size="sm"
          variant="outline"
          className="h-6 px-2 text-xs"
          onClick={() => onUnblock(task.id)}
        >
          unblock
        </Button>
      )}
    </div>
  );
}
