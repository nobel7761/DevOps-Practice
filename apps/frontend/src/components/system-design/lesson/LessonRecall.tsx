import { Brain } from "lucide-react";
import LessonComingSoon from "@/components/system-design/lesson/LessonComingSoon";
import LessonSection from "@/components/system-design/lesson/LessonSection";
import { RecallMapSection } from "@/components/system-design/recall/RecallMapSection";
import type { RecallMap } from "@/lib/system-design/validate-topic";

/** Section 16 "🧠 মনে আছে তো?". */
export default function LessonRecall({
  title,
  recall,
}: {
  title: string;
  recall?: RecallMap;
}) {
  if (!recall) {
    return (
      <LessonComingSoon
        section="recall"
        icon={Brain}
        title="Recall Map"
        description="এই topic-এর core point-গুলো এখনো লেখা হয়নি।"
      />
    );
  }
  return (
    <LessonSection section="recall">
      <RecallMapSection title={title} recall={recall} />
    </LessonSection>
  );
}
