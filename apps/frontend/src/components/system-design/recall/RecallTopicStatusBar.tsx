import { Badge } from "@/components/shared/shadcn";
import {
  topicRecallStatus,
  type RecallRecord,
} from "@/lib/system-design/recall/schedule";
import { STATUS_LABEL } from "./recall-colors";

export function RecallTopicStatusBar({ records }: { records: RecallRecord[] }) {
  const status = topicRecallStatus(records);
  const nextDue = records.map((r) => r.nextDue).sort()[0];
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Badge variant={status === "strong" ? "default" : "secondary"}>
        Recall: {STATUS_LABEL[status]}
      </Badge>
      {nextDue && <span>পরের review: {nextDue}</span>}
    </div>
  );
}
