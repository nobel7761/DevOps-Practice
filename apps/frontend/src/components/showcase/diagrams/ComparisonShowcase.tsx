import {
  BeforeAfter,
  DownloadableSummaryCard,
} from "@/components/shared/diagram";
import { NodeRow } from "@/components/showcase/diagrams/NodeRow";

export function ComparisonShowcase() {
  return (
    <div className="flex flex-col gap-6">
      <BeforeAfter
        before={<NodeRow />}
        after={<NodeRow />}
        beforeNote="Placeholder note: user অপেক্ষা করে।"
        afterNote="Placeholder note: user সাথে সাথে উত্তর পায়।"
      />
      <DownloadableSummaryCard
        fileName="day-0-summary.png"
        dayLabel="Day 0"
        day={0}
        title="Summary card preview"
        definition="এক লাইনের সংজ্ঞা এখানে।"
        diagram={<NodeRow />}
        keyPoints={["Key point ১", "Key point ২", "Key point ৩"]}
      />
    </div>
  );
}
